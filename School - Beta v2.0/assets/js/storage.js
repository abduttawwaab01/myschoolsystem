const Storage = {
    DB_NAME: 'mySchoolDB',
    useCloudSync: false,
    cloudSyncReady: false,
    
    init() {
        console.log('Storage initializing...');
        
        // Initialize localStorage
        if (!localStorage.getItem(this.DB_NAME)) {
            const initialData = {
                systemSettings: {
                    theme: 'light',
                    primaryColor: '#16a34a',
                    secondaryColor: '#10b981',
                    fontFamily: 'Inter',
                    borderRadius: '12',
                    shadowIntensity: 'medium',
                    darkMode: false,
                    darkModeSystem: false
                },
                activationCodes: [],
                schools: [],
                users: [],
                students: [],
                attendance: [],
                scores: [],
                finance: [],
                chats: [],
                reports: [],
                helpContent: null,
                questions: [],
                tests: [],
                testResults: [],
                testAttempts: [],
                calendarEvents: []
            };
            localStorage.setItem(this.DB_NAME, JSON.stringify(initialData));
        }
        
        // Always ensure Super Admin user exists
        const users = this.getData('users') || [];
        if (!users.some(u => u.role === 'super_admin')) {
            this.seedSuperAdmin();
        }
        this.seedDefaultHelpContent();
        
        console.log('Storage initialized successfully');
    },
    
    saveDBLocal(data) {
        localStorage.setItem(this.DB_NAME, JSON.stringify(data));
    },
    
    DEFAULT_CLASSES: [
        'Nursery 1', 'Nursery 2',
        'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
        'JSS 1', 'JSS 2', 'JSS 3',
        'SS 1', 'SS 2', 'SS 3'
    ],
    
    DEFAULT_SUBJECTS: {
        'Nursery': ['Mathematics', 'English', 'Writing', 'Science', 'Art', 'Music', 'Physical Education'],
        'Primary': ['Mathematics', 'English', 'Basic Science', 'Social Studies', 'Religious Studies', 'Computer', 'Physical Education', 'French', 'Civic Education', 'Security Education'],
        'JSS': ['Mathematics', 'English', 'Basic Science', 'Social Studies', 'Religious Studies', 'Computer', 'Physical Education', 'French', 'Civic Education', 'Security Education', 'Home Economics', 'Agricultural Science'],
        'SS': ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Geography', 'Government', 'Economics', 'Literature', 'History', 'Religious Studies', 'Computer', 'Physical Education', 'French', 'Civic Education', 'Commerce', 'Accounting', 'Technical Drawing', 'Food & Nutrition']
    },
    
    SCORE_TYPES: ['Daily', 'Weekly', 'Mid-term', 'Exam'],
    
    getSubjectsBySchoolType(schoolType) {
        const subjects = {};
        if (schoolType === 'primary') {
            subjects['Nursery'] = [...this.DEFAULT_SUBJECTS['Nursery']];
            subjects['Primary'] = [...this.DEFAULT_SUBJECTS['Primary']];
            subjects['JSS'] = [...this.DEFAULT_SUBJECTS['JSS']];
        } else if (schoolType === 'secondary') {
            subjects['JSS'] = [...this.DEFAULT_SUBJECTS['JSS']];
            subjects['SS'] = [...this.DEFAULT_SUBJECTS['SS']];
        } else if (schoolType === 'both') {
            subjects['Nursery'] = [...this.DEFAULT_SUBJECTS['Nursery']];
            subjects['Primary'] = [...this.DEFAULT_SUBJECTS['Primary']];
            subjects['JSS'] = [...this.DEFAULT_SUBJECTS['JSS']];
            subjects['SS'] = [...this.DEFAULT_SUBJECTS['SS']];
        }
        return subjects;
    },
    
    getClassesBySchoolType(schoolType) {
        const classes = [];
        if (schoolType === 'primary') {
            classes.push('Nursery 1', 'Nursery 2');
            for (let i = 1; i <= 6; i++) classes.push(`Primary ${i}`);
            for (let i = 1; i <= 3; i++) classes.push(`JSS ${i}`);
        } else if (schoolType === 'secondary') {
            for (let i = 1; i <= 3; i++) classes.push(`JSS ${i}`);
            for (let i = 1; i <= 3; i++) classes.push(`SS ${i}`);
        } else if (schoolType === 'both') {
            classes.push('Nursery 1', 'Nursery 2');
            for (let i = 1; i <= 6; i++) classes.push(`Primary ${i}`);
            for (let i = 1; i <= 3; i++) classes.push(`JSS ${i}`);
            for (let i = 1; i <= 3; i++) classes.push(`SS ${i}`);
        }
        return classes;
    },
    
    DEFAULT_HELP_CONTENT: {
        super_admin: {
            title: 'Super Admin Guide',
            sections: [
                {
                    title: 'Getting Started',
                    icon: 'fa-rocket',
                    content: '<h4>Welcome to Super Admin Dashboard</h4><p>As a Super Admin, you have full control over the entire My School system. You can manage schools, activation codes, system settings, and help content.</p><h5>Key Responsibilities:</h5><ul><li>Generate and manage activation codes for schools</li><li>Approve and manage all registered schools</li><li>Configure global theme and system settings</li><li>Edit help content for all user roles</li><li>Monitor system-wide statistics</li></ul>'
                },
                {
                    title: 'Managing Schools',
                    icon: 'fa-school',
                    content: '<h4>School Management</h4><p>You can view all registered schools, monitor their subscription status, and manage their details.</p><h5>Actions Available:</h5><ul><li><strong>View Schools:</strong> See all registered schools and their details</li><li><strong>Renew Subscription:</strong> Extend school subscription periods</li><li><strong>Delete School:</strong> Remove a school and all its data (use with caution)</li></ul><p>School subscriptions are managed through activation codes. Each code has a specific validity period.</p>'
                },
                {
                    title: 'Activation Codes',
                    icon: 'fa-key',
                    content: '<h4>Activation Code Management</h4><p>Activation codes are required for schools to register on the platform.</p><h5>Code Features:</h5><ul><li>Each code has a unique identifier</li><li>Codes can be set with custom subscription days</li><li>Codes expire after the specified period</li><li>Used codes are marked and linked to schools</li></ul><h5>Best Practices:</h5><ul><li>Generate codes only when needed</li><li>Keep track of issued codes</li><li>Clear unused codes periodically</li></ul>'
                },
                {
                    title: 'Theme Settings',
                    icon: 'fa-palette',
                    content: '<h4>Global Theme Configuration</h4><p>Customize the look and feel of the entire system.</p><h5>Available Options:</h5><ul><li><strong>Primary Color:</strong> Main color for buttons and highlights</li><li><strong>Font Family:</strong> Choose from available fonts</li><li><strong>Border Radius:</strong> Adjust corner roundness</li><li><strong>Dark Mode:</strong> Toggle dark theme</li></ul><p>Changes apply globally across all user dashboards.</p>'
                }
            ]
        },
        school_admin: {
            title: 'School Admin Guide',
            sections: [
                {
                    title: 'Dashboard Overview',
                    icon: 'fa-tachometer-alt',
                    content: '<h4>Welcome to Your School Dashboard</h4><p>As a School Admin, you manage all aspects of your school including students, staff, attendance, scores, and finances.</p><h5>Quick Stats:</h5><ul><li><strong>Students:</strong> Total enrolled students</li><li><strong>Teachers:</strong> Active teaching staff</li><li><strong>Balance:</strong> Current financial status</li><li><strong>Attendance:</strong> Today\'s attendance rate</li></ul>'
                },
                {
                    title: 'Student Management',
                    icon: 'fa-users',
                    content: '<h4>Managing Students</h4><p>Add, edit, and manage student records efficiently.</p><h5>Features:</h5><ul><li><strong>Add Student:</strong> Manual entry of student details</li><li><strong>Import CSV:</strong> Bulk import students from CSV file</li><li><strong>Export:</strong> Download student data as CSV</li><li><strong>View Details:</strong> Access individual student information</li></ul><h5>CSV Format:</h5><p>Required columns: name, class<br>Optional: email, phone, gender, dob, parentname, parentphone</p>'
                },
                {
                    title: 'Staff Management',
                    icon: 'fa-user-tie',
                    content: '<h4>Managing Staff Members</h4><p>Create login accounts for teachers, accountants, and directors.</p><h5>Staff Roles:</h5><ul><li><strong>Teachers:</strong> Can take attendance, add scores, manage students</li><li><strong>Accountants:</strong> Manage financial transactions</li><li><strong>Directors:</strong> Full access to school data and reports</li></ul><h5>Creating Staff:</h5><p>Each staff member needs: Name, Username, Email, Phone, Password</p>'
                },
                {
                    title: 'Classes & Subjects',
                    icon: 'fa-book',
                    content: '<h4>Configuring Classes and Subjects</h4><p>Customize which classes and subjects your school offers.</p><h5>Available Classes:</h5><ul><li>Nursery 1-2</li><li>Primary 1-6</li><li>JSS 1-3</li><li>SS 1-3</li></ul><h5>Subjects:</h5><p>Nigerian curriculum subjects are pre-loaded. Enable only those your school teaches.</p>'
                },
                {
                    title: 'Score Settings',
                    icon: 'fa-cog',
                    content: '<h4>Score Types Configuration</h4><p>Choose which assessment types your school uses.</p><h5>Available Types:</h5><ul><li><strong>Daily:</strong> Daily class tests</li><li><strong>Weekly:</strong> Weekly tests (typically Friday)</li><li><strong>Mid-term:</strong> Mid-term examinations</li><li><strong>Exam:</strong> End of term examinations</li></ul><p>Enable only the types your school records.</p>'
                },
                {
                    title: 'Attendance',
                    icon: 'fa-qrcode',
                    content: '<h4>Attendance Management</h4><p>Track student attendance with multiple methods.</p><h5>Methods:</h5><ul><li><strong>Manual:</strong> Select class and mark students present/absent</li><li><strong>QR Scan:</strong> Scan student ID cards for quick attendance</li><li><strong>Mark All:</strong> Quickly mark entire class present</li></ul><h5>Best Practices:</h5><ul><li>Take attendance at the same time daily</li><li>Use QR scanning for efficiency</li><li>Review attendance summaries regularly</li></ul>'
                },
                {
                    title: 'Finance',
                    icon: 'fa-wallet',
                    content: '<h4>Financial Management</h4><p>Track school income and expenses.</p><h5>Features:</h5><ul><li><strong>Add Transaction:</strong> Record income or expenses</li><li><strong>Categories:</strong> Tuition, Books, Salary, Utilities, etc.</li><li><strong>Reports:</strong> View financial summaries</li></ul><h5>Categories:</h5><ul><li>Income: Tuition, Registration, Donations</li><li>Expenses: Salaries, Utilities, Maintenance</li></ul>'
                },
                {
                    title: 'ID Cards',
                    icon: 'fa-id-card',
                    content: '<h4>ID Card Generation</h4><p>Generate and print ID cards for students and staff.</p><h5>Features:</h5><ul><li>Auto-generated QR codes for attendance</li><li>Download as image</li><li>Print directly</li></ul><h5>Card Includes:</h5><ul><li>Name and photo placeholder</li><li>Unique ID number</li><li>QR code for scanning</li><li>Issue and expiry dates</li></ul>'
                }
            ]
        },
        teacher: {
            title: 'Teacher Guide',
            sections: [
                {
                    title: 'Dashboard Overview',
                    icon: 'fa-tachometer-alt',
                    content: '<h4>Welcome, Teacher!</h4><p>Your dashboard provides quick access to students, attendance, scores, and communication tools.</p><h5>Quick Actions:</h5><ul><li>View your assigned students</li><li>Take daily attendance</li><li>Record student scores</li><li>Chat with colleagues</li></ul>'
                },
                {
                    title: 'Managing Students',
                    icon: 'fa-users',
                    content: '<h4>Student Management</h4><p>View and add students to your classes.</p><h5>Features:</h5><ul><li><strong>View Students:</strong> See all students in your assigned class</li><li><strong>Add Student:</strong> Add new students manually</li><li><strong>Import CSV:</strong> Bulk import students</li></ul><h5>Student Details:</h5><p>Each student record includes: Name, Class, Contact info, Parent details</p>'
                },
                {
                    title: 'Taking Attendance',
                    icon: 'fa-clipboard-check',
                    content: '<h4>Attendance Procedures</h4><p>Mark student attendance daily.</p><h5>Steps:</h5><ol><li>Select your class from the dropdown</li><li>Choose today\'s date</li><li>Click "Load" to see student list</li><li>Click on each student to toggle present/absent</li><li>Use "Mark All Present" for quick marking</li></ol><h5>QR Scanning:</h5><p>Enter student ID or scan their ID card for quick attendance.</p>'
                },
                {
                    title: 'Recording Scores',
                    icon: 'fa-star',
                    content: '<h4>Score Entry</h4><p>Record student test and exam scores.</p><h5>Steps:</h5><ol><li>Select class and subject</li><li>Choose term and year</li><li>Click "Load" to see students</li><li>Click "Add Score" to enter marks</li></ol><h5>Score Types:</h5><p>Depending on school settings: Daily, Weekly, Mid-term, Exam</p>'
                },
                {
                    title: 'Communication',
                    icon: 'fa-comments',
                    content: '<h4>Chat System</h4><p>Communicate with other staff members.</p><h5>Features:</h5><ul><li>Direct messaging</li><li>Group chats</li><li>File sharing</li><li>Voice messages</li><li>Emoji support</li></ul>'
                }
            ]
        },
        director: {
            title: 'Director Guide',
            sections: [
                {
                    title: 'Dashboard Overview',
                    icon: 'fa-tachometer-alt',
                    content: '<h4>Welcome, Director!</h4><p>As a Director, you have comprehensive access to monitor and manage school operations.</p><h5>Overview Statistics:</h5><ul><li>Total students and teachers</li><li>Financial balance</li><li>Attendance rates</li></ul>'
                },
                {
                    title: 'Student Management',
                    icon: 'fa-users',
                    content: '<h4>Student Oversight</h4><p>View and manage all students in the school.</p><h5>Capabilities:</h5><ul><li>View all student records</li><li>Add new students</li><li>Import students via CSV</li><li>Export student data</li></ul>'
                },
                {
                    title: 'Staff Overview',
                    icon: 'fa-user-tie',
                    content: '<h4>Staff Management</h4><p>View all teaching and administrative staff.</p><h5>Information Available:</h5><ul><li>Staff names and roles</li><li>Contact information</li><li>Assignments</li></ul>'
                },
                {
                    title: 'Reports',
                    icon: 'fa-file-alt',
                    content: '<h4>Reports & Analytics</h4><p>Generate comprehensive school reports.</p><h5>Report Types:</h5><ul><li>Student performance reports</li><li>Attendance summaries</li><li>Financial reports</li><li>Term reports</li></ul>'
                },
                {
                    title: 'Finance Overview',
                    icon: 'fa-wallet',
                    content: '<h4>Financial Monitoring</h4><p>Monitor school financial status.</p><h5>View:</h5><ul><li>Total income</li><li>Total expenses</li><li>Current balance</li><li>Transaction history</li></ul>'
                }
            ]
        },
        accountant: {
            title: 'Accountant Guide',
            sections: [
                {
                    title: 'Dashboard Overview',
                    icon: 'fa-tachometer-alt',
                    content: '<h4>Welcome, Accountant!</h4><p>Your dashboard focuses on financial management and reporting.</p><h5>Key Metrics:</h5><ul><li>Total income</li><li>Total expenses</li><li>Current balance</li></ul>'
                },
                {
                    title: 'Finance Management',
                    icon: 'fa-wallet',
                    content: '<h4>Managing Finances</h4><p>Record and track all financial transactions.</p><h5>Transaction Types:</h5><ul><li><strong>Income:</strong> Tuition, Registration fees, Donations, Other income</li><li><strong>Expenses:</strong> Salaries, Utilities, Maintenance, Supplies, Other expenses</li></ul><h5>Adding Transactions:</h5><ol><li>Click "Add Transaction"</li><li>Select type (Income/Expense)</li><li>Enter amount and description</li><li>Choose category</li><li>Save</li></ol>'
                },
                {
                    title: 'Reports',
                    icon: 'fa-file-alt',
                    content: '<h4>Financial Reports</h4><p>Generate and export financial reports.</p><h5>Available Reports:</h5><ul><li>Income statements</li><li>Expense reports</li><li>Balance summaries</li><li>Transaction history</li></ul><h5>Export Options:</h5><ul><li>CSV format for spreadsheet analysis</li><li>PDF reports (coming soon)</li></ul>'
                }
            ]
        },
        parent: {
            title: 'Parent Portal Guide',
            sections: [
                {
                    title: 'Getting Started',
                    icon: 'fa-rocket',
                    content: '<h4>Welcome to Parent Portal!</h4><p>This portal allows you to monitor your child\'s academic progress, view report cards, check attendance, and communicate with teachers.</p><h5>What you can do:</h5><ul><li>View your child\'s report cards</li><li>Check attendance records</li><li>View academic performance</li><li>Contact teachers</li><li>Contact the principal</li><li>Download reports</li></ul>'
                },
                {
                    title: 'Viewing Report Cards',
                    icon: 'fa-file-alt',
                    content: '<h4>How to View Report Cards</h4><ol><li>Select your child from the dropdown on the dashboard</li><li>Click "Report Card" in the menu</li><li>Select the term and year</li><li>View the complete report card with all subjects and scores</li></ol><h5>Export Options:</h5><ul><li><strong>PDF:</strong> Click "Export PDF" to download a printable version</li><li><strong>CSV:</strong> Click "Export CSV" for spreadsheet format</li></ul>'
                },
                {
                    title: 'Checking Attendance',
                    icon: 'fa-calendar-check',
                    content: '<h4>View Attendance Records</h4><ol><li>Select your child from the dashboard</li><li>Click "Attendance" in the menu</li><li>View the attendance summary and daily records</li></ol><h5>Understanding the Data:</h5><ul><li>Shows total days, present days, and absent days</li><li>Displays attendance percentage</li><li>Recent attendance history is shown in the table</li></ul>'
                },
                {
                    title: 'Contacting School',
                    icon: 'fa-comments',
                    content: '<h4>Communicating with Teachers</h4><p>You can send messages to your child\'s teacher or the school principal.</p><ol><li>Click "Contact School" in the menu</li><li>Choose to contact the teacher or principal</li><li>Enter a subject and your message</li><li>Click "Send Message"</li></ol><p>Your message will be delivered to the appropriate staff member.</p>'
                },
                {
                    title: 'Troubleshooting',
                    icon: 'fa-question-circle',
                    content: '<h4>Common Issues and Solutions</h4><h5>Can\'t see my child:</h5><p>Contact the school admin to link your account to your child\'s profile.</p><h5>Can\'t login:</h5><p>Check your credentials and make sure you selected the correct school. Contact the school if you forgot your password.</p><h5>Report card shows no scores:</h5><p>Scores are entered by teachers. Contact the teacher or school if you have concerns about missing scores.</p>'
                }
            ]
        }
    },
    
    seedDefaultHelpContent() {
        const db = this.getDB();
        db.helpContent = this.DEFAULT_HELP_CONTENT;
        this.saveDB(db);
    },
    
    getHelpContent(role) {
        const db = this.getDB();
        if (!db.helpContent) {
            db.helpContent = this.DEFAULT_HELP_CONTENT;
            this.saveDB(db);
        }
        return db.helpContent[role] || this.DEFAULT_HELP_CONTENT[role];
    },
    
    getAllHelpContent() {
        const db = this.getDB();
        if (!db.helpContent) {
            db.helpContent = this.DEFAULT_HELP_CONTENT;
            this.saveDB(db);
        }
        return db.helpContent;
    },
    
    updateHelpContent(role, content) {
        const db = this.getDB();
        if (!db.helpContent) {
            db.helpContent = this.DEFAULT_HELP_CONTENT;
        }
        db.helpContent[role] = content;
        this.saveDB(db);
        return true;
    },
    
    updateHelpSection(role, sectionIndex, sectionData) {
        const db = this.getDB();
        if (!db.helpContent) {
            db.helpContent = this.DEFAULT_HELP_CONTENT;
        }
        if (db.helpContent[role] && db.helpContent[role].sections[sectionIndex]) {
            db.helpContent[role].sections[sectionIndex] = sectionData;
            this.saveDB(db);
            return true;
        }
        return false;
    },
    
    addHelpSection(role, sectionData) {
        const db = this.getDB();
        if (!db.helpContent) {
            db.helpContent = this.DEFAULT_HELP_CONTENT;
        }
        if (db.helpContent[role]) {
            db.helpContent[role].sections.push(sectionData);
            this.saveDB(db);
            return true;
        }
        return false;
    },
    
    deleteHelpSection(role, sectionIndex) {
        const db = this.getDB();
        if (!db.helpContent) {
            db.helpContent = this.DEFAULT_HELP_CONTENT;
        }
        if (db.helpContent[role] && db.helpContent[role].sections.length > sectionIndex) {
            db.helpContent[role].sections.splice(sectionIndex, 1);
            this.saveDB(db);
            return true;
        }
        return false;
    },
    
    getDB() {
        return JSON.parse(localStorage.getItem(this.DB_NAME) || '{}');
    },
    
    saveDB(data) {
        this.saveDBLocal(data);
    },
    
    getData(key) {
        const db = this.getDB();
        return db[key] || [];
    },
    
    setData(key, value) {
        const db = this.getDB();
        db[key] = value;
        this.saveDBLocal(db);
    },
    
    addItem(key, item) {
        const data = this.getData(key);
        if (!item.id) {
            item.id = this.generateId();
        }
        if (!item.createdAt) {
            item.createdAt = new Date().toISOString();
        }
        item.updatedAt = new Date().toISOString();
        data.push(item);
        this.setData(key, data);
        return item;
    },
    
    updateItem(key, id, updates) {
        const data = this.getData(key);
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
            this.setData(key, data);
            return data[index];
        }
        return null;
    },
    
    deleteItem(key, id) {
        const data = this.getData(key);
        const filtered = data.filter(item => item.id !== id);
        this.setData(key, filtered);
    },
    
    getItemById(key, id) {
        const data = this.getData(key);
        return data.find(item => item.id === id);
    },
    
    generateId() {
        return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },
    
    generateUniqueId(prefix = 'ID') {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substr(2, 5).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    },
    
    seedSuperAdmin() {
        const superAdmin = {
            id: 'sa_001',
            name: 'Odebunmi Tawwāb',
            email: 'odebunmitawwab123@gmail.com',
            phone: '+2349033460322',
            username: 'abduttawwab',
            password: this.hashPassword('Successor1*'),
            role: 'super_admin',
            schoolId: null,
            status: 'active',
            createdAt: new Date().toISOString(),
            avatar: null,
            settings: {
                darkMode: false,
                darkModeSystem: false
            }
        };
        
        const db = this.getDB();
        db.users = [superAdmin];
        this.saveDB(db);
    },
    
    generateActivationCode() {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `ACT-${dateStr}-${random}`;
    },
    
    generateMultipleCodes(count) {
        const codes = [];
        for (let i = 0; i < count; i++) {
            codes.push({
                id: this.generateId(),
                code: this.generateActivationCode(),
                schoolId: null,
                isUsed: false,
                isRevoked: false,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString(),
                createdBy: Auth.getCurrentUser()?.id || 'sa_001',
                usedAt: null,
                usedBySchool: null
            });
        }
        
        const existing = this.getData('activationCodes');
        const all = [...existing, ...codes];
        this.setData('activationCodes', all);
        
        return codes;
    },
    
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    },
    
    encryptData(data) {
        const jsonString = JSON.stringify(data);
        return btoa(unescape(encodeURIComponent(jsonString)));
    },
    
    decryptData(encryptedData) {
        try {
            return JSON.parse(decodeURIComponent(escape(atob(encryptedData))));
        } catch (e) {
            return null;
        }
    },
    
    filterData(key, filters) {
        const data = this.getData(key);
        return data.filter(item => {
            for (const [key, value] of Object.entries(filters)) {
                if (value && item[key] !== value) {
                    return false;
                }
            }
            return true;
        });
    },
    
    searchData(key, query, searchFields = ['name', 'email']) {
        const data = this.getData(key);
        const lowerQuery = query.toLowerCase();
        return data.filter(item => {
            return searchFields.some(field => {
                const value = item[field];
                return value && value.toString().toLowerCase().includes(lowerQuery);
            });
        });
    },
    
    paginateData(data, page = 1, limit = 20) {
        const start = (page - 1) * limit;
        const end = start + limit;
        return {
            data: data.slice(start, end),
            total: data.length,
            page,
            limit,
            totalPages: Math.ceil(data.length / limit)
        };
    },
    
    getSystemSettings() {
        const db = this.getDB();
        return db.systemSettings || {};
    },
    
    updateSystemSettings(settings) {
        const db = this.getDB();
        db.systemSettings = { ...db.systemSettings, ...settings };
        this.saveDB(db);
    },
    
    getAnnouncement() {
        const settings = this.getSystemSettings();
        return settings.announcement || null;
    },
    
    setAnnouncement(message, isActive = true) {
        const settings = this.getSystemSettings();
        settings.announcement = {
            message: message,
            isActive: isActive,
            updatedAt: new Date().toISOString()
        };
        this.updateSystemSettings(settings);
    },
    
    clearAnnouncement() {
        const settings = this.getSystemSettings();
        settings.announcement = null;
        this.updateSystemSettings(settings);
    },
    
    getParentAnnouncements(schoolId) {
        const announcements = this.getData('parentAnnouncements') || [];
        if (schoolId) {
            return announcements.filter(a => a.schoolId === schoolId && a.isActive);
        }
        return announcements.filter(a => a.isActive);
    },
    
    addParentAnnouncement(message, schoolId, createdBy) {
        const announcements = this.getData('parentAnnouncements') || [];
        const announcement = {
            id: 'pann_' + this.generateId(),
            message: message,
            schoolId: schoolId,
            createdBy: createdBy,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        announcements.push(announcement);
        this.setData('parentAnnouncements', announcements);
        return announcement;
    },
    
    deleteParentAnnouncement(announcementId) {
        const announcements = this.getData('parentAnnouncements') || [];
        const index = announcements.findIndex(a => a.id === announcementId);
        if (index !== -1) {
            announcements[index].isActive = false;
            this.setData('parentAnnouncements', announcements);
        }
    },
    
    validateActivationCode(code) {
        const codes = this.getData('activationCodes');
        const validCode = codes.find(c => c.code === code && !c.isUsed && !c.isRevoked);
        
        if (!validCode) {
            return { valid: false, message: 'Invalid or already used activation code' };
        }
        
        if (new Date(validCode.expiresAt) < new Date()) {
            return { valid: false, message: 'Activation code has expired' };
        }
        
        return { valid: true, code: validCode };
    },
    
    useActivationCode(codeId, schoolId) {
        const codes = this.getData('activationCodes');
        const index = codes.findIndex(c => c.id === codeId);
        
        if (index !== -1) {
            codes[index].isUsed = true;
            codes[index].schoolId = schoolId;
            codes[index].usedAt = new Date().toISOString();
            codes[index].usedBySchool = schoolId;
            this.setData('activationCodes', codes);
            return true;
        }
        return false;
    },
    
    revokeActivationCode(codeId) {
        const codes = this.getData('activationCodes');
        const index = codes.findIndex(c => c.id === codeId);
        
        if (index !== -1) {
            codes[index].isRevoked = true;
            this.setData('activationCodes', codes);
            return true;
        }
        return false;
    },
    
    updateCodeExpiration(codeId, newExpiration) {
        const codes = this.getData('activationCodes');
        const index = codes.findIndex(c => c.id === codeId);
        
        if (index !== -1) {
            codes[index].expiresAt = newExpiration;
            this.setData('activationCodes', codes);
            return true;
        }
        return false;
    },
    
    getSchools() {
        return this.getData('schools');
    },
    
    updateSchool(id, updates) {
        return this.updateItem('schools', id, updates);
    },
    
    activateSchool(id, fromDate, toDate) {
        return this.updateItem('schools', id, {
            status: 'active',
            activationFrom: fromDate,
            activationTo: toDate
        });
    },
    
    deactivateSchool(id) {
        return this.updateItem('schools', id, { status: 'inactive' });
    },
    
    checkSchoolExpiration(id) {
        const school = this.getItemById('schools', id);
        if (!school || !school.activationTo) return { expired: false, daysLeft: null, school };
        const now = new Date();
        const expiry = new Date(school.activationTo);
        const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        return { expired: daysLeft < 0, daysLeft, school };
    },
    
    autoDeactivateExpiredSchools() {
        const schools = this.getData('schools');
        schools.forEach(school => {
            const check = this.checkSchoolExpiration(school.id);
            if (check.expired && school.status !== 'inactive') {
                this.deactivateSchool(school.id);
            }
        });
    },
    
    getSchoolById(id) {
        return this.getItemById('schools', id);
    },
    
    getCurrentAcademicYear(schoolId) {
        const school = this.getSchoolById(schoolId);
        if (school && school.currentYear) {
            return school.currentYear;
        }
        return new Date().getFullYear().toString();
    },
    
    getCurrentAcademicTerm(schoolId) {
        const school = this.getSchoolById(schoolId);
        if (school && school.currentTerm) {
            return school.currentTerm;
        }
        const month = new Date().getMonth();
        if (month >= 0 && month < 4) return 'First Term';
        if (month >= 4 && month < 8) return 'Second Term';
        return 'Third Term';
    },
    
    updateSchoolSettings(schoolId, settings) {
        const schools = this.getData('schools');
        const index = schools.findIndex(s => s.id === schoolId);
        if (index !== -1) {
            schools[index].settings = { ...schools[index].settings, ...settings };
            this.setData('schools', schools);
            return schools[index];
        }
        return null;
    },
    
    getSchoolClasses(schoolId) {
        const school = this.getSchoolById(schoolId);
        if (school && school.settings && school.settings.classes) {
            return school.settings.classes;
        }
        return this.DEFAULT_CLASSES;
    },
    
    getSchoolSubjects(schoolId) {
        const school = this.getSchoolById(schoolId);
        if (school && school.settings && school.settings.subjects) {
            return school.settings.subjects;
        }
        return this.DEFAULT_SUBJECTS;
    },
    
    getSchoolScoreTypes(schoolId) {
        const school = this.getSchoolById(schoolId);
        if (school && school.settings && school.settings.scoreTypes) {
            return school.settings.scoreTypes;
        }
        return this.SCORE_TYPES;
    },
    
    getSchoolCustomSubjects(schoolId, level) {
        const school = this.getSchoolById(schoolId);
        if (school && school.settings && school.settings.subjects && school.settings.subjects.custom) {
            return school.settings.subjects.custom[level] || [];
        }
        return [];
    },
    
    getUsers(schoolId = null) {
        const users = this.getData('users');
        if (schoolId) {
            return users.filter(u => u.schoolId === schoolId);
        }
        return users;
    },
    
    getStudents(schoolId) {
        const students = this.getData('students');
        return students.filter(s => s.schoolId === schoolId);
    },
    
    getUserById(id) {
        return this.getItemById('users', id);
    },
    
    getStudentsByClass(schoolId, className) {
        const students = this.getData('students');
        return students.filter(s => s.schoolId === schoolId && s.class === className);
    },
    
    getAttendance(schoolId, date = null, className = null) {
        let attendance = this.getData('attendance');
        
        if (schoolId) {
            attendance = attendance.filter(a => a.schoolId === schoolId);
        }
        
        if (date) {
            attendance = attendance.filter(a => a.date === date);
        }
        
        if (className) {
            attendance = attendance.filter(a => a.class === className);
        }
        
        return attendance;
    },
    
    getScores(schoolId, studentId = null, className = null) {
        let scores = this.getData('scores');
        
        if (schoolId) {
            scores = scores.filter(s => s.schoolId === schoolId);
        }
        
        if (studentId) {
            scores = scores.filter(s => s.studentId === studentId);
        }
        
        if (className) {
            scores = scores.filter(s => s.class === className);
        }
        
        return scores;
    },
    
    // Score Sessions - Consolidated Daily/Weekly Score Entries
    getScoreSessions(schoolId, filters = {}) {
        let sessions = this.getData('scoreSessions') || [];
        
        if (schoolId) {
            sessions = sessions.filter(s => s.schoolId === schoolId);
        }
        
        if (filters.teacherId) {
            sessions = sessions.filter(s => s.teacherId === filters.teacherId);
        }
        
        if (filters.class) {
            sessions = sessions.filter(s => s.class === filters.class);
        }
        
        if (filters.subject) {
            sessions = sessions.filter(s => s.subject === filters.subject);
        }
        
        if (filters.type) {
            sessions = sessions.filter(s => s.type === filters.type);
        }
        
        if (filters.term) {
            sessions = sessions.filter(s => s.term === filters.term);
        }
        
        if (filters.year) {
            sessions = sessions.filter(s => s.year === filters.year);
        }
        
        if (filters.date) {
            sessions = sessions.filter(s => s.date === filters.date);
        }
        
        return sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    
    addScoreSession(sessionData) {
        const session = {
            id: this.generateUniqueId('SSN'),
            ...sessionData,
            createdAt: new Date().toISOString()
        };
        
        this.addItem('scoreSessions', session);
        return session;
    },
    
    updateScoreSession(sessionId, updates) {
        const sessions = this.getData('scoreSessions') || [];
        const index = sessions.findIndex(s => s.id === sessionId);
        
        if (index !== -1) {
            sessions[index] = { ...sessions[index], ...updates, updatedAt: new Date().toISOString() };
            this.setData('scoreSessions', sessions);
            return sessions[index];
        }
        
        return null;
    },
    
    deleteScoreSession(sessionId) {
        this.deleteItem('scoreSessions', sessionId);
    },
    
    getFinance(schoolId, type = null) {
        let finance = this.getData('finance');
        
        if (schoolId) {
            finance = finance.filter(f => f.schoolId === schoolId);
        }
        
        if (type) {
            finance = finance.filter(f => f.type === type);
        }
        
        return finance;
    },
    
    getChats(schoolId) {
        const chats = this.getData('chats');
        return chats.filter(c => c.schoolId === schoolId);
    },
    
    getMessages(chatId) {
        const db = this.getDB();
        const chats = db.chats || [];
        const chat = chats.find(c => c.id === chatId);
        return chat ? chat.messages : [];
    },
    
    getClasses(schoolId) {
        const students = this.getStudents(schoolId);
        const classes = [...new Set(students.map(s => s.class))];
        return classes.sort();
    },
    
    exportAllData() {
        const db = this.getDB();
        
        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            systemSettings: db.systemSettings,
            schools: db.schools,
            users: db.users.map(u => ({
                ...u,
                password: u.password
            })),
            students: db.students,
            attendance: db.attendance,
            scores: db.scores,
            finance: db.finance,
            chats: db.chats,
            activationCodes: db.activationCodes
        };
        
        return JSON.stringify(exportData, null, 2);
    },
    
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (!data.version) {
                throw new Error('Invalid backup file');
            }
            
            const db = this.getDB();
            db.systemSettings = data.systemSettings || db.systemSettings;
            db.schools = data.schools || [];
            db.users = data.users || [];
            db.students = data.students || [];
            db.attendance = data.attendance || [];
            db.scores = data.scores || [];
            db.finance = data.finance || [];
            db.chats = data.chats || [];
            db.activationCodes = data.activationCodes || [];
            
            this.saveDB(db);
            return { success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    },
    
    resetSystem() {
        localStorage.removeItem(this.DB_NAME);
        this.init();
    },
    
    deleteSchool(schoolId) {
        const schools = this.getData('schools');
        const users = this.getData('users');
        const students = this.getData('students');
        const attendance = this.getData('attendance');
        const scores = this.getData('scores');
        const finance = this.getData('finance');
        const chats = this.getData('chats');
        
        this.setData('schools', schools.filter(s => s.id !== schoolId));
        this.setData('users', users.filter(u => u.schoolId !== schoolId));
        this.setData('students', students.filter(s => s.schoolId !== schoolId));
        this.setData('attendance', attendance.filter(a => a.schoolId !== schoolId));
        this.setData('scores', scores.filter(s => s.schoolId !== schoolId));
        this.setData('finance', finance.filter(f => f.schoolId !== schoolId));
        this.setData('chats', chats.filter(c => c.schoolId !== schoolId));
        
        const codes = this.getData('activationCodes');
        const updatedCodes = codes.map(c => {
            if (c.schoolId === schoolId) {
                return { ...c, isUsed: false, schoolId: null, usedAt: null, usedBySchool: null };
            }
            return c;
        });
        this.setData('activationCodes', updatedCodes);
    },
    
    getAllDataStats() {
        const db = this.getDB();
        
        return {
            schools: db.schools.length,
            users: db.users.length,
            students: db.students.length,
            attendance: db.attendance.length,
            scores: db.scores.length,
            finance: db.finance.length,
            chats: db.chats.length,
            activationCodes: db.activationCodes.length,
            totalSchoolsActive: db.schools.filter(s => s.status === 'active').length
        };
    },
    
    checkSchoolExpiration(schoolId) {
        const school = this.getSchoolById(schoolId);
        if (!school) return { expired: true, message: 'School not found' };
        
        if (!school.expiresAt) {
            return { expired: false, school };
        }
        
        const expiresAt = new Date(school.expiresAt);
        const now = new Date();
        
        if (expiresAt < now) {
            return { 
                expired: true, 
                message: 'School subscription has expired. Please contact administrator.',
                school 
            };
        }
        
        const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
        return { 
            expired: false, 
            daysLeft,
            school 
        };
    },
    
    updateSchoolExpiration(schoolId, newExpiration) {
        const schools = this.getData('schools');
        const index = schools.findIndex(s => s.id === schoolId);
        
        if (index !== -1) {
            schools[index].expiresAt = newExpiration;
            schools[index].subscriptionExtended = true;
            schools[index].lastExtended = new Date().toISOString();
            this.setData('schools', schools);
            return true;
        }
        return false;
    },
    
    getExpiredSchools() {
        const schools = this.getData('schools');
        const now = new Date();
        
        return schools.filter(school => {
            if (!school.expiresAt) return false;
            return new Date(school.expiresAt) < now;
        });
    },
    
    getExpiringSchools(days = 30) {
        const schools = this.getData('schools');
        const now = new Date();
        const future = new Date();
        future.setDate(future.getDate() + days);
        
        return schools.filter(school => {
            if (!school.expiresAt) return false;
            const expDate = new Date(school.expiresAt);
            return expDate >= now && expDate <= future;
        });
    },
    
    checkActivationCodeExpiration(codeId) {
        const codes = this.getData('activationCodes');
        const code = codes.find(c => c.id === codeId);
        
        if (!code) return { expired: true, message: 'Code not found' };
        
        if (code.isUsed || code.isRevoked) {
            return { expired: false, code };
        }
        
        const expiresAt = new Date(code.expiresAt);
        const now = new Date();
        
        if (expiresAt < now) {
            return { 
                expired: true, 
                message: 'Activation code has expired. Please obtain a new code.',
                code 
            };
        }
        
        return { expired: false, code };
    },
    
    renewSchoolSubscription(schoolId, days) {
        const school = this.getSchoolById(schoolId);
        let newExpiresAt;
        
        if (school && school.expiresAt && new Date(school.expiresAt) > new Date()) {
            const currentExp = new Date(school.expiresAt);
            currentExp.setDate(currentExp.getDate() + days);
            newExpiresAt = currentExp.toISOString();
        } else {
            newExpiresAt = new Date();
            newExpiresAt.setDate(newExpiresAt.getDate() + days);
            newExpiresAt = newExpiresAt.toISOString();
        }
        
        return this.updateSchoolExpiration(schoolId, newExpiresAt);
    },
    
    createBackup() {
        const db = this.getDB();
        const backup = {
            version: '2.0',
            backupDate: new Date().toISOString(),
            description: 'Manual backup before Phase 1 upgrades',
            data: db
        };
        
        const backups = JSON.parse(localStorage.getItem('systemBackups') || '[]');
        backups.push({
            id: this.generateId(),
            date: backup.backupDate,
            description: backup.description,
            size: JSON.stringify(backup).length
        });
        
        localStorage.setItem('systemBackups', JSON.stringify(backups));
        localStorage.setItem('latestBackup', JSON.stringify(backup));
        
        return backup;
    },
    
    downloadBackup() {
        const backup = this.createBackup();
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `school_system_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    },
    
    getBackups() {
        return JSON.parse(localStorage.getItem('systemBackups') || '[]');
    },
    
    restoreBackup(backupData) {
        try {
            const data = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;
            if (!data.version || !data.data) {
                throw new Error('Invalid backup format');
            }
            localStorage.setItem(this.DB_NAME, JSON.stringify(data.data));
            return { success: true, message: 'Backup restored successfully' };
        } catch (e) {
            return { success: false, message: e.message };
        }
    },
    
    updateSchoolSubjects(schoolId, subjects) {
        const school = this.getSchoolById(schoolId);
        if (school) {
            school.settings = school.settings || {};
            school.settings.subjects = subjects;
            return this.updateItem('schools', schoolId, { settings: school.settings });
        }
        return null;
    },
    
    updateSchoolScoreTypes(schoolId, scoreTypes) {
        const school = this.getSchoolById(schoolId);
        if (school) {
            school.settings = school.settings || {};
            school.settings.scoreTypes = scoreTypes;
            return this.updateItem('schools', schoolId, { settings: school.settings });
        }
        return null;
    },
    
    getSchoolProfile(schoolId) {
        const school = this.getSchoolById(schoolId);
        if (school) {
            return {
                name: school.name || '',
                address: school.address || '',
                phone: school.phone || '',
                email: school.email || '',
                website: school.website || '',
                logo: school.logo || null,
                motto: school.motto || '',
                established: school.established || '',
                registrationNumber: school.registrationNumber || ''
            };
        }
        return null;
    },
    
    updateSchoolProfile(schoolId, profile) {
        const school = this.getSchoolById(schoolId);
        if (school) {
            const updates = {
                name: profile.name,
                address: profile.address,
                phone: profile.phone,
                email: profile.email,
                website: profile.website,
                motto: profile.motto,
                established: profile.established,
                registrationNumber: profile.registrationNumber
            };
            
            if (profile.logo !== undefined) {
                updates.logo = profile.logo;
            }
            
            return this.updateItem('schools', schoolId, updates);
        }
        return null;
    }
};

// Initialize storage
Storage.init();

window.Storage = Storage;

// Cloud sync disabled - these are stubs
window.syncFromFirebase = function() {
    console.log('Cloud sync disabled - using localStorage only');
    return false;
};

window.syncToFirebase = function() {
    console.log('Cloud sync disabled - using localStorage only');
    return false;
};

window.smartSyncOnLogin = function() {
    console.log('Using local storage only');
};
