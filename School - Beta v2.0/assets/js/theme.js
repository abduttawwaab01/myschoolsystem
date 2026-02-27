const Theme = {
    settings: null,
    
    init() {
        this.loadSettings();
        this.applyTheme();
        this.setupEventListeners();
    },
    
    loadSettings() {
        const user = Auth.getCurrentUser();
        const userSettings = user ? this.getUserSettings(user.id) : null;
        
        if (userSettings && userSettings.darkMode !== undefined) {
            this.settings = {
                ...Storage.getSystemSettings(),
                ...userSettings
            };
        } else {
            this.settings = Storage.getSystemSettings() || {
                theme: 'light',
                primaryColor: '#16a34a',
                secondaryColor: '#10b981',
                fontFamily: 'Inter',
                borderRadius: '12',
                shadowIntensity: 'medium',
                darkMode: false,
                darkModeSystem: false
            };
        }
        
        if (!this.settings.borderRadius) this.settings.borderRadius = '12';
        if (!this.settings.shadowIntensity) this.settings.shadowIntensity = 'medium';
    },
    
    getUserSettings(userId) {
        const users = Storage.getData('users');
        const user = users.find(u => u.id === userId);
        return user?.settings || null;
    },
    
    saveUserSettings(userId, settings) {
        const users = Storage.getData('users');
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index].settings = { ...users[index].settings, ...settings };
            Storage.setData('users', users);
        }
    },
    
    applyTheme() {
        const root = document.documentElement;
        
        if (this.settings.darkMode) {
            document.body.setAttribute('data-theme', 'dark');
        } else if (this.settings.darkModeSystem) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.body.removeAttribute('data-theme');
        }
        
        root.style.setProperty('--primary', this.settings.primaryColor || '#16a34a');
        root.style.setProperty('--secondary', this.settings.secondaryColor || '#10b981');
        root.style.setProperty('--font-sans', this.settings.fontFamily || 'Inter');
        
        const borderRadius = this.settings.borderRadius || '12';
        root.style.setProperty('--radius', borderRadius + 'px');
        root.style.setProperty('--radius-sm', Math.round(borderRadius * 0.67) + 'px');
        root.style.setProperty('--radius-lg', Math.round(borderRadius * 1.33) + 'px');
        
        const shadowValues = {
            light: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            medium: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            heavy: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        };
        root.style.setProperty('--shadow', shadowValues[this.settings.shadowIntensity] || shadowValues.medium);
        
        const darkerPrimary = this.adjustColor(this.settings.primaryColor || '#16a34a', -20);
        root.style.setProperty('--primary-dark', darkerPrimary);
        
        const accentLight = this.adjustColor(this.settings.primaryColor || '#16a34a', 80);
        root.style.setProperty('--accent-light', accentLight);
    },
    
    setupEventListeners() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.checked = this.settings.darkMode || false;
            darkModeToggle.addEventListener('change', (e) => {
                this.toggleDarkMode(e.target.checked);
            });
        }
        
        const darkModeSystemToggle = document.getElementById('darkModeSystemToggle');
        if (darkModeSystemToggle) {
            darkModeSystemToggle.checked = this.settings.darkModeSystem || false;
            darkModeSystemToggle.addEventListener('change', (e) => {
                this.setDarkModeSystem(e.target.checked);
            });
        }
        
        const primaryColorInput = document.getElementById('primaryColor');
        if (primaryColorInput) {
            primaryColorInput.value = this.settings.primaryColor || '#16a34a';
            primaryColorInput.addEventListener('input', (e) => {
                this.setPrimaryColor(e.target.value);
                this.updatePreview();
            });
        }
        
        const secondaryColorInput = document.getElementById('secondaryColor');
        if (secondaryColorInput) {
            secondaryColorInput.value = this.settings.secondaryColor || '#10b981';
            secondaryColorInput.addEventListener('input', (e) => {
                this.setSecondaryColor(e.target.value);
                this.updatePreview();
            });
        }
        
        const fontSelect = document.getElementById('fontSelect');
        if (fontSelect) {
            fontSelect.value = this.settings.fontFamily || 'Inter';
            fontSelect.addEventListener('change', (e) => {
                this.setFont(e.target.value);
                this.updatePreview();
            });
        }
        
        const radiusSlider = document.getElementById('borderRadiusSlider');
        if (radiusSlider) {
            radiusSlider.value = this.settings.borderRadius || 12;
            document.getElementById('radiusValue').textContent = radiusSlider.value + 'px';
            radiusSlider.addEventListener('input', (e) => {
                document.getElementById('radiusValue').textContent = e.target.value + 'px';
                this.setBorderRadius(e.target.value);
                this.updatePreview();
            });
        }
        
        const shadowSlider = document.getElementById('shadowSlider');
        if (shadowSlider) {
            const shadowValues = { light: 1, medium: 2, heavy: 3 };
            shadowSlider.value = shadowValues[this.settings.shadowIntensity] || 2;
            document.getElementById('shadowValue').textContent = this.settings.shadowIntensity || 'medium';
            shadowSlider.addEventListener('input', (e) => {
                const values = ['light', 'medium', 'heavy'];
                const value = values[e.target.value - 1];
                document.getElementById('shadowValue').textContent = value;
                this.setShadowIntensity(value);
                this.updatePreview();
            });
        }
        
        document.querySelectorAll('.color-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const color = btn.dataset.color;
                this.setPrimaryColor(color);
                if (primaryColorInput) primaryColorInput.value = color;
                this.updatePreview();
            });
        });
    },
    
    updatePreview() {
        const preview = document.getElementById('themePreview');
        if (!preview) return;
        
        const radius = this.settings.borderRadius || 12;
        const shadowValues = {
            light: '0 2px 4px rgba(0,0,0,0.1)',
            medium: '0 4px 8px rgba(0,0,0,0.15)',
            heavy: '0 8px 16px rgba(0,0,0,0.2)'
        };
        const shadow = shadowValues[this.settings.shadowIntensity] || shadowValues.medium;
        
        preview.style.setProperty('--preview-radius', radius + 'px');
        preview.style.setProperty('--preview-shadow', shadow);
    },
    
    toggleDarkMode(enabled) {
        const user = Auth.getCurrentUser();
        this.settings.darkMode = enabled;
        if (enabled) this.settings.darkModeSystem = false;
        
        if (user) {
            this.saveUserSettings(user.id, { darkMode: enabled, darkModeSystem: false });
        }
        
        this.applyTheme();
        Toast.success(enabled ? 'Dark mode enabled' : 'Dark mode disabled');
        
        const systemToggle = document.getElementById('darkModeSystemToggle');
        if (systemToggle) systemToggle.checked = false;
    },
    
    setDarkModeSystem(enabled) {
        const user = Auth.getCurrentUser();
        this.settings.darkModeSystem = enabled;
        if (enabled) this.settings.darkMode = false;
        
        if (user) {
            this.saveUserSettings(user.id, { darkModeSystem: enabled, darkMode: false });
        }
        
        this.applyTheme();
        Toast.success(enabled ? 'Following system preference' : 'System preference disabled');
        
        const darkToggle = document.getElementById('darkModeToggle');
        if (darkToggle) darkToggle.checked = false;
    },
    
    setPrimaryColor(color) {
        this.settings.primaryColor = color;
        Storage.updateSystemSettings({ primaryColor: color });
        this.applyTheme();
    },
    
    setPrimaryColorFromHex(hex) {
        if (/^#[0-9A-F]{6}$/i.test(hex)) {
            this.setPrimaryColor(hex);
        }
    },
    
    setSecondaryColor(color) {
        this.settings.secondaryColor = color;
        Storage.updateSystemSettings({ secondaryColor: color });
        this.applyTheme();
    },
    
    setFont(fontFamily) {
        this.settings.fontFamily = fontFamily;
        Storage.updateSystemSettings({ fontFamily });
        this.applyTheme();
    },
    
    setBorderRadius(value) {
        this.settings.borderRadius = value;
        Storage.updateSystemSettings({ borderRadius: value });
        this.applyTheme();
    },
    
    setShadowIntensity(value) {
        this.settings.shadowIntensity = value;
        Storage.updateSystemSettings({ shadowIntensity: value });
        this.applyTheme();
    },
    
    adjustColor(color, amount) {
        let usePound = false;
        if (!color) return '#16a34a';
        
        if (color[0] === '#') {
            color = color.slice(1);
            usePound = true;
        }
        
        const num = parseInt(color, 16);
        let r = (num >> 16) + amount;
        let g = ((num >> 8) & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;
        
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
        
        return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
    },
    
    getSettings() {
        return this.settings;
    },
    
    resetToDefaults() {
        Modal.confirm({
            title: 'Reset Theme Settings',
            message: 'Are you sure you want to reset all theme settings to defaults?',
            onConfirm: () => {
                this.settings = {
                    theme: 'light',
                    primaryColor: '#16a34a',
                    secondaryColor: '#10b981',
                    fontFamily: 'Inter',
                    borderRadius: '12',
                    shadowIntensity: 'medium',
                    darkMode: false,
                    darkModeSystem: false
                };
                
                Storage.updateSystemSettings(this.settings);
                
                const user = Auth.getCurrentUser();
                if (user) {
                    this.saveUserSettings(user.id, { darkMode: false, darkModeSystem: false });
                }
                
                this.applyTheme();
                this.setupEventListeners();
                Toast.success('Theme reset to defaults');
            }
        });
    }
};

