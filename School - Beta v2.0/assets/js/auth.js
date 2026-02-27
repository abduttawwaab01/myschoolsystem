const Auth = {
    SESSION_KEY: 'mySchoolSession',
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000,
    
    RESTRICTABLE_FEATURES: {
        chat: 'Chat & Messaging',
        downloads: 'Data Export/Download',
        scores_entry: 'Score Entry',
        attendance_qr: 'QR Attendance Scanning',
        id_cards: 'ID Card Generation',
        finance: 'Finance Management',
        reports: 'Reports & Analytics',
        parent_portal: 'Parent Portal Access',
        multi_class: 'Multi-Class Management',
        sms: 'SMS Notifications',
        exams: 'Exams Management',
        question_bank: 'Question Bank',
        create_test: 'Create Test',
        test_results: 'Test Results',
        calendar_events: 'Calendar Events',
        print_export: 'Print & Export'
    },
    
    getNotifications(userId) {
        const notifications = Storage.getData('notifications') || [];
        return notifications.filter(n => n.userId === userId);
    },

    clearNotifications(userId) {
        let notifications = Storage.getData('notifications') || [];
        notifications = notifications.filter(n => n.userId !== userId);
        Storage.setData('notifications', notifications);
    },

    markAllNotificationsAsRead(userId) {
        let notifications = Storage.getData('notifications') || [];
        notifications.forEach(n => {
            if (n.userId === userId) n.read = true;
        });
        Storage.setData('notifications', notifications);
    },
    
    login(credentials) {
        const { email, password, schoolId } = credentials;
        
        const users = Storage.getData('users');
        const user = users.find(u => 
            (u.email === email || u.username === email) && 
            u.password === Storage.hashPassword(password)
        );
        
        if (!user) {
            return { success: false, message: 'Invalid email/username or password' };
        }
        
        if (user.status !== 'active') {
            return { success: false, message: 'Your account is not active' };
        }
        
        if (user.role !== 'super_admin') {
            if (user.role === 'school_admin' || user.role === 'teacher' || user.role === 'accountant' || user.role === 'director' || user.role === 'parent') {
                if (!schoolId || schoolId === '') {
                    return { success: false, message: 'Please select your school' };
                }
                const userSchoolId = String(user.schoolId);
                const selectedSchoolId = String(schoolId);
                if (userSchoolId !== selectedSchoolId) {
                    return { success: false, message: 'Invalid school selection. Your account is not associated with this school.' };
                }
            }
        }
        
        // Super admin can login with or without selecting a school
        // For other roles, verify school subscription if they have a schoolId
        
        // For non-super_admin users, verify school subscription if they have a schoolId
        if (user.role !== 'super_admin' && user.schoolId) {
            const schoolCheck = Storage.checkSchoolExpiration(user.schoolId);
            if (schoolCheck.expired) {
                return { 
                    success: false, 
                    message: 'School subscription has expired. Please contact the administrator to renew.',
                    expired: true,
                    schoolName: schoolCheck.school?.name
                };
            }
            
            if (schoolCheck.daysLeft && schoolCheck.daysLeft <= 7) {
                return {
                    success: true,
                    user: null,
                    warning: true,
                    message: `School subscription expires in ${schoolCheck.daysLeft} days. Please renew soon.`,
                    schoolId: user.schoolId,
                    schoolName: schoolCheck.school?.name
                };
            }
        }
        
        const session = {
            userId: user.id,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                schoolId: user.schoolId,
                avatar: user.avatar,
                phone: user.phone
            },
            schoolId: user.schoolId,
            loginAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + this.SESSION_TIMEOUT).toISOString()
        };
        
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        
        this.logActivity(user.id, 'login', 'User logged in');
        
        return { success: true, user: session.user };
    },

    logActivity(userId, type, description) {
        const activities = Storage.getData('activities') || [];
        activities.push({
            id: Storage.generateId(),
            userId: userId,
            type: type,
            description: description,
            timestamp: new Date().toISOString()
        });
        Storage.setData('activities', activities);
    },

    addNotification(userId, message, type = 'info') {
        const notifications = Storage.getData('notifications') || [];
        notifications.unshift({
            id: Storage.generateId(),
            userId: userId,
            message: message,
            type: type,
            read: false,
            createdAt: new Date().toISOString()
        });
        Storage.setData('notifications', notifications);
    },
    
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        window.location.href = '../login.html';
    },
    
    getSession() {
        const sessionJson = localStorage.getItem(this.SESSION_KEY);
        if (!sessionJson) return null;
        
        const session = JSON.parse(sessionJson);
        
        if (new Date(session.expiresAt) < new Date()) {
            this.logout();
            return null;
        }
        
        return session;
    },
    
    isAuthenticated() {
        return this.getSession() !== null;
    },
    
    getCurrentUser() {
        const session = this.getSession();
        return session ? session.user : null;
    },
    
    getCurrentSchoolId() {
        // Allow override for Super Admin viewing/editing school
        if (window.superAdminSchoolIdOverride) {
            return window.superAdminSchoolIdOverride;
        }
        const session = this.getSession();
        return session ? session.schoolId : null;
    },
    
    setSchoolIdOverride(schoolId) {
        window.superAdminSchoolIdOverride = schoolId;
    },
    
    clearSchoolIdOverride() {
        window.superAdminSchoolIdOverride = null;
    },
    
    hasRole(roles) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        if (typeof roles === 'string') {
            return user.role === roles;
        }
        
        return roles.includes(user.role);
    },
    
    hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        const permissions = {
            super_admin: ['all'],
            school_admin: ['manage_students', 'manage_teachers', 'manage_finance', 'view_reports', 'manage_attendance', 'generate_id_cards'],
            teacher: ['manage_students', 'manage_attendance', 'input_scores', 'view_reports'],
            accountant: ['manage_finance', 'view_reports'],
            director: ['view_all', 'view_reports', 'approve_finance']
        };
        
        const userPermissions = permissions[user.role] || [];
        return userPermissions.includes('all') || userPermissions.includes(permission);
    },
    
    hasFeature(feature) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        if (user.role === 'super_admin') return true;
        
        const school = this.getSchool();
        if (!school) return true;
        
        const restrictions = school.restrictions || {};
        const disabledFeatures = restrictions.disabled_features || [];
        
        return !disabledFeatures.includes(feature);
    },
    
    getSchoolRestrictions(schoolId) {
        const schools = Storage.getData('schools') || [];
        const school = schools.find(s => s.id === schoolId);
        return school ? (school.restrictions || { disabled_features: [] }) : { disabled_features: [] };
    },
    
    updateSchoolRestrictions(schoolId, restrictions) {
        const schools = Storage.getData('schools') || [];
        const schoolIndex = schools.findIndex(s => s.id === schoolId);
        
        if (schoolIndex === -1) return { success: false, message: 'School not found' };
        
        const user = this.getCurrentUser();
        
        schools[schoolIndex].restrictions = {
            ...restrictions,
            restricted_by: user ? user.id : 'system',
            restricted_since: new Date().toISOString()
        };
        
        Storage.setData('schools', schools);
        return { success: true, message: 'Restrictions updated successfully' };
    },
    
    checkAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },
    
    checkRole(allowedRoles) {
        if (!this.checkAuth()) return;
        
        const user = this.getCurrentUser();
        if (!allowedRoles.includes(user.role)) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },
    
    registerSchool(data) {
        const { activationCode, schoolName, schoolAlias, schoolEmail, schoolPhone, schoolAddress, schoolType, currency, adminName, adminUsername, adminEmail, adminPhone, adminPassword } = data;
        
        const validation = Storage.validateActivationCode(activationCode);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }
        
        const existingSchools = Storage.getSchools();
        if (existingSchools.some(s => s.name.toLowerCase() === schoolName.toLowerCase())) {
            return { success: false, message: 'School with this name already exists' };
        }
        
        const schoolId = Storage.generateId();
        
        const subscriptionDays = validation.code.subscriptionDays || 365;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + subscriptionDays);
        
        const school = {
            id: schoolId,
            name: schoolName,
            alias: schoolAlias || schoolName.substring(0, 3).toUpperCase(),
            email: schoolEmail,
            phone: schoolPhone,
            address: schoolAddress,
            type: schoolType,
            currency: currency,
            status: 'active',
            activationCodeId: validation.code.id,
            createdAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString(),
            subscriptionDays: subscriptionDays,
            settings: {
                classes: Storage.getClassesBySchoolType(schoolType),
                subjects: Storage.getSubjectsBySchoolType(schoolType),
                scoreTypes: Storage.SCORE_TYPES
            },
            restrictions: {
                disabled_features: [],
                max_students: null,
                max_staff: null,
                restriction_note: ''
            }
        };
        
        Storage.addItem('schools', school);
        
        const adminUser = {
            id: Storage.generateId(),
            name: adminName,
            username: adminUsername,
            email: adminEmail,
            phone: adminPhone,
            password: Storage.hashPassword(adminPassword),
            role: 'school_admin',
            schoolId: schoolId,
            status: 'active',
            createdAt: new Date().toISOString(),
            avatar: null
        };
        
        Storage.addItem('users', adminUser);
        
        Storage.useActivationCode(validation.code.id, schoolId);
        
        return { success: true, message: 'School registered successfully', school };
    },
    
    registerUser(userData) {
        const { name, email, phone, username, password, role, schoolId, className } = userData;
        
        const users = Storage.getData('users');
        if (users.some(u => u.email === email)) {
            return { success: false, message: 'Email already exists' };
        }
        if (users.some(u => u.username === username)) {
            return { success: false, message: 'Username already exists' };
        }
        
        const user = {
            name,
            email,
            phone,
            username,
            password: Storage.hashPassword(password),
            role,
            schoolId,
            className: className || null,
            status: 'active',
            avatar: null
        };
        
        const savedUser = Storage.addItem('users', user);
        
        if (role === 'teacher') {
            const teacherProfile = {
                id: Storage.generateId(),
                userId: savedUser.id,
                schoolId,
                name,
                email,
                phone,
                classes: [],
                subjects: [],
                createdAt: new Date().toISOString()
            };
            Storage.addItem('teachers', teacherProfile);
        }
        
        if (role === 'student') {
            const studentId = Storage.generateUniqueId('STU');
            const student = {
                id: studentId,
                userId: savedUser.id,
                schoolId,
                name,
                email,
                phone,
                class: className,
                status: 'active',
                enrollmentDate: new Date().toISOString()
            };
            Storage.addItem('students', student);
        }
        
        return { success: true, message: 'User registered successfully', user: savedUser };
    },
    
    updateProfile(userId, updates) {
        const users = Storage.getData('users');
        const index = users.findIndex(u => u.id === userId);
        
        if (index === -1) {
            return { success: false, message: 'User not found' };
        }
        
        if (updates.password) {
            updates.password = Storage.hashPassword(updates.password);
        }
        
        const updatedUser = Storage.updateItem('users', userId, updates);
        
        const session = this.getSession();
        if (session && session.userId === userId) {
            session.user = { ...session.user, ...updates };
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        }
        
        return { success: true, message: 'Profile updated successfully', user: updatedUser };
    },
    
    changePassword(userId, oldPassword, newPassword) {
        const user = Storage.getItemById('users', userId);
        
        if (!user || user.password !== Storage.hashPassword(oldPassword)) {
            return { success: false, message: 'Current password is incorrect' };
        }
        
        const updatedUser = Storage.updateItem('users', userId, {
            password: Storage.hashPassword(newPassword)
        });
        
        return { success: true, message: 'Password changed successfully' };
    },
    
    getSchool() {
        const session = this.getSession();
        if (!session) return null;
        
        if (session.user.role === 'super_admin') {
            return { id: null, name: 'Super Admin', type: 'super_admin' };
        }
        
        return Storage.getSchoolById(session.schoolId);
    }
};

