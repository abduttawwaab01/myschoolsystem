const Reports = {
    currentReportType: null,
    currentReportData: null,
    
    init() {
        try {
            this.loadStudents();
        } catch(e) {
            console.error('Reports.init error:', e);
        }
    },
    
    showReportType(type) {
        this.currentReportType = type;
        const filtersCard = document.getElementById('reportFilters');
        const contentCard = document.getElementById('reportContent');
        const filtersContent = document.getElementById('reportFiltersContent');
        const titleEl = document.getElementById('reportTypeTitle');
        
        filtersCard.style.display = 'block';
        contentCard.style.display = 'none';
        
        const schoolId = Auth.getCurrentSchoolId();
        const classes = Storage.getSchoolClasses(schoolId);
        const subjects = Storage.getSchoolSubjects(schoolId);
        
        const yearOptions = `<option value="2026">2026</option><option value="2025">2025</option><option value="2024">2024</option>`;
        const termOptions = `<option value="First Term">First Term</option><option value="Second Term">Second Term</option><option value="Third Term">Third Term</option>`;
        
        let html = '';
        
        switch(type) {
            case 'student':
                titleEl.textContent = 'Student Report';
                const students = Storage.getStudents(schoolId);
                html = `
                    <div class="form-group">
                        <label class="form-label">Student</label>
                        <select id="filterStudent" class="form-control">
                            <option value="">Select Student</option>
                            ${students.map(s => `<option value="${s.id}">${s.name} - ${s.class}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Term</label>
                        <select id="filterTerm" class="form-control">${termOptions}</select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Year</label>
                        <select id="filterYear" class="form-control">${yearOptions}</select>
                    </div>
                `;
                break;
                
            case 'class':
                titleEl.textContent = 'Class Report';
                html = `
                    <div class="form-group">
                        <label class="form-label">Class</label>
                        <select id="filterClass" class="form-control">
                            <option value="">Select Class</option>
                            ${classes.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Term</label>
                        <select id="filterTerm" class="form-control">${termOptions}</select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Year</label>
                        <select id="filterYear" class="form-control">${yearOptions}</select>
                    </div>
                `;
                break;
                
            case 'attendance':
                titleEl.textContent = 'Attendance Report';
                html = `
                    <div class="form-group">
                        <label class="form-label">Class (Optional)</label>
                        <select id="filterClass" class="form-control">
                            <option value="">All Classes</option>
                            ${classes.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date From</label>
                        <input type="date" id="filterDateFrom" class="form-control">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date To</label>
                        <input type="date" id="filterDateTo" class="form-control">
                    </div>
                `;
                break;
                
            case 'scores':
                titleEl.textContent = 'Scores Report';
                const scoreTypes = Storage.getSchoolScoreTypes(schoolId);
                html = `
                    <div class="form-group">
                        <label class="form-label">Score Type</label>
                        <select id="filterScoreType" class="form-control">
                            <option value="all">All Types</option>
                            ${scoreTypes.map(t => `<option value="${t}">${t}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Class</label>
                        <select id="filterClass" class="form-control">
                            <option value="">Select Class</option>
                            ${classes.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Subject (Optional)</label>
                        <select id="filterSubject" class="form-control">
                            <option value="">All Subjects</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Term</label>
                        <select id="filterTerm" class="form-control">${termOptions}</select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Year</label>
                        <select id="filterYear" class="form-control">${yearOptions}</select>
                    </div>
                `;
                break;
                
            case 'subject':
                titleEl.textContent = 'Subject Analysis';
                html = `
                    <div class="form-group">
                        <label class="form-label">Class</label>
                        <select id="filterClass" class="form-control">
                            <option value="">Select Class</option>
                            ${classes.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Term</label>
                        <select id="filterTerm" class="form-control">${termOptions}</select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Year</label>
                        <select id="filterYear" class="form-control">${yearOptions}</select>
                    </div>
                `;
                break;
                
            case 'finance':
                titleEl.textContent = 'Finance Report';
                html = `
                    <div class="form-group">
                        <label class="form-label">Type</label>
                        <select id="filterFinanceType" class="form-control">
                            <option value="all">All Transactions</option>
                            <option value="income">Income Only</option>
                            <option value="expense">Expenses Only</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date From</label>
                        <input type="date" id="filterDateFrom" class="form-control">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date To</label>
                        <input type="date" id="filterDateTo" class="form-control">
                    </div>
                `;
                break;
        }
        
        filtersContent.innerHTML = html;
        
        if (type === 'scores') {
            const classSelect = document.getElementById('filterClass');
            if (classSelect) {
                classSelect.addEventListener('change', function() {
                    const levelMap = {
                        'Nursery 1': 'Nursery', 'Nursery 2': 'Nursery',
                        'Primary 1': 'Primary', 'Primary 2': 'Primary', 'Primary 3': 'Primary',
                        'Primary 4': 'Primary', 'Primary 5': 'Primary', 'Primary 6': 'Primary',
                        'JSS 1': 'JSS', 'JSS 2': 'JSS', 'JSS 3': 'JSS',
                        'SS 1': 'SS', 'SS 2': 'SS', 'SS 3': 'SS'
                    };
                    const level = levelMap[this.value] || 'Primary';
                    const classSubjects = subjects[level] || [];
                    document.getElementById('filterSubject').innerHTML = '<option value="">All Subjects</option>' + 
                        classSubjects.map(s => `<option value="${s}">${s}</option>`).join('');
                });
            }
        }
    },
    
    generateSelectedReport() {
        const type = this.currentReportType;
        let data = null;
        let html = '';
        
        switch(type) {
            case 'student': {
                const studentId = document.getElementById('filterStudent').value;
                const term = document.getElementById('filterTerm').value;
                const year = document.getElementById('filterYear').value;
                data = this.generateReportCard(studentId, term, year);
                if (data) {
                    html = this.renderStudentReport(data);
                }
                break;
            }
            case 'class': {
                const className = document.getElementById('filterClass').value;
                const term = document.getElementById('filterTerm').value;
                const year = document.getElementById('filterYear').value;
                data = this.generateClassReport(className, term, year);
                if (data && data.students) {
                    html = this.renderClassReport(data);
                }
                break;
            }
            case 'attendance': {
                const className = document.getElementById('filterClass').value;
                const dateFrom = document.getElementById('filterDateFrom').value;
                const dateTo = document.getElementById('filterDateTo').value;
                data = this.generateAttendanceReport(className, dateFrom, dateTo);
                if (data) {
                    html = this.renderAttendanceReport(data);
                }
                break;
            }
            case 'scores': {
                const scoreType = document.getElementById('filterScoreType').value;
                const className = document.getElementById('filterClass').value;
                const subject = document.getElementById('filterSubject').value;
                const term = document.getElementById('filterTerm').value;
                const year = document.getElementById('filterYear').value;
                data = this.generateScoresReport(scoreType, className, subject, term, year);
                if (data) {
                    html = this.renderScoresReport(data);
                }
                break;
            }
            case 'subject': {
                const className = document.getElementById('filterClass').value;
                const term = document.getElementById('filterTerm').value;
                const year = document.getElementById('filterYear').value;
                data = this.generateSubjectAnalysis(className, term, year);
                if (data) {
                    html = this.renderSubjectAnalysis(data);
                }
                break;
            }
            case 'finance': {
                const financeType = document.getElementById('filterFinanceType').value;
                const dateFrom = document.getElementById('filterDateFrom').value;
                const dateTo = document.getElementById('filterDateTo').value;
                data = this.generateFinanceReport(financeType, dateFrom, dateTo);
                if (data) {
                    html = this.renderFinanceReport(data);
                }
                break;
            }
        }
        
        this.currentReportData = data;
        
        document.getElementById('reportContent').style.display = 'block';
        document.getElementById('reportContentBody').innerHTML = html || '<div class="empty-state"><p>No data available</p></div>';
    },
    
    renderStudentReport(data) {
        return `
            <div class="report-summary">
                <h3>${data.student.name}</h3>
                <p>Class: ${data.student.class} | Term: ${data.term} | Year: ${data.year}</p>
            </div>
            <table class="table">
                <thead><tr><th>Subject</th><th>Total</th><th>Average</th><th>Grade</th></tr></thead>
                <tbody>
                    ${data.subjects.map(s => `<tr><td>${s.subject}</td><td>${s.total}</td><td>${s.average.toFixed(1)}</td><td>${s.grade.letter}</td></tr>`).join('')}
                </tbody>
            </table>
            <div class="report-total">
                <strong>Overall Total: ${data.overallTotal} | Average: ${data.overallAverage.toFixed(1)} | Grade: ${data.overallGrade.letter}</strong>
            </div>
        `;
    },
    
    renderClassReport(data) {
        return `
            <div class="report-summary">
                <h3>Class Report: ${data.className}</h3>
                <p>Term: ${data.term} | Year: ${data.year}</p>
            </div>
            <table class="table">
                <thead><tr><th>#</th><th>Name</th><th>Total</th><th>Average</th><th>Grade</th></tr></thead>
                <tbody>
                    ${data.students.map(s => `<tr><td>${s.position}</td><td>${s.student.name}</td><td>${s.totalScore}</td><td>${s.overallAverage.toFixed(1)}</td><td>${s.overallGrade.letter}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
    },
    
    renderAttendanceReport(data) {
        return `
            <div class="report-summary">
                <h3>Attendance Report</h3>
                <p>Class: ${data.className} | From: ${data.dateFrom || 'All'} | To: ${data.dateTo || 'All'}</p>
            </div>
            <div class="stats-grid mb-3">
                <div class="stat-card">
                    <div class="stat-value">${data.summary.totalStudents}</div>
                    <div class="stat-label">Total Students</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.summary.averageAttendance}%</div>
                    <div class="stat-label">Average Attendance</div>
                </div>
            </div>
            <table class="table">
                <thead><tr><th>Name</th><th>Present</th><th>Absent</th><th>Total</th><th>%</th><th>Status</th></tr></thead>
                <tbody>
                    ${data.students.map(s => `
                        <tr>
                            <td>${s.student.name}</td>
                            <td>${s.present}</td>
                            <td>${s.absent}</td>
                            <td>${s.total}</td>
                            <td>${s.percentage}%</td>
                            <td><span class="badge badge-${s.status === 'Good' ? 'success' : s.status === 'Warning' ? 'warning' : 'danger'}">${s.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },
    
    renderScoresReport(data) {
        return `
            <div class="report-summary">
                <h3>Scores Report: ${data.type} | ${data.className}</h3>
                <p>Subject: ${data.subject} | Term: ${data.term} | Year: ${data.year}</p>
            </div>
            <div class="stats-grid mb-3">
                <div class="stat-card">
                    <div class="stat-value">${data.summary.totalStudents}</div>
                    <div class="stat-label">Students</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.summary.highestScore}</div>
                    <div class="stat-label">Highest</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.summary.lowestScore}</div>
                    <div class="stat-label">Lowest</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.summary.averageScore}</div>
                    <div class="stat-label">Class Average</div>
                </div>
            </div>
            <table class="table">
                <thead><tr><th>#</th><th>Name</th><th>Total</th><th>Average</th><th>Grade</th></tr></thead>
                <tbody>
                    ${data.students.map(s => `<tr><td>${s.position}</td><td>${s.student.name}</td><td>${s.total}</td><td>${s.average}</td><td>${s.grade.letter}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
    },
    
    renderSubjectAnalysis(data) {
        return `
            <div class="report-summary">
                <h3>Subject Analysis: ${data.className}</h3>
                <p>Term: ${data.term} | Year: ${data.year}</p>
            </div>
            <table class="table">
                <thead><tr><th>Subject</th><th>Students</th><th>Average</th><th>Highest</th><th>Lowest</th><th>A</th><th>B</th><th>C</th><th>D</th><th>F</th></tr></thead>
                <tbody>
                    ${data.subjects.map(s => `
                        <tr>
                            <td>${s.subject}</td>
                            <td>${s.count}</td>
                            <td>${s.average}</td>
                            <td>${s.highest}</td>
                            <td>${s.lowest}</td>
                            <td>${s.gradeDistribution.A}</td>
                            <td>${s.gradeDistribution.B}</td>
                            <td>${s.gradeDistribution.C}</td>
                            <td>${s.gradeDistribution.D}</td>
                            <td>${s.gradeDistribution.F}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },
    
    renderFinanceReport(data) {
        return `
            <div class="report-summary">
                <h3>Finance Report</h3>
                <p>Type: ${data.type} | From: ${data.dateFrom || 'All'} | To: ${data.dateTo || 'All'}</p>
            </div>
            <div class="stats-grid mb-3">
                <div class="stat-card">
                    <div class="stat-value" style="color: green;">₦${data.summary.totalIncome.toLocaleString()}</div>
                    <div class="stat-label">Total Income</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: red;">₦${data.summary.totalExpenses.toLocaleString()}</div>
                    <div class="stat-label">Total Expenses</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: ${data.summary.balance >= 0 ? 'green' : 'red'};">₦${data.summary.balance.toLocaleString()}</div>
                    <div class="stat-label">Balance</div>
                </div>
            </div>
            <table class="table">
                <thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead>
                <tbody>
                    ${data.transactions.map(t => `<tr><td>${t.date}</td><td><span class="badge badge-${t.type === 'income' ? 'success' : 'danger'}">${t.type}</span></td><td>${t.description || '-'}</td><td>${t.category || '-'}</td><td>₦${(t.amount || 0).toLocaleString()}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
    },
    
    loadStudents() {
        const schoolId = Auth.getCurrentSchoolId();
        const students = Storage.getStudents(schoolId);
        
        const select = document.getElementById('studentSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">Select Student</option>' +
            students.map(s => `<option value="${s.id}">${s.name} - ${s.class}</option>`).join('');
    },
    
    exportCurrentToCSV() {
        if (!this.currentReportData) {
            Toast.error('Please generate a report first');
            return;
        }
        this.exportToCSV(this.currentReportData, `${this.currentReportType}_report.csv`);
    },
    
    exportCurrentToPDF() {
        if (!this.currentReportData) {
            Toast.error('Please generate a report first');
            return;
        }
        const titles = {
            student: 'Student Report',
            class: 'Class Report',
            attendance: 'Attendance Report',
            scores: 'Scores Report',
            subject: 'Subject Analysis',
            finance: 'Finance Report'
        };
        this.exportToPDF(this.currentReportData, titles[this.currentReportType] || 'Report');
    },
    
    loadStudents() {
        const schoolId = Auth.getCurrentSchoolId();
        const students = Storage.getStudents(schoolId);
        
        const select = document.getElementById('studentSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">Select Student</option>' +
            students.map(s => `<option value="${s.id}">${s.name} - ${s.class}</option>`).join('');
    },
    
    generateReportCard(studentId, term, year) {
        const schoolId = Auth.getCurrentSchoolId();
        const school = Auth.getSchool();
        const student = Storage.getStudents(schoolId).find(s => s.id === studentId);
        
        if (!student) {
            Toast.error('Student not found');
            return null;
        }
        
        const scores = Storage.getScores(schoolId, studentId, student.class)
            .filter(s => s.term === term && s.year === parseInt(year));
        
        if (scores.length === 0) {
            Toast.warning('No scores found for this student');
            return null;
        }
        
        const scoreTypes = Storage.getSchoolScoreTypes(schoolId);
        const typeMap = { 'Daily': 'daily', 'Weekly': 'weekly', 'Mid-term': 'midterm', 'Exam': 'exam' };
        
        const subjects = [...new Set(scores.map(s => s.subject))];
        const reportData = {
            student,
            term,
            year,
            school,
            scoreTypes,
            typeMap,
            subjects: subjects.map(subject => {
                const subjectScores = scores.filter(s => s.subject === subject);
                const total = subjectScores.reduce((sum, s) => sum + (s.score || 0), 0);
                const average = total / subjectScores.length;
                
                const subjectTypeScores = {};
                scoreTypes.forEach(t => {
                    const key = typeMap[t] || t.toLowerCase();
                    subjectTypeScores[key] = subjectScores.find(s => s.type === key)?.score || 0;
                });
                
                return {
                    subject,
                    scores: subjectScores,
                    typeScores: subjectTypeScores,
                    total,
                    average,
                    grade: this.getGrade(average),
                    position: 0
                };
            })
        };
        
        const totals = reportData.subjects.reduce((sum, s) => sum + s.total, 0);
        const overallAverage = totals / reportData.subjects.length;
        reportData.overallTotal = totals;
        reportData.overallAverage = overallAverage;
        reportData.overallGrade = this.getGrade(overallAverage);
        
        const allClassStudents = Storage.getStudentsByClass(schoolId, student.class);
        const classRankings = allClassStudents.map(s => {
            const sScores = Storage.getScores(schoolId, s.id, student.class)
                .filter(sc => sc.term === term && sc.year === parseInt(year));
            const sSubjects = [...new Set(sScores.map(sc => sc.subject))];
            const sTotal = sSubjects.reduce((sum, sub) => {
                const subScores = sScores.filter(sc => sc.subject === sub);
                return sum + subScores.reduce((ss, sc) => ss + (sc.score || 0), 0);
            }, 0);
            return { id: s.id, total: sTotal };
        }).sort((a, b) => b.total - a.total);
        
        reportData.classPosition = classRankings.findIndex(r => r.id === studentId) + 1;
        reportData.classTotal = classRankings.length;
        
        const allStudents = Storage.getStudents(schoolId);
        const overallRankings = allStudents.map(s => {
            const sScores = Storage.getScores(schoolId, s.id)
                .filter(sc => sc.term === term && sc.year === parseInt(year));
            const sSubjects = [...new Set(sScores.map(sc => sc.subject))];
            const sTotal = sSubjects.reduce((sum, sub) => {
                const subScores = sScores.filter(sc => sc.subject === sub);
                return sum + subScores.reduce((ss, sc) => ss + (sc.score || 0), 0);
            }, 0);
            return { id: s.id, total: sTotal };
        }).sort((a, b) => b.total - a.total);
        
        reportData.overallPosition = overallRankings.findIndex(r => r.id === studentId) + 1;
        reportData.overallStudentCount = overallRankings.length;
        
        const attendance = Storage.getAttendance(schoolId);
        const termAttendance = attendance.filter(a => 
            a.studentId === studentId && 
            a.term === term && 
            a.year === parseInt(year)
        );
        const presentCount = termAttendance.filter(a => a.status === 'present').length;
        const absentCount = termAttendance.filter(a => a.status === 'absent').length;
        const totalDays = presentCount + absentCount;
        const attendancePercent = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;
        
        reportData.attendance = {
            present: presentCount,
            absent: absentCount,
            total: totalDays,
            percentage: attendancePercent
        };
        
        reportData.teacherRemark = student.teacherRemark || '';
        reportData.principalRemark = student.principalRemark || '';
        
        return reportData;
    },
    
    getGrade(average) {
        if (average >= 90) return { letter: 'A', grade: 'Excellent', point: 4.0 };
        if (average >= 80) return { letter: 'B', grade: 'Very Good', point: 3.5 };
        if (average >= 70) return { letter: 'C', grade: 'Good', point: 3.0 };
        if (average >= 60) return { letter: 'D', grade: 'Fair', point: 2.5 };
        if (average >= 50) return { letter: 'E', grade: 'Pass', point: 2.0 };
        return { letter: 'F', grade: 'Fail', point: 0.0 };
    },
    
    renderReportCard(reportData) {
        const container = document.getElementById('reportCardContent');
        if (!container) return;
        
        const school = Auth.getSchool();
        const schoolColor = school?.idCardColor || '#16a34a';
        const schoolLogo = school?.logoUrl || '';
        const isThirdTerm = reportData.term && (reportData.term.includes('Third') || reportData.term.includes('3rd'));
        
        const lightColor = schoolColor + '15';
        const borderColor = schoolColor + '40';
        
        let html = `
            <div class="report-card" style="max-width:900px;margin:0 auto;padding:25px;border:3px solid ${schoolColor};background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
                <div class="report-header" style="text-align:center;border-bottom:3px solid ${schoolColor};padding-bottom:20px;margin-bottom:25px;">
                    ${schoolLogo ? `<img src="${schoolLogo}" alt="Logo" style="width:80px;height:80px;border-radius:50%;margin-bottom:10px;object-fit:contain;border:2px solid ${schoolColor};">` : ''}
                    <h2 style="margin:0;font-size:28px;color:${schoolColor};font-weight:700;">${school?.name || 'School'}</h2>
                    <p style="margin:8px 0 0;font-size:13px;color:#64748b;">${school?.address || ''} | ${school?.phone || ''} | ${school?.email || ''}</p>
                    <p style="margin:15px 0 0;font-size:18px;font-weight:600;background:${schoolColor};color:#fff;padding:8px 20px;border-radius:20px;display:inline-block;">${isThirdTerm ? 'Cumulative Report Card - ' + reportData.year + ' (All Terms)' : reportData.term + ' Term Report Card - ' + reportData.year}</p>
                </div>
                <div class="report-student-info" style="display:flex;flex-wrap:wrap;gap:20px;margin-bottom:25px;">
                    <div style="flex:1;min-width:200px;background:${lightColor};padding:15px;border-radius:10px;border-left:4px solid ${schoolColor};">
                        <table style="width:100%;border-collapse:collapse;">
                            <tr><td style="padding:6px;color:#64748b;font-size:12px;"><strong>Student Name:</strong></td><td style="padding:6px;font-weight:600;">${reportData.student.name}</td></tr>
                            <tr><td style="padding:6px;color:#64748b;font-size:12px;"><strong>Admission No:</strong></td><td style="padding:6px;font-weight:600;">${reportData.student.admissionNo || reportData.student.id.slice(-6)}</td></tr>
                            <tr><td style="padding:6px;color:#64748b;font-size:12px;"><strong>Class:</strong></td><td style="padding:6px;font-weight:600;">${reportData.student.class}</td></tr>
                            <tr><td style="padding:6px;color:#64748b;font-size:12px;"><strong>Gender:</strong></td><td style="padding:6px;">${reportData.student.gender || '-'}</td></tr>
                            <tr><td style="padding:6px;color:#64748b;font-size:12px;"><strong>Date of Birth:</strong></td><td style="padding:6px;">${reportData.student.dob || '-'}</td></tr>
                        </table>
                    </div>
                    <div style="flex:1;min-width:200px;background:${lightColor};padding:15px;border-radius:10px;border-left:4px solid ${schoolColor};">
                        <table style="width:100%;border-collapse:collapse;">
                            <tr><td style="padding:6px;color:#64748b;font-size:12px;"><strong>Parent/Guardian:</strong></td><td style="padding:6px;font-weight:600;">${reportData.student.parentName || '-'}</td></tr>
                            <tr><td style="padding:6px;color:#64748b;font-size:12px;"><strong>Phone:</strong></td><td style="padding:6px;">${reportData.student.parentPhone || '-'}</td></tr>
                            <tr><td style="padding:6px;color:#64748b;font-size:12px;"><strong>Class Position:</strong></td><td style="padding:6px;font-weight:600;color:${schoolColor};">${reportData.classPosition} of ${reportData.classTotal}</td></tr>
                            <tr><td style="padding:6px;color:#64748b;font-size:12px;"><strong>Overall Position:</strong></td><td style="padding:6px;font-weight:600;color:${schoolColor};">${reportData.overallPosition} of ${reportData.overallStudentCount}</td></tr>
                        </table>
                    </div>
                </div>
        `;
        
        if (isThirdTerm) {
            // Third Term - Cumulative Report
            html += `
                <table class="report-table" style="width:100%;border-collapse:collapse;border:2px solid ${schoolColor};margin-bottom:25px;border-radius:8px;overflow:hidden;">
                    <thead>
                        <tr style="background:${schoolColor};color:#fff;">
                            <th style="border:1px solid ${borderColor};padding:12px;text-align:left;">Subject</th>
                            <th style="border:1px solid ${borderColor};padding:12px;text-align:center;">1st Term</th>
                            <th style="border:1px solid ${borderColor};padding:12px;text-align:center;">2nd Term</th>
                            <th style="border:1px solid ${borderColor};padding:12px;text-align:center;">3rd Term</th>
                            <th style="border:1px solid ${borderColor};padding:12px;text-align:center;">Total</th>
                            <th style="border:1px solid ${borderColor};padding:12px;text-align:center;">Average</th>
                            <th style="border:1px solid ${borderColor};padding:12px;text-align:center;">Grade</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            let grandTotal = 0;
            reportData.subjects.forEach((subject, idx) => {
                const first = subject.firstTermScore || 0;
                const second = subject.secondTermScore || 0;
                const third = subject.thirdTermScore || 0;
                const total = first + second + third;
                const avg = total / 3;
                grandTotal += total;
                
                const gradeClass = subject.grade.letter >= 'C' ? 'success' : 'warning';
                const rowBg = idx % 2 === 0 ? '#fff' : '#f8fafc';
                
                html += `
                    <tr style="background:${rowBg};">
                        <td style="border:1px solid ${borderColor};padding:10px;"><strong>${subject.subject}</strong></td>
                        <td style="border:1px solid ${borderColor};padding:10px;text-align:center;">${first}</td>
                        <td style="border:1px solid ${borderColor};padding:10px;text-align:center;">${second}</td>
                        <td style="border:1px solid ${borderColor};padding:10px;text-align:center;">${third}</td>
                        <td style="border:1px solid ${borderColor};padding:10px;text-align:center;font-weight:700;color:${schoolColor};">${total}</td>
                        <td style="border:1px solid ${borderColor};padding:10px;text-align:center;">${avg.toFixed(1)}</td>
                        <td style="border:1px solid ${borderColor};padding:10px;text-align:center;"><span class="badge badge-${gradeClass}" style="padding:4px 10px;border-radius:12px;font-weight:600;">${subject.grade.letter}</span></td>
                    </tr>
                `;
            });
            
            const maxScore = reportData.subjects.length * 300;
            const percentage = (grandTotal / maxScore * 100).toFixed(1);
            
            html += `
                    </tbody>
                    <tfoot>
                        <tr style="background:${schoolColor};color:#fff;font-weight:bold;">
                            <td colspan="3" style="border:1px solid ${borderColor};padding:12px;">OVERALL TOTAL</td>
                            <td style="border:1px solid ${borderColor};padding:12px;text-align:center;">${grandTotal}</td>
                            <td style="border:1px solid ${borderColor};padding:12px;text-align:center;">${(grandTotal / reportData.subjects.length).toFixed(1)}</td>
                            <td style="border:1px solid ${borderColor};padding:12px;text-align:center;">${percentage}%</td>
                            <td style="border:1px solid ${borderColor};padding:12px;text-align:center;"><span class="badge" style="background:#fff;color:${schoolColor};padding:4px 10px;border-radius:12px;font-weight:700;">${reportData.overallGrade.letter}</span></td>
                        </tr>
                    </tfoot>
                </table>
            `;
        } else {
            // First or Second Term - Simple format
            html += `
                <table class="report-table" style="width:100%;border-collapse:collapse;border:2px solid ${schoolColor};margin-bottom:25px;border-radius:8px;overflow:hidden;">
                    <thead>
                        <tr style="background:${schoolColor};color:#fff;">
                            <th style="border:1px solid ${borderColor};padding:12px;text-align:left;">Subject</th>
                            <th style="border:1px solid ${borderColor};padding:12px;text-align:center;">Score</th>
                            <th style="border:1px solid ${borderColor};padding:12px;text-align:center;">Grade</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            reportData.subjects.forEach((subject, idx) => {
                const gradeClass = subject.grade.letter >= 'C' ? 'success' : 'warning';
                const rowBg = idx % 2 === 0 ? '#fff' : '#f8fafc';
                
                html += `
                    <tr style="background:${rowBg};">
                        <td style="border:1px solid ${borderColor};padding:10px;"><strong>${subject.subject}</strong></td>
                        <td style="border:1px solid ${borderColor};padding:10px;text-align:center;font-weight:700;color:${schoolColor};font-size:16px;">${subject.total || '-'}</td>
                        <td style="border:1px solid ${borderColor};padding:10px;text-align:center;"><span class="badge badge-${gradeClass}" style="padding:4px 12px;border-radius:12px;font-weight:600;">${subject.grade.letter}</span></td>
                    </tr>
                `;
            });
            
            html += `
                    </tbody>
                    <tfoot>
                        <tr style="background:${schoolColor};color:#fff;font-weight:bold;">
                            <td style="border:1px solid ${borderColor};padding:12px;">Overall Total / Average</td>
                            <td style="border:1px solid ${borderColor};padding:12px;text-align:center;font-size:16px;">${reportData.overallTotal} / ${reportData.overallAverage.toFixed(1)}</td>
                            <td style="border:1px solid ${borderColor};padding:12px;text-align:center;"><span class="badge" style="background:#fff;color:${schoolColor};padding:4px 10px;border-radius:12px;font-weight:700;">${reportData.overallGrade.letter}</span></td>
                        </tr>
                    </tfoot>
                </table>
            `;
        }
        
        // Shared content for all terms (attendance, remarks, signatures, footer)
        html += `
                
                <div style="display:flex;flex-wrap:wrap;gap:20px;margin-bottom:25px;">
                    <div style="flex:1;min-width:200px;padding:15px;border:2px solid ${schoolColor};border-radius:10px;background:${lightColor};">
                        <h4 style="margin:0 0 12px;border-bottom:2px solid ${schoolColor};padding-bottom:8px;color:${schoolColor};font-weight:600;"><i class="fas fa-calendar-check"></i> Attendance</h4>
                        <table style="width:100%;">
                            <tr><td style="padding:6px;color:#64748b;">Present:</td><td style="padding:6px;font-weight:700;color:${schoolColor};font-size:16px;">${reportData.attendance.present} days</td></tr>
                            <tr><td style="padding:6px;color:#64748b;">Absent:</td><td style="padding:6px;font-weight:600;color:#dc2626;">${reportData.attendance.absent} days</td></tr>
                            <tr><td style="padding:6px;color:#64748b;">Total:</td><td style="padding:6px;font-weight:600;">${reportData.attendance.total} days</td></tr>
                            <tr><td style="padding:6px;color:#64748b;">Percentage:</td><td style="padding:6px;font-weight:700;color:${schoolColor};font-size:18px;">${reportData.attendance.percentage}%</td></tr>
                        </table>
                    </div>
                    <div style="flex:1;min-width:200px;padding:15px;border:2px solid ${schoolColor};border-radius:10px;background:${lightColor};">
                        <h4 style="margin:0 0 12px;border-bottom:2px solid ${schoolColor};padding-bottom:8px;color:${schoolColor};font-weight:600;"><i class="fas fa-chart-line"></i> Performance Summary</h4>
                        <table style="width:100%;">
                            <tr><td style="padding:6px;color:#64748b;">Overall Average:</td><td style="padding:6px;font-weight:700;color:${schoolColor};font-size:16px;">${reportData.overallAverage.toFixed(1)}%</td></tr>
                            <tr><td style="padding:6px;color:#64748b;">Grade:</td><td style="padding:6px;font-weight:700;"><span class="badge badge-${reportData.overallGrade.letter >= 'C' ? 'success' : 'warning'}" style="padding:4px 10px;border-radius:12px;">${reportData.overallGrade.grade} (${reportData.overallGrade.letter})</span></td></tr>
                            <tr><td style="padding:6px;color:#64748b;">Class Rank:</td><td style="padding:6px;font-weight:600;">${reportData.classPosition} out of ${reportData.classTotal}</td></tr>
                            <tr><td style="padding:6px;color:#64748b;">Overall Rank:</td><td style="padding:6px;font-weight:600;">${reportData.overallPosition} out of ${reportData.overallStudentCount}</td></tr>
                        </table>
                    </div>
                </div>
                
                <div style="display:flex;flex-wrap:wrap;gap:20px;margin-bottom:25px;">
                    <div style="flex:1;min-width:250px;">
                        <label style="display:block;margin-bottom:8px;font-weight:600;color:${schoolColor};"><i class="fas fa-chalkboard-teacher"></i> Teacher's Remark:</label>
                        <textarea id="teacherRemark" style="width:100%;padding:12px;border:2px solid ${schoolColor};border-radius:8px;min-height:70px;font-family:inherit;" placeholder="Enter teacher's remark...">${reportData.teacherRemark}</textarea>
                        <button class="btn btn-sm" style="margin-top:8px;background:${schoolColor};color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;" onclick="Reports.saveRemark('${reportData.student.id}', 'teacherRemark')">Save Remark</button>
                    </div>
                    <div style="flex:1;min-width:250px;">
                        <label style="display:block;margin-bottom:8px;font-weight:600;color:${schoolColor};"><i class="fas fa-user-tie"></i> Principal's Remark:</label>
                        <textarea id="principalRemark" style="width:100%;padding:12px;border:2px solid ${schoolColor};border-radius:8px;min-height:70px;font-family:inherit;" placeholder="Enter principal's remark...">${reportData.principalRemark}</textarea>
                        <button class="btn btn-sm" style="margin-top:8px;background:${schoolColor};color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;" onclick="Reports.saveRemark('${reportData.student.id}', 'principalRemark')">Save Remark</button>
                    </div>
                </div>
                
                <div style="display:flex;justify-content:space-between;margin-top:30px;padding-top:25px;border-top:3px solid ${schoolColor};">
                    <div style="text-align:center;flex:1;">
                        <p style="margin-bottom:40px;font-weight:600;color:${schoolColor};">Teacher's Signature:</p>
                        <div style="width:150px;height:50px;border-bottom:3px solid ${schoolColor};margin:0 auto;border-radius:2px;"></div>
                    </div>
                    <div style="text-align:center;flex:1;">
                        <p style="margin-bottom:40px;font-weight:600;color:${schoolColor};">Principal's/Director's Signature:</p>
                        <div style="width:150px;height:50px;border-bottom:3px solid ${schoolColor};margin:0 auto;border-radius:2px;"></div>
                    </div>
                </div>
                
                <div class="report-footer" style="margin-top:25px;padding-top:15px;border-top:1px solid ${borderColor};text-align:center;">
                    <p style="margin:8px 0;font-size:11px;color:#64748b;"><strong>Grade Key:</strong> A (90-100): Excellent | B (80-89): Very Good | C (70-79): Good | D (60-69): Fair | E (50-59): Pass | F (0-49): Fail</p>
                    <p style="margin:8px 0;font-size:10px;color:#94a3b8;"><i class="fas fa-school"></i> My School System - Odebunmi Tawwab</p>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    },
    
    saveRemark(studentId, field) {
        
        if (format === 'pdf') {
            this.printReport(reportData);
            return;
        }
        
        const typeHeaders = reportData.scoreTypes.map(t => {
            const key = reportData.typeMap[t] || t.toLowerCase();
            return { display: t, key };
        });
        
        let headers = 'Subject,';
        typeHeaders.forEach(t => headers += `${t.display},`);
        headers += 'Total,Average,Grade\n';
        
        let csv = headers;
        reportData.subjects.forEach(sub => {
            let row = `${sub.subject},`;
            typeHeaders.forEach(t => row += `${sub.typeScores[t.key] || 0},`);
            row += `${sub.total},${sub.average.toFixed(1)},${sub.grade.letter}\n`;
            csv += row;
        });
        
        csv += `\n,,${typeHeaders.map(() => '').join(',')}OVERALL TOTAL,${reportData.overallTotal}\n`;
        csv += `,,${typeHeaders.map(() => '').join(',')}OVERALL AVERAGE,${reportData.overallAverage.toFixed(1)}\n`;
        csv += `,,${typeHeaders.map(() => '').join(',')}OVERALL GRADE,${reportData.overallGrade.letter} - ${reportData.overallGrade.grade}\n`;
        csv += `\nAttendance,Present,Absent,Total,Percentage\n`;
        csv += `,,,${reportData.attendance.present},${reportData.attendance.absent},${reportData.attendance.total},${reportData.attendance.percentage}%\n`;
        csv += `\nPosition,Class Position,Overall Position\n`;
        csv += `,,${reportData.classPosition} of ${reportData.classTotal},${reportData.overallPosition} of ${reportData.overallStudentCount}\n`;
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${reportData.student.name.replace(/\s/g, '_')}_${reportData.term}_${reportData.year}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        Toast.success('CSV exported successfully');
    },
    
    printReport(reportData) {
        const school = Auth.getSchool();
        const schoolColor = school?.idCardColor || '#16a34a';
        const schoolLogo = school?.logoUrl || '';
        const lightColor = schoolColor + '15';
        const borderColor = schoolColor + '40';
        
        const typeHeaders = reportData.scoreTypes.map(t => {
            const key = reportData.typeMap[t] || t.toLowerCase();
            return { display: t, key };
        });
        
        let scoreHeaders = typeHeaders.map(t => `<th style="border:1px solid ${borderColor};padding:10px;background:${schoolColor};color:#fff;">${t.display}</th>`).join('');
        
        let html = `<div id="reportCardExport" style="width:850px;background:#fff;padding:30px;font-family:'Segoe UI',Arial, sans-serif;border-radius:12px;border:3px solid ${schoolColor};">
                <div style="text-align:center;padding-bottom:20px;border-bottom:3px solid ${schoolColor};margin-bottom:25px;">
                    ${schoolLogo ? `<img src="${schoolLogo}" alt="Logo" style="width:80px;height:80px;border-radius:50%;margin-bottom:10px;border:2px solid ${schoolColor};">` : ''}
                    <h1 style="text-align:center;color:${schoolColor};margin-bottom:5px;font-size:28px;font-weight:700;">${school?.name || 'School'}</h1>
                    <p style="text-align:center;margin:8px 0;font-size:13px;color:#64748b;">${school?.address || ''} | ${school?.phone || ''} | ${school?.email || ''}</p>
                    <p style="text-align:center;font-size:18px;font-weight:600;background:${schoolColor};color:#fff;padding:10px 25px;border-radius:25px;display:inline-block;margin-top:15px;">${reportData.term} Term Report Card - ${reportData.year}</p>
                </div>
                <div class="summary" style="background:${lightColor};padding:20px;margin:20px 0;border-radius:10px;border-left:4px solid ${schoolColor};">
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="padding:8px;"><strong>Student Name:</strong> ${reportData.student.name}</td>
                            <td style="padding:8px;"><strong>Admission No:</strong> ${reportData.student.admissionNo || reportData.student.id.slice(-6)}</td>
                            <td style="padding:8px;"><strong>Class:</strong> ${reportData.student.class}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px;"><strong>Gender:</strong> ${reportData.student.gender || '-'}</td>
                            <td style="padding:8px;"><strong>Parent/Guardian:</strong> ${reportData.student.parentName || '-'}</td>
                            <td style="padding:8px;"><strong>Phone:</strong> ${reportData.student.parentPhone || '-'}</td>
                        </tr>
                    </table>
                </div>
                <table style="width:100%;border-collapse:collapse;margin:25px 0;border:2px solid ${schoolColor};border-radius:8px;overflow:hidden;">
                    <tr style="background:${schoolColor};color:#fff;">
                        <th style="border:1px solid ${borderColor};padding:12px;">Subject</th>
                        ${scoreHeaders}
                        <th style="border:1px solid ${borderColor};padding:12px;">Total</th>
                        <th style="border:1px solid ${borderColor};padding:12px;">Avg</th>
                        <th style="border:1px solid ${borderColor};padding:12px;">Grade</th>
                    </tr>
                    ${reportData.subjects.map((sub, idx) => {
                        let scores = typeHeaders.map(t => `<td style="border:1px solid ${borderColor};padding:10px;text-align:center;background:${idx % 2 === 0 ? '#fff' : '#f8fafc'};">${sub.typeScores[t.key] || '-'}</td>`).join('');
                        const gradeClass = sub.grade.letter >= 'C' ? 'success' : 'warning';
                        return `<tr><td style="border:1px solid ${borderColor};padding:10px;background:${idx % 2 === 0 ? '#fff' : '#f8fafc'};"><strong>${sub.subject}</strong></td>${scores}<td style="border:1px solid ${borderColor};padding:10px;text-align:center;background:${idx % 2 === 0 ? '#fff' : '#f8fafc'};font-weight:700;color:${schoolColor};">${sub.total}</td><td style="border:1px solid ${borderColor};padding:10px;text-align:center;background:${idx % 2 === 0 ? '#fff' : '#f8fafc'};">${sub.average.toFixed(1)}</td><td style="border:1px solid ${borderColor};padding:10px;text-align:center;background:${idx % 2 === 0 ? '#fff' : '#f8fafc'};"><span style="background:${gradeClass === 'success' ? schoolColor : '#f59e0b'};color:#fff;padding:4px 10px;border-radius:12px;font-weight:600;">${sub.grade.letter}</span></td></tr>`;
                    }).join('')}
                </table>
                <div style="display:flex;gap:25px;margin:25px 0;">
                    <div style="flex:1;background:${lightColor};padding:20px;border-radius:10px;border:2px solid ${schoolColor};">
                        <p style="margin:0 0 12px;font-weight:700;color:${schoolColor};border-bottom:2px solid ${schoolColor};padding-bottom:8px;"><i class="fas fa-calendar-check"></i> Attendance</p>
                        <p style="margin:8px 0;">Present: <strong style="color:${schoolColor};font-size:18px;">${reportData.attendance.present} days</strong></p>
                        <p style="margin:8px 0;">Absent: <strong style="color:#dc2626;">${reportData.attendance.absent} days</strong></p>
                        <p style="margin:8px 0;">Total: <strong>${reportData.attendance.total} days</strong></p>
                        <p style="margin:8px 0;font-size:18px;font-weight:700;color:${schoolColor};">Percentage: ${reportData.attendance.percentage}%</p>
                    </div>
                    <div style="flex:1;background:${lightColor};padding:20px;border-radius:10px;border:2px solid ${schoolColor};">
                        <p style="margin:0 0 12px;font-weight:700;color:${schoolColor};border-bottom:2px solid ${schoolColor};padding-bottom:8px;"><i class="fas fa-chart-line"></i> Performance</p>
                        <p style="margin:8px 0;">Overall Average: <strong style="color:${schoolColor};font-size:18px;">${reportData.overallAverage.toFixed(1)}%</strong></p>
                        <p style="margin:8px 0;">Grade: <strong style="font-size:18px;">${reportData.overallGrade.letter} (${reportData.overallGrade.grade})</strong></p>
                        <p style="margin:8px 0;">Class Rank: <strong>${reportData.classPosition} of ${reportData.classTotal}</strong></p>
                        <p style="margin:8px 0;">Overall Rank: <strong>${reportData.overallPosition} of ${reportData.overallStudentCount}</strong></p>
                    </div>
                </div>
                <div style="display:flex;gap:25px;margin:25px 0;">
                    <div style="flex:1;">
                        <p style="margin:0 0 8px;font-weight:600;color:${schoolColor};"><strong>Teacher's Remark:</strong> ${reportData.teacherRemark || '-'}</p>
                        <p style="margin:0;border-bottom:3px solid ${schoolColor};padding-bottom:25px;">Teacher's Signature: _________________</p>
                    </div>
                    <div style="flex:1;">
                        <p style="margin:0 0 8px;font-weight:600;color:${schoolColor};"><strong>Principal's Remark:</strong> ${reportData.principalRemark || '-'}</p>
                        <p style="margin:0;border-bottom:3px solid ${schoolColor};padding-bottom:25px;">Principal's Signature: _________________</p>
                    </div>
                </div>
                <p style="text-align:center;font-size:10px;color:#94a3b8;margin-top:25px;padding-top:15px;border-top:1px solid ${borderColor};"><i class="fas fa-school"></i> My School System - Odebunmi Tawwab</p>
            </div>`;
            const temp = document.createElement('div');
            temp.innerHTML = html;
            document.body.appendChild(temp);
            const exportEl = temp.querySelector('#reportCardExport');
            if (window.html2canvas && window.jspdf) {
                window.html2canvas(exportEl).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'pt', format: [canvas.width, canvas.height] });
                    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                    pdf.save(`report_${reportData.student.name.replace(/\s/g, '_')}_${reportData.term}_${reportData.year}.pdf`);
                    Toast.success('PDF exported successfully');
                    document.body.removeChild(temp);
                });
            } else {
                Toast.error('PDF export requires html2canvas and jsPDF libraries');
                document.body.removeChild(temp);
            }
    },
    
    exportStudentReportDOC(reportData) {
        const school = Auth.getSchool();
        const schoolColor = school?.idCardColor || '#16a34a';
        
        let html = `<html><head><style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; }
            h1 { text-align: center; color: ${schoolColor}; font-size: 28px; font-weight: 700; }
            .header { text-align: center; border-bottom: 3px solid ${schoolColor}; padding-bottom: 20px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; border: 2px solid ${schoolColor}; }
            th, td { border: 1px solid ${schoolColor}40; padding: 10px; text-align: left; }
            th { background: ${schoolColor}; color: white; padding: 12px; }
            .summary { background: ${schoolColor}15; padding: 20px; margin: 20px 0; border-radius: 10px; border-left: 4px solid ${schoolColor}; }
            .grade-a { background: ${schoolColor}; color: white; padding: 4px 10px; border-radius: 12px; }
            .grade-b { background: #3b82f6; color: white; padding: 4px 10px; border-radius: 12px; }
            .grade-c { background: #f59e0b; color: white; padding: 4px 10px; border-radius: 12px; }
            .grade-f { background: #dc2626; color: white; padding: 4px 10px; border-radius: 12px; }
        </style></head><body>`;
        
        html += `
            <div class="header">
                <h1>${school?.name || 'School'}</h1>
                <p style="color: #64748b;">${school?.address || ''} | ${school?.phone || ''} | ${school?.email || ''}</p>
                <p style="background: ${schoolColor}; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin-top: 10px;">${reportData.term} Term Report Card - ${reportData.year}</p>
            </div>`;
        
        html += `<div class="summary">`;
        html += `<p><strong>Student Name:</strong> ${reportData.student.name}</p>`;
        html += `<p><strong>Admission No:</strong> ${reportData.student.admissionNo || reportData.student.id.slice(-6)}</p>`;
        html += `<p><strong>Class:</strong> ${reportData.student.class}</p>`;
        html += `<p><strong>Term:</strong> ${reportData.term}</p>`;
        html += `<p><strong>Year:</strong> ${reportData.year}</p>`;
        html += `</div>`;
        
        html += `<table><tr><th>Subject</th><th>Total</th><th>Average</th><th>Grade</th></tr>`;
        reportData.subjects.forEach(sub => {
            let gradeClass = 'grade-c';
            if (sub.grade.letter >= 'A' && sub.grade.letter <= 'B') gradeClass = 'grade-b';
            else if (sub.grade.letter >= 'C') gradeClass = 'grade-c';
            else gradeClass = 'grade-f';
            html += `<tr><td><strong>${sub.subject}</strong></td><td style="text-align:center;font-weight:700;color:${schoolColor};">${sub.total}</td><td style="text-align:center;">${sub.average.toFixed(1)}</td><td style="text-align:center;"><span class="${gradeClass}">${sub.grade.letter}</span></td></tr>`;
        });
        html += `</table>`;
        
        html += `<div class="summary">`;
        html += `<p><strong>Overall Total:</strong> ${reportData.overallTotal}</p>`;
        html += `<p><strong>Overall Average:</strong> <span style="font-size:18px;font-weight:700;color:${schoolColor};">${reportData.overallAverage.toFixed(1)}%</span></p>`;
        html += `<p><strong>Overall Grade:</strong> ${reportData.overallGrade.letter} - ${reportData.overallGrade.grade}</p>`;
        html += `</div></body></html>`;
        
        const blob = new Blob([html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${reportData.student.name.replace(/\s/g, '_')}_${reportData.term}.doc`;
        a.click();
        URL.revokeObjectURL(url);
        Toast.success('DOC exported successfully');
    },
    
    generateClassReport(className, term, year) {
        const schoolId = Auth.getCurrentSchoolId();
        const students = Storage.getStudentsByClass(schoolId, className);
        
        if (students.length === 0) {
            return { students: [], message: 'No students in this class' };
        }
        
        const classScores = Storage.getScores(schoolId, null, className)
            .filter(s => s.term === term && s.year === parseInt(year));
        
        const studentReports = students.map(student => {
            const scores = classScores.filter(s => s.studentId === student.id);
            const subjects = [...new Set(scores.map(s => s.subject))];
            
            const subjectData = subjects.map(subject => {
                const subjectScores = scores.filter(s => s.subject === subject);
                const total = subjectScores.reduce((sum, s) => sum + (s.score || 0), 0);
                const average = total / (subjectScores.length || 1);
                return { subject, total, average, grade: this.getGrade(average) };
            });
            
            const totalScore = subjectData.reduce((sum, s) => sum + s.total, 0);
            const overallAverage = totalScore / (subjectData.length || 1);
            
            return {
                student,
                subjects: subjectData,
                totalScore,
                overallAverage,
                overallGrade: this.getGrade(overallAverage)
            };
        });
        
        studentReports.sort((a, b) => b.overallAverage - a.overallAverage);
        studentReports.forEach((r, i) => r.position = i + 1);
        
        return {
            className,
            term,
            year,
            students: studentReports
        };
    },
    
    generateAttendanceReport(className, dateFrom, dateTo, type = 'daily') {
        const schoolId = Auth.getCurrentSchoolId();
        
        let students;
        if (className) {
            students = Storage.getStudentsByClass(schoolId, className);
        } else {
            students = Storage.getStudents(schoolId);
        }
        
        const attendance = Storage.getData('attendance')
            .filter(a => a.schoolId === schoolId)
            .filter(a => {
                if (dateFrom && dateTo) {
                    return a.date >= dateFrom && a.date <= dateTo;
                }
                return true;
            });
        
        const report = students.map(student => {
            const studentAttendance = attendance.filter(a => a.studentId === student.id);
            const present = studentAttendance.filter(a => a.status === 'present').length;
            const absent = studentAttendance.filter(a => a.status === 'absent').length;
            const total = studentAttendance.length;
            const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
            
            return {
                student,
                present,
                absent,
                total,
                percentage: parseFloat(percentage),
                status: percentage >= 75 ? 'Good' : percentage >= 50 ? 'Warning' : 'Poor'
            };
        });
        
        return {
            className: className || 'All Classes',
            dateFrom,
            dateTo,
            type,
            students: report,
            summary: {
                totalStudents: report.length,
                averageAttendance: (report.reduce((sum, r) => sum + r.percentage, 0) / (report.length || 1)).toFixed(1)
            }
        };
    },
    
    generateScoresReport(type, className, subject, term, year) {
        const schoolId = Auth.getCurrentSchoolId();
        let scores = Storage.getScores(schoolId, null, className)
            .filter(s => s.term === term && s.year === parseInt(year));
        
        if (subject) {
            scores = scores.filter(s => s.subject === subject);
        }
        
        if (type && type !== 'all') {
            scores = scores.filter(s => s.scoreType === type);
        }
        
        const students = className ? Storage.getStudentsByClass(schoolId, className) : Storage.getStudents(schoolId);
        
        const report = students.map(student => {
            const studentScores = scores.filter(s => s.studentId === student.id);
            const total = studentScores.reduce((sum, s) => sum + (s.score || 0), 0);
            const average = studentScores.length > 0 ? total / studentScores.length : 0;
            
            return {
                student,
                scores: studentScores,
                total,
                average: parseFloat(average.toFixed(1)),
                grade: this.getGrade(average)
            };
        }).filter(r => r.scores.length > 0);
        
        report.sort((a, b) => b.average - a.average);
        report.forEach((r, i) => r.position = i + 1);
        
        return {
            type: type || 'All',
            className: className || 'All Classes',
            subject: subject || 'All Subjects',
            term,
            year,
            students: report,
            summary: {
                totalStudents: report.length,
                highestScore: Math.max(...report.map(r => r.average)),
                lowestScore: Math.min(...report.map(r => r.average)),
                averageScore: (report.reduce((sum, r) => sum + r.average, 0) / (report.length || 1)).toFixed(1)
            }
        };
    },
    
    generateSubjectAnalysis(className, term, year) {
        const schoolId = Auth.getCurrentSchoolId();
        const subjects = Storage.getSchoolSubjects(schoolId);
        
        const levelMap = {
            'Nursery 1': 'Nursery', 'Nursery 2': 'Nursery',
            'Primary 1': 'Primary', 'Primary 2': 'Primary', 'Primary 3': 'Primary',
            'Primary 4': 'Primary', 'Primary 5': 'Primary', 'Primary 6': 'Primary',
            'JSS 1': 'JSS', 'JSS 2': 'JSS', 'JSS 3': 'JSS',
            'SS 1': 'SS', 'SS 2': 'SS', 'SS 3': 'SS'
        };
        
        const level = levelMap[className] || 'Primary';
        const classSubjects = subjects[level] || [];
        
        const analysis = classSubjects.map(subject => {
            const scores = Storage.getScores(schoolId, null, className)
                .filter(s => s.subject === subject && s.term === term && s.year === parseInt(year));
            
            if (scores.length === 0) {
                return { subject, count: 0, average: 0, highest: 0, lowest: 0 };
            }
            
            const values = scores.map(s => s.score);
            const average = values.reduce((a, b) => a + b, 0) / values.length;
            
            return {
                subject,
                count: scores.length,
                average: parseFloat(average.toFixed(1)),
                highest: Math.max(...values),
                lowest: Math.min(...values),
                gradeDistribution: {
                    A: scores.filter(s => s.score >= 90).length,
                    B: scores.filter(s => s.score >= 80 && s.score < 90).length,
                    C: scores.filter(s => s.score >= 70 && s.score < 80).length,
                    D: scores.filter(s => s.score >= 60 && s.score < 70).length,
                    F: scores.filter(s => s.score < 60).length
                }
            };
        }).filter(a => a.count > 0);
        
        analysis.sort((a, b) => b.average - a.average);
        
        return {
            className,
            term,
            year,
            subjects: analysis
        };
    },
    
    generateStudentAnalysis(studentId) {
        const schoolId = Auth.getCurrentSchoolId();
        const student = Storage.getStudents(schoolId).find(s => s.id === studentId);
        
        if (!student) return null;
        
        const scores = Storage.getScores(schoolId, studentId, student.class);
        const attendance = Storage.getData('attendance')
            .filter(a => a.schoolId === schoolId && a.studentId === studentId);
        
        const terms = [...new Set(scores.map(s => s.term))];
        const termPerformance = terms.map(term => {
            const termScores = scores.filter(s => s.term === term);
            const total = termScores.reduce((sum, s) => sum + (s.score || 0), 0);
            const average = termScores.length > 0 ? total / termScores.length : 0;
            return { term, average: parseFloat(average.toFixed(1)), count: termScores.length };
        });
        
        const subjectPerformance = {};
        scores.forEach(s => {
            if (!subjectPerformance[s.subject]) {
                subjectPerformance[s.subject] = [];
            }
            subjectPerformance[s.subject].push(s.score);
        });
        
        const subjectAnalysis = Object.keys(subjectPerformance).map(subject => {
            const scores_arr = subjectPerformance[subject];
            const average = scores_arr.reduce((a, b) => a + b, 0) / scores_arr.length;
            return { subject, average: parseFloat(average.toFixed(1)), tests: scores_arr.length };
        });
        
        const present = attendance.filter(a => a.status === 'present').length;
        const total = attendance.length;
        const attendancePercentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
        
        return {
            student,
            termPerformance,
            subjectAnalysis,
            attendance: { present, total, percentage: parseFloat(attendancePercentage) }
        };
    },
    
    generateFinanceReport(type = 'all', dateFrom, dateTo) {
        const schoolId = Auth.getCurrentSchoolId();
        let transactions = Storage.getData('finance').filter(t => t.schoolId === schoolId);
        
        if (dateFrom && dateTo) {
            transactions = transactions.filter(t => t.date >= dateFrom && t.date <= dateTo);
        }
        
        if (type === 'income') {
            transactions = transactions.filter(t => t.type === 'income');
        } else if (type === 'expense') {
            transactions = transactions.filter(t => t.type === 'expense');
        }
        
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const categoryBreakdown = {};
        transactions.forEach(t => {
            const cat = t.category || 'Other';
            if (!categoryBreakdown[cat]) categoryBreakdown[cat] = 0;
            categoryBreakdown[cat] += t.amount || 0;
        });
        
        return {
            type,
            dateFrom,
            dateTo,
            transactions,
            summary: {
                totalIncome: income,
                totalExpenses: expenses,
                balance: income - expenses,
                transactionCount: transactions.length,
                categoryBreakdown
            }
        };
    },
    
    exportToCSV(data, filename) {
        let csv = '';
        
        const school = Auth.getSchool();
        if (data.students) {
            csv += `School Name,${school.name}\n`;
            csv += `School Details,${school.address || ''} ${school.phone || ''}\n`;
            csv += 'Name,Class,Total,Average,Grade,Position\n';
            data.students.forEach(s => {
                csv += `${s.student?.name || s.name},${s.student?.class || s.className || ''},${s.totalScore || s.total || ''},${s.overallAverage || s.average || ''},${s.overallGrade?.letter || s.grade?.letter || ''},${s.position || ''}\n`;
            });
        } else if (data.transactions) {
            csv += `School Name,${school.name}\n`;
            csv += `School Details,${school.address || ''} ${school.phone || ''}\n`;
            csv += 'Date,Type,Description,Category,Amount\n';
            data.transactions.forEach(t => {
                csv += `${t.date},${t.type},${t.description || ''},${t.category || ''},${t.amount}\n`;
            });
            csv += `\nTotal Income,${data.summary.totalIncome}\n`;
            csv += `Total Expenses,${data.summary.totalExpenses}\n`;
            csv += `Balance,${data.summary.balance}\n`;
        } else if (data.subjects) {
            csv += `School Name,${school.name}\n`;
            csv += `School Details,${school.address || ''} ${school.phone || ''}\n`;
            csv += 'Subject,Count,Average,Highest,Lowest\n';
            data.subjects.forEach(s => {
                csv += `${s.subject},${s.count},${s.average},${s.highest},${s.lowest}\n`;
            });
        }
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'report.csv';
        a.click();
        URL.revokeObjectURL(url);
        Toast.success('CSV exported successfully');
    },
    
    exportToPDF(data, title, filename) {
        const school = Auth.getSchool();
        let html = `<html><head><title>${title}</title><style>
            body { font-family: Arial; padding: 20px; }
            h1 { text-align: center; color: #16a34a; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #16a34a; color: white; }
            .summary { background: #f5f5f5; padding: 15px; margin: 20px 0; }
            .good { color: green; }
            .warning { color: orange; }
            .poor { color: red; }
        </style></head><body><h1>${school.name} - ${title}</h1>`;
        html += `<div class="summary"><strong>School Details:</strong> ${school.address || ''} ${school.phone || ''}</div>`;
        
        if (data.summary) {
            html += '<div class="summary">';
            Object.keys(data.summary).forEach(key => {
                if (typeof data.summary[key] === 'object') return;
                html += `<p><strong>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> ${data.summary[key]}</p>`;
            });
            html += '</div>';
        }
        
        if (data.students) {
            html += '<table><tr><th>Name</th><th>Class</th><th>Total</th><th>Average</th><th>Grade</th></tr>';
            data.students.forEach(s => {
                const gradeClass = s.overallGrade?.letter === 'A' ? 'good' : s.overallGrade?.letter === 'F' ? 'poor' : 'warning';
                html += `<tr><td>${s.student?.name || s.name || ''}</td><td>${s.student?.class || s.className || ''}</td><td>${s.totalScore || s.total || ''}</td><td>${s.overallAverage || s.average || ''}</td><td class="${gradeClass}">${s.overallGrade?.letter || s.grade?.letter || ''}</td></tr>`;
            });
            html += '</table>';
        }
        
        html += '</body></html>';
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    },
    
    exportToDOC(data, title, filename) {
        const school = Auth.getSchool();
        let html = `<html><head><meta charset="utf-8"><style>
            body { font-family: Arial; padding: 20px; }
            h1 { text-align: center; color: #16a34a; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background: #16a34a; color: white; }
        </style></head><body><h1>${school.name} - ${title}</h1>`;
        html += `<div style="background:#f5f5f5;padding:15px;margin:20px 0;"><strong>School Details:</strong> ${school.address || ''} ${school.phone || ''}</div>`;
        
        if (data.summary) {
            html += '<div style="background:#f5f5f5;padding:15px;margin:20px 0;">';
            Object.keys(data.summary).forEach(key => {
                if (typeof data.summary[key] === 'object') return;
                html += `<p><strong>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> ${data.summary[key]}</p>`;
            });
            html += '</div>';
        }
        
        if (data.students) {
            html += '<table><tr><th>Name</th><th>Class</th><th>Total</th><th>Average</th><th>Grade</th></tr>';
            data.students.forEach(s => {
                html += `<tr><td>${s.student?.name || s.name || ''}</td><td>${s.student?.class || s.className || ''}</td><td>${s.totalScore || s.total || ''}</td><td>${s.overallAverage || s.average || ''}</td><td>${s.overallGrade?.letter || s.grade?.letter || ''}</td></tr>`;
            });
            html += '</table>';
        }
        
        html += '</body></html>';
        
        const blob = new Blob([html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'report.doc';
        a.click();
        URL.revokeObjectURL(url);
        Toast.success('DOC exported successfully');
    },
    
    generateAttendanceReport(className, dateFrom, dateTo, type = 'daily') {
        const schoolId = Auth.getCurrentSchoolId();
        const students = className 
            ? Storage.getStudentsByClass(schoolId, className)
            : Storage.getStudents(schoolId);
        
        const daysInMonth = Utils.getDaysInMonth(year, month - 1);
        
        let report = students.map(student => {
            const attendance = Storage.getAttendance(schoolId)
                .filter(a => {
                    const date = new Date(a.date);
                    return a.studentId === student.id && 
                           date.getMonth() === month - 1 &&
                           date.getFullYear() === year;
                });
            
            const present = attendance.filter(a => a.status === 'present').length;
            const percentage = daysInMonth ? (present / daysInMonth) * 100 : 0;
            
            return {
                student,
                present,
                absent: daysInMonth - present,
                total: daysInMonth,
                percentage: percentage.toFixed(1)
            };
        });
        
        report.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
        
        return {
            className,
            month,
            year,
            daysInMonth,
            report,
            summary: {
                averageAttendance: report.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / report.length,
                perfectAttendance: report.filter(r => r.percentage === '100.0').length
            }
        };
    }
};

// IDCard functions are now in idcard.js

// Rename Scores to ScoresApp to avoid conflict
window.ScoresApp = {
    init() {
        this.loadClasses();
        this.loadScoreTypes();
    },
    
    loadClasses() {
        const schoolId = Auth.getCurrentSchoolId();
        const classes = Storage.getSchoolClasses(schoolId);
        
        const select = document.getElementById('scoreClassSelect');
        if (select) {
            select.innerHTML = '<option value="">Select Class</option>' + 
                classes.map(c => `<option value="${c}">${c}</option>`).join('');
            
            select.addEventListener('change', () => this.loadSubjects());
        }
    },
    
    loadSubjects() {
        const className = document.getElementById('scoreClassSelect').value;
        if (!className) return;
        
        const schoolId = Auth.getCurrentSchoolId();
        const subjects = Storage.getSchoolSubjects(schoolId);
        
        const levelMap = {
            'Nursery 1': 'Nursery', 'Nursery 2': 'Nursery',
            'Primary 1': 'Primary', 'Primary 2': 'Primary', 'Primary 3': 'Primary',
            'Primary 4': 'Primary', 'Primary 5': 'Primary', 'Primary 6': 'Primary',
            'JSS 1': 'JSS', 'JSS 2': 'JSS', 'JSS 3': 'JSS',
            'SS 1': 'SS', 'SS 2': 'SS', 'SS 3': 'SS'
        };
        
        const level = levelMap[className] || 'Primary';
        const classSubjects = subjects[level] || [];
        
        const select = document.getElementById('scoreSubjectSelect');
        if (select) {
            select.innerHTML = classSubjects.map(s => `<option value="${s}">${s}</option>`).join('');
        }
    },
    
    loadScoreTypes() {
        const schoolId = Auth.getCurrentSchoolId();
        const scoreTypes = Storage.getSchoolScoreTypes(schoolId);
        
        const container = document.getElementById('reportCardContent');
        if (!container) return;
        const school = Auth.getSchool();
        const student = reportData.student;
        let html = `<div class="report-card">
            <div class="report-header">
                <div style="display:flex;align-items:center;gap:24px;">
                    <div>
                        <h2>${school?.name || 'School'}</h2>
                        <p>${school?.address || ''} ${school?.phone || ''}</p>
                    </div>
                    <div style="margin-left:auto;text-align:right;">
                        <img src="${student.passportUrl || '../assets/img/default-passport.png'}" alt="Passport" style="width:100px;height:120px;border:2px solid #16a34a;border-radius:8px;object-fit:cover;">
                    </div>
                </div>
            </div>
            <div class="report-student-info" style="display:flex;gap:32px;margin-top:16px;">
                <div style="flex:1;">
                    <p><strong>Name:</strong> ${student.name}</p>
                    <p><strong>Class:</strong> ${student.class}</p>
                    <p><strong>Gender:</strong> ${student.gender || '-'}</p>
                    <p><strong>DOB:</strong> ${student.dob || '-'}</p>
                    <p><strong>Parent:</strong> ${student.parentname || '-'}</p>
                    <p><strong>Parent Phone:</strong> ${student.parentphone || '-'}</p>
                </div>
                <div style="flex:1;">
                    <p><strong>Term:</strong> ${reportData.term}</p>
                    <p><strong>Year:</strong> ${reportData.year}</p>
                    <p><strong>Position:</strong> ${student.position || '-'}</p>
                    <p><strong>Attendance:</strong> ${student.attendanceCount || '-'}</p>
                    <p><strong>Resumption Date:</strong> ${student.resumptionDate || '-'}</p>
                </div>
            </div>
            <table class="report-table" style="margin-top:24px;">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Mid-term</th>
                        <th>Exam</th>
                        <th>Total</th>
                        <th>Aggregate (3rd Term)</th>
                        <th>Grade</th>
                    </tr>
                </thead>
                <tbody>`;
        reportData.subjects.forEach(subject => {
            const midterm = subject.scores.find(s => s.scoreType === 'Mid-term')?.score || '-';
            const exam = subject.scores.find(s => s.scoreType === 'Exam')?.score || '-';
            const aggregate = reportData.term === 'Third Term' ? (subject.aggregate || '-') : '-';
            html += `<tr>
                <td>${subject.subject}</td>
                <td>${midterm}</td>
                <td>${exam}</td>
                <td>${subject.total}</td>
                <td>${aggregate}</td>
                <td><span class="badge badge-${subject.grade.letter >= 'C' ? 'success' : 'warning'}">${subject.grade.letter}</span></td>
            </tr>`;
        });
        html += `</tbody>
                <tfoot>
                    <tr>
                        <td colspan="3"><strong>Overall Total</strong></td>
                        <td><strong>${reportData.overallTotal}</strong></td>
                        <td><strong>${reportData.overallAverage.toFixed(1)}</strong></td>
                        <td><strong>${reportData.overallGrade.letter}</strong></td>
                    </tr>
                </tfoot>
            </table>
            <div class="report-footer" style="margin-top:24px;">
                <div style="display:flex;gap:32px;">
                    <div style="flex:1;">
                        <p><strong>Principal's Remark:</strong> ${student.principalRemark || '-'}</p>
                        <p><strong>Principal's Signature:</strong> <span style="display:inline-block;width:80px;height:24px;border-bottom:1px solid #333;"></span></p>
                    </div>
                    <div style="flex:1;">
                        <p><strong>Teacher's Remark:</strong> ${student.teacherRemark || '-'}</p>
                        <p><strong>Teacher's Signature:</strong> <span style="display:inline-block;width:80px;height:24px;border-bottom:1px solid #333;"></span></p>
                    </div>
                </div>
                <p style="margin-top:16px;"><strong>Grade Key:</strong> A (90-100): Excellent | B (80-89): Very Good | C (70-79): Good | D (60-69): Fair | E (50-59): Pass | F (0-49): Fail</p>
            </div>
        </div>`;
        container.innerHTML = html;
        container.innerHTML = html;
    },
    
    addScore() {
        const className = document.getElementById('scoreClassSelect').value;
        const subject = document.getElementById('scoreSubjectSelect').value;
        const term = document.getElementById('scoreTermSelect').value;
        const year = document.getElementById('scoreYearSelect').value;
        
        if (!className || !subject) {
            Toast.error('Please select class and subject');
            return;
        }
        
        const schoolId = Auth.getCurrentSchoolId();
        const students = Storage.getStudentsByClass(schoolId, className);
        
        let html = '<div class="form-group"><label>Select Student:</label><select id="scoreStudentSelect" class="form-control"><option value="">Select Student</option>';
        students.forEach(s => {
            html += `<option value="${s.id}">${s.name}</option>`;
        });
        html += '</select></div>';
        
        html += '<div class="form-group"><label>Score (0-100):</label><input type="number" id="scoreValue" class="form-control" min="0" max="100"></div>';
        
        Modal.confirm({
            title: 'Add Score',
            message: html,
            onConfirm: () => {
                const studentId = document.getElementById('scoreStudentSelect').value;
                const score = parseInt(document.getElementById('scoreValue').value);
                
                if (!studentId || isNaN(score) || score < 0 || score > 100) {
                    Toast.error('Please select a student and enter a valid score (0-100)');
                    return;
                }
                
                const scoreData = {
                    studentId,
                    class: className,
                    subject,
                    term,
                    year: parseInt(year),
                    score,
                    schoolId,
                    createdAt: new Date().toISOString()
                };
                
                Storage.addItem('scores', scoreData);
                
                const user = Auth.getCurrentUser();
                const student = students.find(s => s.id === studentId);
                Auth.logActivity(user.id, 'score_entry', `Added ${subject} score for ${student?.name}`);
                Auth.addNotification(user.id, `Added ${subject} score (${score}) for ${student?.name}`, 'score');
                
                Toast.success('Score added successfully');
                this.loadScores();
            }
        });
    },
    
    editScore(studentId) {
        const className = document.getElementById('scoreClassSelect').value;
        const subject = document.getElementById('scoreSubjectSelect').value;
        const term = document.getElementById('scoreTermSelect').value;
        const year = document.getElementById('scoreYearSelect').value;
        
        const schoolId = Auth.getCurrentSchoolId();
        const scores = Storage.getScores(schoolId, studentId, className);
        const existingScore = scores.find(s => 
            s.studentId === studentId && s.subject === subject && s.term === term && s.year === parseInt(year)
        );
        
        if (!existingScore) return;
        
        const html = '<div class="form-group"><label>Score (0-100):</label><input type="number" id="scoreValue" class="form-control" min="0" max="100" value="' + existingScore.score + '"></div>';
        
        Modal.confirm({
            title: 'Edit Score',
            message: html,
            onConfirm: () => {
                const newScore = parseInt(document.getElementById('scoreValue').value);
                
                if (isNaN(newScore) || newScore < 0 || newScore > 100) {
                    Toast.error('Please enter a valid score (0-100)');
                    return;
                }
                
                Storage.updateItem('scores', existingScore.id, { score: newScore });
                Toast.success('Score updated successfully');
                this.loadScores();
            }
        });
    },
    
    exportReport(format) {
        const schoolId = Auth.getCurrentSchoolId();
        const school = Auth.getSchool();
        if (!schoolId) { Toast.error('No school selected'); return; }
        
        const reportType = this.currentReportType;
        if (!reportType) { Toast.error('Please generate a report first'); return; }
        
        const getEl = (id) => document.getElementById(id);
        const classVal = getEl('filterClass')?.value;
        const studentVal = getEl('filterStudent')?.value;
        const termVal = getEl('filterTerm')?.value;
        const yearVal = getEl('filterYear')?.value;
        
        const schoolScoreTypes = Storage.getSchoolScoreTypes(schoolId);
        
        const getReportContent = () => {
            let html = '';
            
            if (reportType === 'student' && studentVal && termVal && yearVal) {
                const student = Storage.getItemById('students', studentVal);
                const scores = Storage.getScores(schoolId, studentVal).filter(s => s.term === termVal && s.year === parseInt(yearVal));
                
                html = `
                    <div style="padding: 20px; font-family: Arial, sans-serif;">
                        <h2 style="text-align: center; color: #16a34a;">${school?.name || 'School'}</h2>
                        <p style="text-align: center;">${school?.address || ''} | ${school?.phone || ''}</p>
                        <h3 style="text-align: center; margin: 20px 0;">Student Report - ${termVal} ${yearVal}</h3>
                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <tr><td><strong>Student:</strong> ${student?.name || 'N/A'}</td><td><strong>Class:</strong> ${student?.class || 'N/A'}</td></tr>
                        </table>
                        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                            <tr style="background: #16a34a; color: white;">
                                <th style="padding: 10px; border: 1px solid #16a34a;">Subject</th>
                                <th style="padding: 10px; border: 1px solid #16a34a;">Type</th>
                                <th style="padding: 10px; border: 1px solid #16a34a;">Score</th>
                                <th style="padding: 10px; border: 1px solid #16a34a;">Grade</th>
                            </tr>
                            ${scores.map(s => {
                                const grade = s.score >= 90 ? 'A' : s.score >= 80 ? 'B' : s.score >= 70 ? 'C' : s.score >= 60 ? 'D' : s.score >= 50 ? 'E' : 'F';
                                return `<tr><td style="padding: 8px; border: 1px solid #ddd;">${s.subject}</td><td style="padding: 8px; border: 1px solid #ddd;">${s.type}</td><td style="padding: 8px; border: 1px solid #ddd;">${s.score}</td><td style="padding: 8px; border: 1px solid #ddd;">${grade}</td></tr>`;
                            }).join('')}
                        </table>
                        <p style="text-align: center; font-size: 9px; color: #999; margin-top: 30px;">My School System - Odebunmi Tawwab</p>
                    </div>
                `;
            } else if (reportType === 'class' && classVal && termVal && yearVal) {
                const students = Storage.getStudentsByClass(schoolId, classVal);
                html = `
                    <div style="padding: 20px; font-family: Arial, sans-serif;">
                        <h2 style="text-align: center; color: #16a34a;">${school?.name || 'School'}</h2>
                        <p style="text-align: center;">${school?.address || ''} | ${school?.phone || ''}</p>
                        <h3 style="text-align: center; margin: 20px 0;">Class Report - ${classVal} ${termVal} ${yearVal}</h3>
                        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                            <tr style="background: #16a34a; color: white;">
                                <th style="padding: 10px; border: 1px solid #16a34a;">Student</th>
                                <th style="padding: 10px; border: 1px solid #16a34a;">Subject</th>
                                <th style="padding: 10px; border: 1px solid #16a34a;">Type</th>
                                <th style="padding: 10px; border: 1px solid #16a34a;">Score</th>
                            </tr>
                `;
                students.forEach(student => {
                    const scores = Storage.getScores(schoolId, student.id).filter(s => s.class === classVal && s.term === termVal && s.year === parseInt(yearVal));
                    if (scores.length === 0) {
                        html += `<tr><td style="padding: 8px; border: 1px solid #ddd;">${student.name}</td><td style="padding: 8px; border: 1px solid #ddd;">N/A</td><td style="padding: 8px; border: 1px solid #ddd;">N/A</td><td style="padding: 8px; border: 1px solid #ddd;">0</td></tr>`;
                    } else {
                        scores.forEach(s => {
                            html += `<tr><td style="padding: 8px; border: 1px solid #ddd;">${student.name}</td><td style="padding: 8px; border: 1px solid #ddd;">${s.subject}</td><td style="padding: 8px; border: 1px solid #ddd;">${s.type}</td><td style="padding: 8px; border: 1px solid #ddd;">${s.score}</td></tr>`;
                        });
                    }
                });
                html += `</table><p style="text-align: center; font-size: 9px; color: #999; margin-top: 30px;">My School System - Odebunmi Tawwab</p></div>`;
            } else if (reportType === 'attendance' && termVal && yearVal) {
                const classFilter = classVal || '';
                const students = classFilter ? Storage.getStudentsByClass(schoolId, classFilter) : Storage.getStudents(schoolId);
                const attendance = Storage.getAttendance(schoolId).filter(a => a.term === termVal && a.year === parseInt(yearVal));
                
                html = `
                    <div style="padding: 20px; font-family: Arial, sans-serif;">
                        <h2 style="text-align: center; color: #16a34a;">${school?.name || 'School'}</h2>
                        <p style="text-align: center;">${school?.address || ''} | ${school?.phone || ''}</p>
                        <h3 style="text-align: center; margin: 20px 0;">Attendance Report - ${termVal} ${yearVal}</h3>
                        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                            <tr style="background: #16a34a; color: white;">
                                <th style="padding: 10px; border: 1px solid #16a34a;">Student</th>
                                <th style="padding: 10px; border: 1px solid #16a34a;">Class</th>
                                <th style="padding: 10px; border: 1px solid #16a34a;">Present</th>
                                <th style="padding: 10px; border: 1px solid #16a34a;">Absent</th>
                                <th style="padding: 10px; border: 1px solid #16a34a;">Total</th>
                                <th style="padding: 10px; border: 1px solid #16a34a;">%</th>
                            </tr>
                `;
                students.forEach(student => {
                    const stuAtt = attendance.filter(a => a.studentId === student.id);
                    const present = stuAtt.filter(a => a.status === 'present').length;
                    const absent = stuAtt.filter(a => a.status === 'absent').length;
                    const total = present + absent;
                    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
                    html += `<tr><td style="padding: 8px; border: 1px solid #ddd;">${student.name}</td><td style="padding: 8px; border: 1px solid #ddd;">${student.class}</td><td style="padding: 8px; border: 1px solid #ddd;">${present}</td><td style="padding: 8px; border: 1px solid #ddd;">${absent}</td><td style="padding: 8px; border: 1px solid #ddd;">${total}</td><td style="padding: 8px; border: 1px solid #ddd;">${pct}%</td></tr>`;
                });
                html += `</table><p style="text-align: center; font-size: 9px; color: #999; margin-top: 30px;">My School System - Odebunmi Tawwab</p></div>`;
            } else if (reportType === 'scores' && classVal && termVal && yearVal) {
                const students = Storage.getStudentsByClass(schoolId, classVal);
                const scoreTypeFilter = getEl('filterScoreType')?.value || 'all';
                
                html = `
                    <div style="padding: 20px; font-family: Arial, sans-serif;">
                        <h2 style="text-align: center; color: #16a34a;">${school?.name || 'School'}</h2>
                        <p style="text-align: center;">${school?.address || ''} | ${school?.phone || ''}</p>
                        <h3 style="text-align: center; margin: 20px 0;">Scores Report - ${classVal} ${termVal} ${yearVal}</h3>
                        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                            <tr style="background: #16a34a; color: white;">
                                <th style="padding: 10px; border: 1px solid #16a34a;">Student</th>
                                <th style="padding: 10px; border: 1px solid #16a34a;">Subject</th>
                                <th style="padding: 10px; border: 1px solid #16a34a;">Type</th>
                                <th style="padding: 10px; border: 1px solid #16a34a;">Score</th>
                            </tr>
                `;
                students.forEach(student => {
                    let scores = Storage.getScores(schoolId, student.id).filter(s => s.class === classVal && s.term === termVal && s.year === parseInt(yearVal));
                    if (scoreTypeFilter !== 'all') scores = scores.filter(s => s.type === scoreTypeFilter);
                    
                    if (scores.length === 0) {
                        html += `<tr><td style="padding: 8px; border: 1px solid #ddd;">${student.name}</td><td style="padding: 8px; border: 1px solid #ddd;">N/A</td><td style="padding: 8px; border: 1px solid #ddd;">N/A</td><td style="padding: 8px; border: 1px solid #ddd;">0</td></tr>`;
                    } else {
                        scores.forEach(s => {
                            html += `<tr><td style="padding: 8px; border: 1px solid #ddd;">${student.name}</td><td style="padding: 8px; border: 1px solid #ddd;">${s.subject}</td><td style="padding: 8px; border: 1px solid #ddd;">${s.type}</td><td style="padding: 8px; border: 1px solid #ddd;">${s.score}</td></tr>`;
                        });
                    }
                });
                html += `</table><p style="text-align: center; font-size: 9px; color: #999; margin-top: 30px;">My School System - Odebunmi Tawwab</p></div>`;
            }
            
            return html;
        };
        
        if (format === 'csv') {
            let csv = '';
            let filename = '';
            
            if (reportType === 'student' && studentVal && termVal && yearVal) {
                const student = Storage.getItemById('students', studentVal);
                const scores = Storage.getScores(schoolId, studentVal).filter(s => s.term === termVal && s.year === parseInt(yearVal));
                csv = 'Subject,Type,Score,Grade\n';
                scores.forEach(s => {
                    const grade = s.score >= 90 ? 'A' : s.score >= 80 ? 'B' : s.score >= 70 ? 'C' : s.score >= 60 ? 'D' : s.score >= 50 ? 'E' : 'F';
                    csv += `${s.subject},${s.type},${s.score},${grade}\n`;
                });
                filename = `student_report_${student?.name?.replace(/\s/g,'_') || 'student'}_${termVal}_${yearVal}.csv`;
            } else if (reportType === 'class' && classVal && termVal && yearVal) {
                const students = Storage.getStudentsByClass(schoolId, classVal);
                csv = 'Student,Subject,Type,Score\n';
                students.forEach(student => {
                    const scores = Storage.getScores(schoolId, student.id).filter(s => s.class === classVal && s.term === termVal && s.year === parseInt(yearVal));
                    if (scores.length === 0) {
                        csv += `${student.name},N/A,N/A,0\n`;
                    } else {
                        scores.forEach(s => {
                            csv += `${student.name},${s.subject},${s.type},${s.score}\n`;
                        });
                    }
                });
                filename = `class_scores_${classVal}_${termVal}_${yearVal}.csv`;
            } else if (reportType === 'attendance' && termVal && yearVal) {
                const classFilter = classVal || '';
                const students = classFilter ? Storage.getStudentsByClass(schoolId, classFilter) : Storage.getStudents(schoolId);
                const attendance = Storage.getAttendance(schoolId).filter(a => a.term === termVal && a.year === parseInt(yearVal));
                csv = 'Student,Class,Present,Absent,Total,Percentage\n';
                students.forEach(student => {
                    const stuAtt = attendance.filter(a => a.studentId === student.id);
                    const present = stuAtt.filter(a => a.status === 'present').length;
                    const absent = stuAtt.filter(a => a.status === 'absent').length;
                    const total = present + absent;
                    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
                    csv += `${student.name},${student.class},${present},${absent},${total},${pct}%\n`;
                });
                filename = `attendance_${classFilter || 'all'}_${termVal}_${yearVal}.csv`;
            } else if (reportType === 'scores' && classVal && termVal && yearVal) {
                const students = Storage.getStudentsByClass(schoolId, classVal);
                const scoreTypeFilter = getEl('filterScoreType')?.value || 'all';
                csv = 'Student,Subject,Type,Score\n';
                students.forEach(student => {
                    let scores = Storage.getScores(schoolId, student.id).filter(s => s.class === classVal && s.term === termVal && s.year === parseInt(yearVal));
                    if (scoreTypeFilter !== 'all') scores = scores.filter(s => s.type === scoreTypeFilter);
                    if (scores.length === 0) {
                        csv += `${student.name},N/A,N/A,0\n`;
                    } else {
                        scores.forEach(s => {
                            csv += `${student.name},${s.subject},${s.type},${s.score}\n`;
                        });
                    }
                });
                filename = `scores_${classVal}_${termVal}_${yearVal}.csv`;
            }
            
            if (csv) {
                csv += `\nMy School System - Odebunmi Tawwab`;
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
                Toast.success('Report exported to CSV');
            } else {
                Toast.error('Please select required fields for export');
            }
        } else if (format === 'pdf' || format === 'doc') {
            const content = getReportContent();
            if (!content) {
                Toast.error('No data to export');
                return;
            }
            
            const fullHtml = `<!DOCTYPE html><html><head><title>Report</title></head><body>${content}</body></html>`;
            
            if (format === 'doc') {
                const blob = new Blob([fullHtml], { type: 'application/msword' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `report_${reportType}_${new Date().toISOString().split('T')[0]}.doc`;
                a.click();
                URL.revokeObjectURL(url);
                Toast.success('Report exported to DOC');
            } else {
                const temp = document.createElement('div');
                temp.innerHTML = content;
                document.body.appendChild(temp);
                
                if (window.html2canvas && window.jspdf) {
                    html2canvas(temp, { scale: 2 }).then(canvas => {
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new window.jspdf.jsPDF({ orientation: canvas.width > canvas.height ? 'landscape' : 'portrait', unit: 'pt', format: [canvas.width, canvas.height] });
                        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                        pdf.save(`report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
                        document.body.removeChild(temp);
                        Toast.success('Report exported to PDF');
                    }).catch(err => {
                        document.body.removeChild(temp);
                        Toast.error('Error generating PDF');
                    });
                } else {
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(fullHtml);
                    printWindow.document.close();
                    printWindow.print();
                    document.body.removeChild(temp);
                    Toast.success('Report opened for printing/saving as PDF');
                }
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    try {
        if (document.getElementById('reportsApp')) {
            Reports.init();
        }
    } catch(e) {
        console.error('Reports init error:', e);
    }
});

window.Reports = Reports;