const Profile = {
    currentUser: null,
    
    init() {
        this.currentUser = Auth.getCurrentUser();
        if (!this.currentUser) return;
        
        this.loadProfileData();
    },
    
    loadProfileData() {
        const user = Auth.getCurrentUser();
        const school = Auth.getSchool();
        
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileRole').textContent = this.formatRole(user.role);
        document.getElementById('profileSchool').textContent = school?.name || 'Super Admin';
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profilePhone').textContent = user.phone || 'Not set';
        document.getElementById('profileAvatar').textContent = Utils.getInitials(user.name);
        
        const avatar = document.getElementById('profileAvatarImg');
        if (avatar && user.avatar) {
            avatar.src = user.avatar;
            avatar.style.display = 'block';
            document.getElementById('profileAvatar').style.display = 'none';
        }
        
        document.getElementById('editName').value = user.name;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editPhone').value = user.phone || '';
        document.getElementById('editUsername').value = user.username || '';
    },
    
    formatRole(role) {
        const roles = {
            super_admin: 'Super Administrator',
            school_admin: 'School Administrator',
            teacher: 'Teacher',
            accountant: 'Accountant',
            director: 'Director'
        };
        return roles[role] || role;
    },
    
    showEditModal() {
        const user = Auth.getCurrentUser();
        document.getElementById('editName').value = user.name;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editPhone').value = user.phone || '';
        
        const avatarPreview = document.getElementById('avatarPreview');
        if (avatarPreview && user.avatar) {
            avatarPreview.src = user.avatar;
            avatarPreview.style.display = 'block';
        } else if (avatarPreview) {
            avatarPreview.style.display = 'none';
        }
        
        Modal.show('editProfileModal');
    },
    
    async updateProfile() {
        const name = document.getElementById('editName').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const phone = document.getElementById('editPhone').value.trim();
        
        if (!name) {
            Toast.error('Name is required');
            return;
        }
        
        if (email && !Utils.validateEmail(email)) {
            Toast.error('Invalid email address');
            return;
        }
        
        const result = Auth.updateProfile(this.currentUser.id, { name, email, phone });
        
        if (result.success) {
            Toast.success('Profile updated successfully');
            Modal.hide('editProfileModal');
            this.loadProfileData();
            
            document.getElementById('currentUserName').textContent = name;
            document.getElementById('navUserName').textContent = name;
            document.getElementById('currentUserAvatar').textContent = Utils.getInitials(name);
            document.getElementById('navAvatar').textContent = Utils.getInitials(name);
        } else {
            Toast.error(result.message);
        }
    },
    
    async uploadPhoto(input) {
        const file = input.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            Toast.error('Please select an image file');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            Toast.error('Image must be less than 2MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = Auth.updateProfile(this.currentUser.id, { avatar: e.target.result });
            
            if (result.success) {
                Toast.success('Profile photo updated');
                this.loadProfileData();
            } else {
                Toast.error('Failed to update photo');
            }
        };
        reader.readAsDataURL(file);
    },
    
    showChangePasswordModal() {
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        Modal.show('changePasswordModal');
    },
    
    changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            Toast.error('Please fill all fields');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            Toast.error('New passwords do not match');
            return;
        }
        
        if (!Utils.validatePassword(newPassword)) {
            Toast.error('Password must be at least 8 characters with uppercase, lowercase, and numbers');
            return;
        }
        
        const result = Auth.changePassword(this.currentUser.id, currentPassword, newPassword);
        
        if (result.success) {
            Toast.success('Password changed successfully');
            Modal.hide('changePasswordModal');
        } else {
            Toast.error(result.message);
        }
    },
    
    generateQRCode() {
        if (this.currentUser.role === 'super_admin') {
            Toast.info('Super Admin does not need a QR code');
            return;
        }
        
        const qrData = {
            id: this.currentUser.id,
            name: this.currentUser.name,
            role: this.currentUser.role,
            schoolId: this.currentUser.schoolId,
            generatedAt: new Date().toISOString()
        };
        
        QRCode.generate(qrData).then(dataUrl => {
            const container = document.getElementById('myQRCode');
            if (container) {
                container.innerHTML = `<img src="${dataUrl}" alt="QR Code" style="width: 150px; height: 150px;">`;
            }
        });
    }
};