const StudentAuth = {
    SESSION_KEY: 'mySchoolStudentSession',
    
    login(studentIdOrUsername, password, schoolId) {
        const students = Storage.getStudents(schoolId);
        
        // Find student by ID or username
        const student = students.find(s => 
            s.id === studentIdOrUsername || 
            (s.username && s.username.toLowerCase() === studentIdOrUsername.toLowerCase())
        );
        
        if (!student) {
            return { success: false, message: 'Invalid Student ID or Username' };
        }
        
        if (student.status !== 'active') {
            return { success: false, message: 'Your account is not active' };
        }
        
        // Check password (default is student ID if not set)
        const storedPassword = student.password || student.id;
        const hashedInput = Storage.hashPassword(password);
        
        if (storedPassword !== hashedInput && storedPassword !== password) {
            return { success: false, message: 'Invalid password' };
        }
        
        // Create session
        const session = {
            userId: student.id,
            user: {
                id: student.id,
                name: student.name,
                email: student.email || '',
                role: 'student',
                schoolId: schoolId,
                class: student.class
            },
            schoolId: schoolId,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        
        return { success: true, message: 'Login successful' };
    },
    
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        window.location.href = '../student-login.html';
    },
    
    isAuthenticated() {
        const session = localStorage.getItem(this.SESSION_KEY);
        return session !== null;
    },
    
    getCurrentUser() {
        const session = localStorage.getItem(this.SESSION_KEY);
        if (!session) return null;
        return JSON.parse(session);
    },
    
    getCurrentSchoolId() {
        const session = this.getCurrentUser();
        return session ? session.schoolId : null;
    },
    
    getCurrentStudent() {
        const session = this.getCurrentUser();
        if (!session) return null;
        
        const students = Storage.getStudents(session.schoolId);
        return students.find(s => s.id === session.userId);
    },
    
    showForgotPassword() {
        const modal = document.getElementById('forgotPasswordModal');
        if (modal) {
            modal.classList.add('active');
        }
    },
    
    resetPassword() {
        const studentId = document.getElementById('resetStudentId').value.trim();
        const newPassword = document.getElementById('resetNewPassword').value;
        const confirmPassword = document.getElementById('resetConfirmPassword').value;
        const schoolId = document.getElementById('schoolSelect').value;
        
        if (!studentId || !newPassword || !confirmPassword) {
            Toast.error('Please fill all fields');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            Toast.error('Passwords do not match');
            return;
        }
        
        if (newPassword.length < 4) {
            Toast.error('Password must be at least 4 characters');
            return;
        }
        
        const students = Storage.getStudents(schoolId);
        const student = students.find(s => s.id === studentId);
        
        if (!student) {
            Toast.error('Student ID not found');
            return;
        }
        
        // Update password with hashing
        const hashedPassword = Storage.hashPassword(newPassword);
        Storage.updateItem('students', studentId, {
            password: hashedPassword
        });
        
        Toast.success('Password reset successfully! You can now login.');
        Modal.hide('forgotPasswordModal');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const publicPages = ['index.html', 'login.html', 'register-school.html', 'student-login.html', 'parent-login.html'];
    const publicPaths = ['pages/student.html', 'pages/parent.html', 'parent.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const currentPath = window.location.pathname;
    
    // Check if current path is a protected dashboard
    const isProtectedPage = publicPaths.some(path => currentPath.endsWith(path));
    
    if (isProtectedPage) {
        // For student/parent pages, check their specific auth
        if (currentPath.endsWith('pages/student.html') && !StudentAuth.isAuthenticated()) {
            window.location.href = '../student-login.html';
            return;
        }
        if ((currentPath.endsWith('pages/parent.html') || currentPath.endsWith('parent.html')) && !Auth.isAuthenticated()) {
            window.location.href = currentPath.endsWith('pages/parent.html') ? '../parent-login.html' : './parent-login.html';
            return;
        }
        return;
    }
    
    if (!publicPages.includes(currentPage) && !Auth.isAuthenticated()) {
        window.location.href = 'login.html';
    }
});

window.Auth = Auth;