const Students = {
    init() {
        this.loadClasses();
        this.setupEventListeners();
    },
    
    loadClasses() {
        const schoolId = Auth.getCurrentSchoolId();
        const classes = Storage.getClasses(schoolId);
        
        const select = document.getElementById('studentClassSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">Select Class</option>' +
            classes.map(c => `<option value="${c}">${c}</option>`).join('');
    },
    
    setupEventListeners() {
        const classSelect = document.getElementById('studentClassSelect');
        if (classSelect) {
            classSelect.addEventListener('change', (e) => {
                this.loadStudents(e.target.value);
            });
        }
    },
    
    loadStudents(className) {
        const schoolId = Auth.getCurrentSchoolId();
        let students = className 
            ? Storage.getStudentsByClass(schoolId, className)
            : Storage.getStudents(schoolId);
        
        const container = document.getElementById('studentsTable');
        if (!container) return;
        
        if (students.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No students</h3>
                    <p>No students found</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>ID</th>
                            <th>Class</th>
                            <th>Parent Name</th>
                            <th>Parent Phone</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        students.forEach(student => {
            html += `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div class="avatar">${Utils.getInitials(student.name)}</div>
                            <div>
                                <div style="font-weight: 600;">${student.name}</div>
                                <div style="font-size: 12px; color: var(--gray);">${student.email || '-'}</div>
                            </div>
                        </div>
                    </td>
                    <td>${student.id}</td>
                    <td>${student.class}</td>
                    <td>${student.parentName || '-'}</td>
                    <td>${student.parentPhone || '-'}</td>
                    <td>
                        <span class="badge badge-${student.status === 'active' ? 'success' : 'warning'}">
                            ${student.status || 'active'}
                        </span>
                    </td>
                    <td>
                        <div class="actions">
                            <button onclick="Students.view('${student.id}')" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="IDCards.generateForStudent('${student.id}')" title="ID Card">
                                <i class="fas fa-id-card"></i>
                            </button>
                            <button onclick="Students.edit('${student.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="Students.delete('${student.id}')" title="Delete" class="danger">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
    },
    
    add(data) {
        const schoolId = Auth.getCurrentSchoolId();
        const studentId = Storage.generateUniqueId('STU');
        
        // Generate username from name if not provided
        let username = data.username || '';
        if (!username && data.name) {
            username = data.name.toLowerCase().replace(/\s+/g, '').substring(0, 8) + studentId.slice(-4);
        }
        
        // Set password - use provided or default to student ID, then hash it
        let password = data.password || studentId;
        const hashedPassword = Storage.hashPassword(password);
        
        const student = {
            ...data,
            id: studentId,
            username: username,
            password: hashedPassword,
            schoolId,
            status: 'active',
            enrollmentDate: new Date().toISOString()
        };
        
        Storage.addItem('students', student);
        
        const user = Auth.getCurrentUser();
        Auth.logActivity(user.id, 'student_add', `Added new student: ${data.name}`);
        Auth.addNotification(user.id, `Added new student: ${data.name}`, 'student');
        
        Toast.success(`Student added successfully! ID: ${studentId}, Default Password: ${studentId}`);
        Modal.hide('addStudentModal');
        this.loadStudents();
        Form.reset('studentForm');
    },
    
    view(id) {
        const schoolId = Auth.getCurrentSchoolId();
        const student = Storage.getStudents(schoolId).find(s => s.id === id);
        
        if (!student) {
            Toast.error('Student not found');
            return;
        }
        
        const html = `
            <div style="text-align: center;">
                <div class="avatar avatar-xl" style="margin: 0 auto 16px;">${Utils.getInitials(student.name)}</div>
                <h3>${student.name}</h3>
                <p class="text-muted">${student.id}</p>
                
                <div style="text-align: left; margin-top: 24px;">
                    <div class="list-group">
                        <div class="list-group-item"><span class="text-muted">Class</span><span>${student.class}</span></div>
                        <div class="list-group-item"><span class="text-muted">Email</span><span>${student.email || '-'}</span></div>
                        <div class="list-group-item"><span class="text-muted">Phone</span><span>${student.phone || '-'}</span></div>
                        <div class="list-group-item"><span class="text-muted">Parent Name</span><span>${student.parentName || '-'}</span></div>
                        <div class="list-group-item"><span class="text-muted">Parent Phone</span><span>${student.parentPhone || '-'}</span></div>
                        <div class="list-group-item"><span class="text-muted">Address</span><span>${student.address || '-'}</span></div>
                        <div class="list-group-item"><span class="text-muted">Enrollment Date</span><span>${Utils.formatDate(student.enrollmentDate)}</span></div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('viewStudentContent').innerHTML = html;
        Modal.show('viewStudentModal');
    },
    
    edit(id) {
        const schoolId = Auth.getCurrentSchoolId();
        const student = Storage.getStudents(schoolId).find(s => s.id === id);
        
        if (!student) {
            Toast.error('Student not found');
            return;
        }
        
        const form = document.getElementById('studentForm');
        form.name.value = student.name;
        form.email.value = student.email || '';
        form.phone.value = student.phone || '';
        form.class.value = student.class;
        form.dob.value = student.dob || '';
        form.gender.value = student.gender || '';
        form.parentName.value = student.parentName || '';
        form.parentPhone.value = student.parentPhone || '';
        form.address.value = student.address || '';
        
        form.dataset.editId = id;
        document.querySelector('#addStudentModal .modal-title').textContent = 'Edit Student';
        Modal.show('addStudentModal');
    },
    
    update(id, data) {
        Storage.updateItem('students', id, data);
        Toast.success('Student updated successfully');
        Modal.hide('addStudentModal');
        this.loadStudents();
        Form.reset('studentForm');
    },
    
    delete(id) {
        Modal.confirm({
            title: 'Delete Student',
            message: 'Are you sure you want to delete this student? This action cannot be undone.',
            onConfirm: () => {
                Storage.deleteItem('students', id);
                Toast.success('Student deleted');
                this.loadStudents();
            }
        });
    },
    
    async bulkImport(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csv = e.target.result;
                const lines = csv.split('\n');
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                const students = [];
                
                for (let i = 1; i < lines.length; i++) {
                    if (!lines[i].trim()) continue;
                    const values = lines[i].split(',').map(v => v.trim());
                    const student = {};
                    headers.forEach((header, index) => {
                        student[header] = values[index];
                    });
                    
                    if (student.name && student.class) {
                        student.id = Storage.generateUniqueId('STU');
                        student.schoolId = Auth.getCurrentSchoolId();
                        student.status = 'active';
                        student.enrollmentDate = new Date().toISOString();
                        students.push(student);
                    }
                }
                
                students.forEach(s => Storage.addItem('students', s));
                resolve(students.length);
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },
    
    export(format = 'csv') {
        const schoolId = Auth.getCurrentSchoolId();
        const students = Storage.getStudents(schoolId);
        
        if (format === 'csv') {
            const csv = [
                'ID,Name,Class,Email,Phone,Parent Name,Parent Phone,Address,Status',
                ...students.map(s => `${s.id},${s.name},${s.class},${s.email || ''},${s.phone || ''},${s.parentName || ''},${s.parentPhone || ''},${s.address || ''},${s.status}`)
            ].join('\n');
            Utils.downloadFile(csv, 'students.csv', 'text/csv');
            Toast.success('Students exported');
        }
    }
};

const Scores = {
    levelMap: {
        'Nursery 1': 'Nursery', 'Nursery 2': 'Nursery',
        'Primary 1': 'Primary', 'Primary 2': 'Primary', 'Primary 3': 'Primary',
        'Primary 4': 'Primary', 'Primary 5': 'Primary', 'Primary 6': 'Primary',
        'JSS 1': 'JSS', 'JSS 2': 'JSS', 'JSS 3': 'JSS',
        'SS 1': 'SS', 'SS 2': 'SS', 'SS 3': 'SS'
    },
    
    init() {
        this.loadClasses();
        this.setupEventListeners();
    },
    
    loadClasses() {
        const schoolId = Auth.getCurrentSchoolId();
        const classes = Storage.getClasses(schoolId);
        const select = document.getElementById('scoreClassSelect');
        if (!select) return;
        select.innerHTML = '<option value="">Select Class</option>' + classes.map(c => `<option value="${c}">${c}</option>`).join('');
    },
    
    loadSubjectsForClass(className) {
        const schoolId = Auth.getCurrentSchoolId();
        const subjectSelect = document.getElementById('scoreSubjectSelect');
        if (!subjectSelect || !className) {
            if (subjectSelect) subjectSelect.innerHTML = '<option value="">Select Subject</option>';
            return;
        }
        
        const level = this.levelMap[className] || 'Primary';
        const subjects = Storage.getSchoolSubjects(schoolId);
        const levelSubjects = subjects[level] || [];
        const customSubjects = Storage.getSchoolCustomSubjects(schoolId, level) || [];
        const allSubjects = [...levelSubjects, ...customSubjects];
        
        subjectSelect.innerHTML = '<option value="">Select Subject</option>' + allSubjects.map(s => `<option value="${s}">${s}</option>`).join('');
    },
    
    setupEventListeners() {
        document.getElementById('scoreClassSelect')?.addEventListener('change', (e) => {
            this.loadSubjectsForClass(e.target.value);
            this.loadStudents(e.target.value);
        });
        document.getElementById('scoreSubjectSelect')?.addEventListener('change', () => this.loadStudents());
        document.getElementById('scoreTermSelect')?.addEventListener('change', () => this.loadStudents());
        document.getElementById('scoreYearSelect')?.addEventListener('change', () => this.loadStudents());
    },
    
    loadStudents(className) {
        const schoolId = Auth.getCurrentSchoolId();
        const classSelect = document.getElementById('scoreClassSelect');
        const subjectSelect = document.getElementById('scoreSubjectSelect');
        const selectedClass = className || classSelect?.value;
        
        if (!selectedClass) return;
        
        const students = Storage.getStudentsByClass(schoolId, selectedClass);
        const container = document.getElementById('scoresTable');
        if (!container) return;
        
        if (students.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No students in this class</p></div>';
            return;
        }
        
        const subject = subjectSelect?.value;
        const term = document.getElementById('scoreTermSelect')?.value;
        const year = document.getElementById('scoreYearSelect')?.value;
        
        const scoreTypes = Storage.getSchoolScoreTypes(schoolId);
        const typeHeaders = scoreTypes.map(t => {
            const typeMap = { 'Daily': 'daily', 'Weekly': 'weekly', 'Mid-term': 'midterm', 'Exam': 'exam' };
            return { display: t, key: typeMap[t] || t.toLowerCase() };
        });
        
        let html = '<div class="table-container"><table class="table"><thead><tr><th>Student</th>';
        typeHeaders.forEach(t => {
            html += `<th>${t.display}</th>`;
        });
        html += '<th>Total</th><th>Average</th><th>Grade</th></tr></thead><tbody>';
        
        students.forEach(student => {
            let scores = Storage.getScores(schoolId, student.id, selectedClass);
            if (subject) scores = scores.filter(s => s.subject === subject);
            if (term) scores = scores.filter(s => s.term === term);
            if (year) scores = scores.filter(s => s.year === parseInt(year));
            
            const typeScores = {};
            typeHeaders.forEach(t => {
                typeScores[t.key] = scores.find(s => s.type === t.key)?.score || 0;
            });
            
            const total = Object.values(typeScores).reduce((sum, v) => sum + v, 0);
            const scoreCount = typeHeaders.filter(t => typeScores[t.key] > 0).length || 1;
            const average = total / scoreCount;
            const grade = this.getGrade(average);
            
            html += `<tr><td><div style="font-weight: 600;">${student.name}</div></td>`;
            typeHeaders.forEach(t => {
                html += `<td><input type="number" class="score-input" value="${typeScores[t.key]}" min="0" max="100" onchange="Scores.updateScore('${student.id}', '${t.key}', this.value)"></td>`;
            });
            html += `<td><strong>${total}</strong></td><td>${average.toFixed(1)}</td><td><span class="badge badge-${grade.letter >= 'C' ? 'success' : 'warning'}">${grade.letter}</span></td></tr>`;
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
    },
    
    getGrade(average) {
        if (average >= 90) return { letter: 'A', grade: 'Excellent' };
        if (average >= 80) return { letter: 'B', grade: 'Very Good' };
        if (average >= 70) return { letter: 'C', grade: 'Good' };
        if (average >= 60) return { letter: 'D', grade: 'Fair' };
        if (average >= 50) return { letter: 'E', grade: 'Pass' };
        return { letter: 'F', grade: 'Fail' };
    },
    
    updateScore(studentId, type, value) {
        const schoolId = Auth.getCurrentSchoolId();
        const classSelect = document.getElementById('scoreClassSelect');
        const subjectSelect = document.getElementById('scoreSubjectSelect');
        const termSelect = document.getElementById('scoreTermSelect');
        const yearSelect = document.getElementById('scoreYearSelect');
        
        const score = parseFloat(value) || 0;
        
        const existing = Storage.getScores(schoolId).find(s => 
            s.studentId === studentId &&
            s.subject === subjectSelect?.value &&
            s.term === termSelect?.value &&
            s.year === parseInt(yearSelect?.value) &&
            s.type === type
        );
        
        if (existing) {
            Storage.updateItem('scores', existing.id, { score });
        } else {
            Storage.addItem('scores', {
                studentId,
                subject: subjectSelect?.value,
                term: termSelect?.value,
                year: parseInt(yearSelect?.value),
                type,
                score,
                class: classSelect?.value,
                schoolId,
                createdAt: new Date().toISOString()
            });
        }
        
        Toast.success('Score saved');
    },
    
    exportToCSV() {
        const schoolId = Auth.getCurrentSchoolId();
        const classSelect = document.getElementById('scoreClassSelect');
        const subjectSelect = document.getElementById('scoreSubjectSelect');
        const termSelect = document.getElementById('scoreTermSelect');
        const yearSelect = document.getElementById('scoreYearSelect');
        
        const selectedClass = classSelect?.value;
        const subject = subjectSelect?.value;
        const term = termSelect?.value;
        const year = yearSelect?.value;
        
        if (!selectedClass) {
            Toast.error('Please select a class');
            return;
        }
        
        const students = Storage.getStudentsByClass(schoolId, selectedClass);
        const scoreTypes = Storage.getSchoolScoreTypes(schoolId);
        
        let csv = 'Student Name,';
        scoreTypes.forEach(t => csv += t + ',');
        csv += 'Total,Average,Grade\n';
        
        students.forEach(student => {
            let scores = Storage.getScores(schoolId, student.id, selectedClass);
            if (subject) scores = scores.filter(s => s.subject === subject);
            if (term) scores = scores.filter(s => s.term === term);
            if (year) scores = scores.filter(s => s.year === parseInt(year));
            
            const typeMap = { 'Daily': 'daily', 'Weekly': 'weekly', 'Mid-term': 'midterm', 'Exam': 'exam' };
            let row = student.name + ',';
            let total = 0;
            let count = 0;
            
            scoreTypes.forEach(t => {
                const key = typeMap[t] || t.toLowerCase();
                const score = scores.find(s => s.type === key)?.score || 0;
                row += score + ',';
                if (score > 0) { total += score; count++; }
            });
            
            const avg = count > 0 ? (total / count).toFixed(1) : 0;
            const grade = this.getGrade(parseFloat(avg)).letter;
            row += total + ',' + avg + ',' + grade + '\n';
            
            csv += row;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scores_${selectedClass}_${term}_${year}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        Toast.success('Scores exported to CSV');
    },
    
    exportToPDF() {
        const schoolId = Auth.getCurrentSchoolId();
        const school = Auth.getSchool();
        const classSelect = document.getElementById('scoreClassSelect');
        const subjectSelect = document.getElementById('scoreSubjectSelect');
        const termSelect = document.getElementById('scoreTermSelect');
        const yearSelect = document.getElementById('scoreYearSelect');
        
        const selectedClass = classSelect?.value;
        const subject = subjectSelect?.value;
        const term = termSelect?.value;
        const year = yearSelect?.value;
        
        if (!selectedClass) {
            Toast.error('Please select a class');
            return;
        }
        
        const students = Storage.getStudentsByClass(schoolId, selectedClass);
        const scoreTypes = Storage.getSchoolScoreTypes(schoolId);
        
        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Score Report - ${selectedClass}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #16a34a; color: white; }
                .header { text-align: center; margin-bottom: 20px; }
                .school-name { font-size: 24px; font-weight: bold; }
                .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="school-name">${school?.name || 'My School'}</div>
                <div>Score Report - ${selectedClass}</div>
                <div>${term} ${year} ${subject ? '- ' + subject : ''}</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Student Name</th>
                        ${scoreTypes.map(t => `<th>${t}</th>`).join('')}
                        <th>Total</th>
                        <th>Average</th>
                        <th>Grade</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        students.forEach(student => {
            let scores = Storage.getScores(schoolId, student.id, selectedClass);
            if (subject) scores = scores.filter(s => s.subject === subject);
            if (term) scores = scores.filter(s => s.term === term);
            if (year) scores = scores.filter(s => s.year === parseInt(year));
            
            const typeMap = { 'Daily': 'daily', 'Weekly': 'weekly', 'Mid-term': 'midterm', 'Exam': 'exam' };
            let row = `<tr><td>${student.name}</td>`;
            let total = 0;
            let count = 0;
            
            scoreTypes.forEach(t => {
                const key = typeMap[t] || t.toLowerCase();
                const score = scores.find(s => s.type === key)?.score || 0;
                row += `<td>${score}</td>`;
                if (score > 0) { total += score; count++; }
            });
            
            const avg = count > 0 ? (total / count).toFixed(1) : 0;
            const grade = this.getGrade(parseFloat(avg)).letter;
            row += `<td><strong>${total}</strong></td><td>${avg}</td><td>${grade}</td></tr>`;
            
            html += row;
        });
        
        html += `
                </tbody>
            </table>
            <div class="footer" style="font-size:9px;color:#999;">
                My School System - Odebunmi Tawwab | ${new Date().toLocaleDateString()}
            </div>
        </body>
        </html>
        `;
        
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scores_${selectedClass}_${term}_${year}.html`;
        a.click();
        URL.revokeObjectURL(url);
        Toast.success('Scores exported (open in browser to print as PDF)');
    },
    
    saveAllScores() {
        const inputs = document.querySelectorAll('.score-input');
        let saved = 0;
        inputs.forEach(input => {
            const row = input.closest('tr');
            const studentName = row.querySelector('td:first-child').textContent;
            const scoreType = input.dataset.type;
            if (input.value !== input.defaultValue) {
                saved++;
            }
        });
        Toast.success(`All scores saved (${saved} changes)`);
        this.loadStudents();
    }
};

const IDCards = {
    currentType: 'student',
    currentOrientation: 'horizontal',
    
    init() {
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        const typeSelect = document.getElementById('idCardType');
        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                this.currentType = e.target.value;
                this.loadUsers();
            });
        }
        
        const orientationSelect = document.getElementById('idCardOrientation');
        if (orientationSelect) {
            orientationSelect.addEventListener('change', (e) => {
                this.currentOrientation = e.target.value;
            });
        }
    },
    
    loadUsers() {
        const schoolId = Auth.getCurrentSchoolId();
        const type = this.currentType;
        const select = document.getElementById('idCardUser');
        
        if (!select) return;
        
        let users = [];
        
        if (type === 'student') {
            users = Storage.getStudents(schoolId);
        } else {
            users = Storage.getUsers(schoolId).filter(u => u.role === type);
        }
        
        select.innerHTML = '<option value="">Select...</option>' + 
            users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    },
    
    async generate() {
        const userId = document.getElementById('idCardUser').value;
        if (!userId) {
            Toast.error('Please select a person');
            return;
        }
        
        await this.generateForUser(userId, this.currentType);
    },
    
    async generateForStudent(studentId) {
        await this.generateForUser(studentId, 'student');
    },
    
    async generateForUser(userId, type) {
        const schoolId = Auth.getCurrentSchoolId();
        const school = Storage.getSchoolById(schoolId);
        
        let user, student;
        
        if (type === 'student') {
            student = Storage.getStudents(schoolId).find(s => s.id === userId);
            user = student ? Storage.getUserById(student.userId) : null;
        } else {
            user = Storage.getUsers(schoolId).find(u => u.id === userId);
        }
        
        if (!user && !student) {
            Toast.error('User not found');
            return;
        }
        
        const id = student?.id || user?.id;
        const name = student?.name || user?.name;
        const role = type;
        
        const qrData = {
            id: id,
            name: name,
            role: role,
            schoolId: schoolId,
            schoolName: school?.name,
            class: student?.class,
            generatedAt: new Date().toISOString()
        };
        
        const qrCode = QRCode.generate(qrData);
        
        const cardData = {
            school: school,
            name: name,
            role: role,
            id: id,
            qrCode: qrCode,
            issueDate: new Date().toLocaleDateString(),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            class: student?.class,
            photo: user?.avatar || student?.avatar
        };
        
        this.render(cardData);
    },
    
    async generateForTeacher(teacherId) {
        await this.generateForUser(teacherId, 'teacher');
    },
    
    async generateForAdmin(adminId) {
        await this.generateForUser(adminId, 'school_admin');
    },
    
    async generateForDirector(directorId) {
        await this.generateForUser(directorId, 'director');
    },
    
    render(cardData) {
        const container = document.getElementById('idCardPreview');
        if (!container) return;
        
        const isHorizontal = this.currentOrientation === 'horizontal';
        
        const photoHtml = cardData.photo 
            ? `<img src="${cardData.photo}" alt="Photo" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<i class="fas fa-user" style="font-size: 40px; color: var(--gray);"></i>`;
        
        const html = `
            <div class="id-card ${isHorizontal ? 'horizontal' : 'vertical'}" id="generatedIdCard">
                <div class="id-card-header">
                    ${cardData.school?.name || 'School Name'}
                </div>
                <div class="id-card-body">
                    <div class="id-card-photo">${photoHtml}</div>
                    <div class="id-card-info">
                        <div class="id-card-name">${cardData.name}</div>
                        <div class="id-card-role">${this.formatRole(cardData.role)}</div>
                        <div class="id-card-id">ID: ${cardData.id}</div>
                        ${cardData.class ? `<div class="id-card-class">${cardData.class}</div>` : ''}
                        <div class="id-card-dates">
                            <span>Issued: ${cardData.issueDate}</span>
                            <span>Expires: ${cardData.expiryDate}</span>
                        </div>
                    </div>
                    <div class="id-card-qr">
                        <img src="${cardData.qrCode}" alt="QR Code">
                    </div>
                </div>
            </div>
            <div class="id-card-actions mt-3">
                <button class="btn btn-primary" onclick="IDCards.download('png')">
                    <i class="fas fa-download"></i> Download PNG
                </button>
                <button class="btn btn-secondary" onclick="IDCards.download('pdf')">
                    <i class="fas fa-file-pdf"></i> Download PDF
                </button>
                <button class="btn btn-outline" onclick="IDCards.print()">
                    <i class="fas fa-print"></i> Print
                </button>
            </div>
        `;
        
        container.innerHTML = html;
    },
    
    formatRole(role) {
        const roles = {
            student: 'Student',
            teacher: 'Teacher',
            school_admin: 'Administrator',
            accountant: 'Accountant',
            director: 'Director'
        };
        return roles[role] || role;
    },
    
    download(format) {
        const card = document.querySelector('#generatedIdCard');
        if (!card) {
            Toast.error('No ID card to download');
            return;
        }
        
        if (format === 'png') {
            html2canvas(card).then(canvas => {
                const link = document.createElement('a');
                link.download = 'id-card.png';
                link.href = canvas.toDataURL();
                link.click();
                Toast.success('ID card downloaded');
            });
        } else if (format === 'pdf') {
            html2canvas(card).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: this.currentOrientation,
                    unit: 'mm',
                    format: [85.6, 54]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
                pdf.save('id-card.pdf');
                Toast.success('ID card downloaded');
            });
        }
    },
    
    print() {
        const card = document.querySelector('#generatedIdCard');
        if (!card) {
            Toast.error('No ID card to print');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>ID Card</title>
                    <style>
                        body { margin: 0; padding: 20px; display: flex; justify-content: center; }
                        .id-card { max-width: 100%; }
                    </style>
                </head>
                <body>${card.outerHTML}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },
    
    async batchGenerate() {
        const schoolId = Auth.getCurrentSchoolId();
        const type = this.currentType;
        
        let users = [];
        if (type === 'student') {
            users = Storage.getStudents(schoolId);
        } else {
            users = Storage.getUsers(schoolId).filter(u => u.role === type);
        }
        
        if (users.length === 0) {
            Toast.error('No users to generate');
            return;
        }
        
        Loading.show();
        
        for (const user of users) {
            await this.generateForUser(user.id, type);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        Loading.hide();
        Toast.success(`Generated ${users.length} ID cards`);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Theme.init();
    
    if (document.getElementById('studentsApp')) {
        Students.init();
    }
    
    if (document.getElementById('scoresApp')) {
        Scores.init();
    }
    
    if (document.getElementById('idCardsApp')) {
        IDCards.init();
    }
    
    if (document.getElementById('profileApp')) {
        Profile.init();
    }
});

window.Theme = Theme;
window.Profile = Profile;
window.Students = Students;
window.Scores = Scores;
window.IDCards = IDCards;
