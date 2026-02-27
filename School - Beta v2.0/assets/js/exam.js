const Exam = {
    currentTest: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    flaggedQuestions: [],
    timerInterval: null,
    timeRemaining: 0,
    violationCount: 0,
    violations: [],
    isSubmitting: false,
    autoSaveInterval: null,
    
    init(test, questions) {
        this.currentTest = test;
        this.questions = questions;
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.flaggedQuestions = [];
        this.violationCount = 0;
        this.violations = [];
        
        // Set time remaining
        this.timeRemaining = (test.duration || 30) * 60;
        
        // Update exam header
        document.getElementById('examTitle').textContent = test.title;
        document.getElementById('examInfo').textContent = test.subject + ' | ' + test.class;
        
        // Show calculator button in exam header
        const calcBtn = document.getElementById('examCalculatorBtn');
        if (calcBtn) calcBtn.style.display = 'inline-flex';
        
        // Render question navigation
        this.renderQuestionNav();
        
        // Render first question
        this.renderQuestion();
        
        // Start timer
        this.startTimer();
        
        // Anti-cheat: detect tab switching
        this.setupAntiCheat();
    },
    
    setupAntiCheat() {
        // Tab switching detection
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.currentTest) {
                this.recordViolation('tab_switch', 'Student switched to another tab/window');
            }
        });
        
        // Window blur detection
        window.addEventListener('blur', () => {
            if (this.currentTest) {
                this.recordViolation('blur', 'Student clicked outside the exam window');
            }
        });
        
        // Mouse leaving detection
        document.addEventListener('mouseleave', (e) => {
            if (this.currentTest && e.clientY < 0) {
                this.recordViolation('mouse_leave', 'Student mouse left the exam area');
            }
        });
        
        // Prevent right-click
        document.addEventListener('contextmenu', (e) => {
            if (this.currentTest) {
                e.preventDefault();
                this.recordViolation('right_click', 'Student attempted right-click');
            }
        });
        
        // Detect copy/paste attempts
        document.addEventListener('copy', (e) => {
            if (this.currentTest) {
                e.preventDefault();
                this.recordViolation('copy', 'Student attempted to copy text');
            }
        });
        
        document.addEventListener('cut', (e) => {
            if (this.currentTest) {
                e.preventDefault();
                this.recordViolation('cut', 'Student attempted to cut text');
            }
        });
        
        document.addEventListener('paste', (e) => {
            if (this.currentTest) {
                e.preventDefault();
                this.recordViolation('paste', 'Student attempted to paste text');
            }
        });
        
        // Keyboard shortcuts prevention
        document.addEventListener('keydown', (e) => {
            if (!this.currentTest) return;
            
            // Block Alt+Tab, Alt+F4, Ctrl+W, Ctrl+Tab, F5
            if (e.altKey || e.ctrlKey || e.key === 'F5') {
                const blocked = ['Tab', 'F4', 'w', 'W', 'n', 'N', 't', 'T', 'r', 'R', 'F5'];
                if (blocked.includes(e.key) || e.altKey) {
                    e.preventDefault();
                    this.recordViolation('keyboard_shortcut', 'Student attempted keyboard shortcut: ' + e.key);
                }
            }
        });
    },
    
    recordViolation(type, description) {
        this.violationCount++;
        
        const violation = {
            type: type,
            description: description,
            timestamp: new Date().toISOString(),
            questionAtViolation: this.currentQuestionIndex + 1,
            totalQuestions: this.questions.length,
            answeredCount: Object.keys(this.answers).length
        };
        
        this.violations.push(violation);
        
        // Update violation warning in header
        const violationEl = document.getElementById('violationWarning');
        const violationCountEl = document.getElementById('violationCount');
        if (violationEl && violationCountEl) {
            violationEl.style.display = 'block';
            violationCountEl.textContent = this.violationCount;
            if (this.violationCount === 1) {
                violationEl.style.color = 'var(--warning)';
            } else if (this.violationCount === 2) {
                violationEl.style.color = 'var(--danger)';
            }
        }
        
        if (this.violationCount === 1) {
            Toast.warning('⚠️ Warning 1/3: ' + description);
        } else if (this.violationCount === 2) {
            Toast.error('⚠️ Warning 2/3: ' + description + '. Your exam will be submitted on next violation!');
            // Force review - show all questions
            this.currentQuestionIndex = 0;
            this.renderQuestion();
        } else if (this.violationCount >= 3) {
            Toast.error('🚨 Exam Auto-Submitted due to multiple violations!');
            this.autoSubmitWithViolationReport();
            return;
        }
        
        // Log violation to storage
        this.logViolation(violation);
    },
    
    logViolation(violation) {
        const schoolId = this.currentTest.schoolId;
        const storage = JSON.parse(localStorage.getItem('school_' + schoolId) || '{}');
        const examLogs = storage.examLogs || [];
        examLogs.push({
            studentId: StudentAuth.getCurrentUser().id,
            testId: this.currentTest.id,
            ...violation,
            violationNumber: this.violationCount
        });
        storage.examLogs = examLogs;
        localStorage.setItem('school_' + schoolId, JSON.stringify(storage));
    },
    
    autoSubmitWithViolationReport() {
        // Create violation report
        const violationReport = {
            id: Storage.generateId(),
            testId: this.currentTest.id,
            studentId: StudentAuth.getCurrentUser().id,
            schoolId: this.currentTest.schoolId,
            testTitle: this.currentTest.title,
            subject: this.currentTest.subject,
            className: this.currentTest.class,
            violations: this.violations,
            violationCount: this.violationCount,
            autoSubmitted: true,
            submittedAt: new Date().toISOString(),
            answeredQuestions: Object.keys(this.answers).length,
            totalQuestions: this.questions.length,
            status: 'auto_submitted'
        };
        
        // Save violation report
        const schoolId = this.currentTest.schoolId;
        const storage = JSON.parse(localStorage.getItem('school_' + schoolId) || '{}');
        const violationReports = storage.violationReports || [];
        violationReports.push(violationReport);
        storage.violationReports = violationReports;
        localStorage.setItem('school_' + schoolId, JSON.stringify(storage));
        
        // Submit exam with current answers
        this.submitExam(true);
    },
    
    startTimer() {
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.submitExam();
            } else if (this.timeRemaining <= 300) {
                document.getElementById('examTimer').classList.add('warning');
            }
        }, 1000);
        
        // Auto-save answers every 30 seconds
        this.autoSaveInterval = setInterval(() => {
            this.autoSaveAnswers();
        }, 30000);
    },
    
    autoSaveAnswers() {
        if (!this.currentTest || Object.keys(this.answers).length === 0) return;
        
        const schoolId = this.currentTest.schoolId;
        const storage = JSON.parse(localStorage.getItem('school_' + schoolId) || '{}');
        const examSessions = storage.examSessions || [];
        
        const sessionIndex = examSessions.findIndex(s => 
            s.testId === this.currentTest.id && 
            s.studentId === StudentAuth.getCurrentUser().id
        );
        
        const sessionData = {
            testId: this.currentTest.id,
            studentId: StudentAuth.getCurrentUser().id,
            answers: this.answers,
            flaggedQuestions: this.flaggedQuestions,
            currentQuestionIndex: this.currentQuestionIndex,
            lastSaved: new Date().toISOString()
        };
        
        if (sessionIndex >= 0) {
            examSessions[sessionIndex] = sessionData;
        } else {
            examSessions.push(sessionData);
        }
        
        storage.examSessions = examSessions;
        localStorage.setItem('school_' + schoolId, JSON.stringify(storage));
    },
    
    loadSavedAnswers() {
        if (!this.currentTest) return null;
        
        const schoolId = this.currentTest.schoolId;
        const storage = JSON.parse(localStorage.getItem('school_' + schoolId) || '{}');
        const examSessions = storage.examSessions || [];
        
        return examSessions.find(s => 
            s.testId === this.currentTest.id && 
            s.studentId === StudentAuth.getCurrentUser().id
        );
    },
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        document.getElementById('timerDisplay').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    
    renderQuestionNav() {
        let html = '';
        this.questions.forEach((q, index) => {
            let classes = 'question-nav-btn';
            if (index === this.currentQuestionIndex) classes += ' current';
            else if (this.answers[q.id] !== undefined) classes += ' answered';
            else if (this.flaggedQuestions.includes(q.id)) classes += ' flagged';
            
            html += `<button class="${classes}" onclick="Exam.goToQuestion(${index})">${index + 1}</button>`;
        });
        document.getElementById('questionNav').innerHTML = html;
    },
    
    renderQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        const container = document.getElementById('questionContainer');
        
        let html = `
            <div style="margin-bottom: 20px;">
                <span style="color: var(--gray);">Question ${this.currentQuestionIndex + 1} of ${this.questions.length}</span>
                <span class="test-type-badge ${question.difficulty}" style="margin-left: 10px;">${question.difficulty}</span>
            </div>
            <h3 style="margin-bottom: 20px;">${question.question}</h3>
        `;
        
        // Render based on question type
        if (question.type === 'mcq') {
            question.options.forEach((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = this.answers[question.id] === letter;
                html += `
                    <button class="option-btn ${isSelected ? 'selected' : ''}" onclick="Exam.selectOption('${letter}')">
                        <strong>${letter}.</strong> ${opt.text}
                    </button>
                `;
            });
        } else if (question.type === 'tf') {
            const isTrue = this.answers[question.id] === 'True';
            const isFalse = this.answers[question.id] === 'False';
            html += `
                <button class="option-btn ${isTrue ? 'selected' : ''}" onclick="Exam.selectOption('True')">
                    <i class="fas fa-check-circle"></i> True
                </button>
                <button class="option-btn ${isFalse ? 'selected' : ''}" onclick="Exam.selectOption('False')">
                    <i class="fas fa-times-circle"></i> False
                </button>
            `;
        } else if (question.type === 'fillblank') {
            html += `
                <div class="form-group">
                    <input type="text" class="form-control" id="fillBlankAnswer" 
                           placeholder="Type your answer here"
                           value="${this.answers[question.id] || ''}"
                           onchange="Exam.selectOption(this.value)">
                </div>
            `;
        } else if (question.type === 'essay') {
            html += `
                <div class="form-group">
                    <textarea class="form-control" id="essayAnswer" rows="8"
                           placeholder="Type your answer here"
                           onchange="Exam.selectOption(this.value)">${this.answers[question.id] || ''}</textarea>
                    <small class="text-muted">Word count: <span id="wordCount">0</span></small>
                </div>
                <script>
                    document.getElementById('essayAnswer').addEventListener('input', function() {
                        const words = this.value.trim().split(/\\s+/).filter(w => w).length;
                        document.getElementById('wordCount').textContent = words;
                    });
                </script>
            `;
        }
        
        container.innerHTML = html;
        
        // Update nav buttons
        document.getElementById('prevQuestionBtn').style.display = this.currentQuestionIndex === 0 ? 'none' : 'inline-block';
        document.getElementById('nextQuestionBtn').style.display = 
            this.currentQuestionIndex === this.questions.length - 1 ? 'none' : 'inline-block';
    },
    
    selectOption(answer) {
        const question = this.questions[this.currentQuestionIndex];
        this.answers[question.id] = answer;
        this.renderQuestion();
        this.renderQuestionNav();
    },
    
    goToQuestion(index) {
        if (index >= 0 && index < this.questions.length) {
            this.currentQuestionIndex = index;
            this.renderQuestion();
            this.renderQuestionNav();
        }
    },
    
    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.goToQuestion(this.currentQuestionIndex - 1);
        }
    },
    
    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.goToQuestion(this.currentQuestionIndex + 1);
        }
    },
    
    flagQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        const index = this.flaggedQuestions.indexOf(question.id);
        
        if (index === -1) {
            this.flaggedQuestions.push(question.id);
            Toast.info('Question flagged for review');
        } else {
            this.flaggedQuestions.splice(index, 1);
            Toast.info('Question unflagged');
        }
        
        this.renderQuestionNav();
    },
    
    submitExam(isAutoSubmit = false) {
        // Prevent duplicate submissions
        if (this.isSubmitting) {
            return;
        }
        
        clearInterval(this.timerInterval);
        
        if (isAutoSubmit) {
            // Auto-submit without confirmation
            this.isSubmitting = true;
            this.gradeExam();
            return;
        }
        
        this.isSubmitting = true;
        
        Modal.confirm({
            title: 'Submit Test',
            message: 'Are you sure you want to submit? You cannot change your answers after submission.',
            onConfirm: () => {
                this.gradeExam();
            }
        });
        
        // Reset flag after a delay if user cancels
        setTimeout(() => {
            this.isSubmitting = false;
        }, 1000);
    },
    
    gradeExam() {
        let correct = 0;
        let wrong = 0;
        let unanswered = 0;
        let totalMarks = 0;
        let obtainedMarks = 0;
        
        const gradedAnswers = this.questions.map(question => {
            const studentAnswer = this.answers[question.id];
            let isCorrect = false;
            let marksObtained = 0;
            const correctAnswer = question.correctAnswer || '';
            
            totalMarks += question.marks || 1;
            
            if (studentAnswer === undefined || studentAnswer === '') {
                unanswered++;
                marksObtained = 0;
            } else {
                // Check correct answer
                if (question.type === 'mcq' || question.type === 'tf') {
                    if (studentAnswer === correctAnswer) {
                        isCorrect = true;
                        correct++;
                        marksObtained = question.marks || 1;
                    } else {
                        wrong++;
                        marksObtained = 0;
                    }
                } else if (question.type === 'fillblank') {
                    // Auto-grade fill in the blank (case-insensitive)
                    if (studentAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
                        isCorrect = true;
                        correct++;
                        marksObtained = question.marks || 1;
                    } else {
                        wrong++;
                        marksObtained = 0;
                    }
                } else {
                    // Essay - mark as pending manual grading
                    isCorrect = null;
                    marksObtained = 0;
                }
            }
            
            obtainedMarks += marksObtained;
            
            return {
                questionId: question.id,
                studentAnswer: studentAnswer || '',
                correctAnswer: correctAnswer,
                isCorrect: isCorrect,
                marks: marksObtained
            };
        });
        
        const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
        
        // Save result
        const student = StudentAuth.getCurrentStudent();
        const result = {
            id: Storage.generateId(),
            studentId: student.id,
            schoolId: StudentAuth.getCurrentSchoolId(),
            testId: this.currentTest.id,
            testTitle: this.currentTest.title,
            subject: this.currentTest.subject,
            class: this.currentTest.class,
            testType: this.currentTest.testType,
            recordToReportCard: this.currentTest.recordToReportCard || false,
            totalMarks: totalMarks,
            obtainedMarks: obtainedMarks,
            percentage: percentage,
            answers: gradedAnswers,
            completedAt: new Date().toISOString(),
            status: 'auto-graded',
            violationCount: this.violationCount,
            violations: this.violations,
            autoSubmitted: this.violationCount >= 3
        };
        
        Storage.addItem('testResults', result);
        
        // Clear saved exam session after submission
        this.clearSavedSession();
        
        // Show results
        this.showResults(percentage, correct, wrong, unanswered, obtainedMarks, totalMarks);
    },
    
    clearSavedSession() {
        if (!this.currentTest) return;
        
        const schoolId = this.currentTest.schoolId;
        const storage = JSON.parse(localStorage.getItem('school_' + schoolId) || '{}');
        const examSessions = storage.examSessions || [];
        
        // Remove this student's session for this test
        const filteredSessions = examSessions.filter(s => 
            !(s.testId === this.currentTest.id && s.studentId === StudentAuth.getCurrentUser().id)
        );
        
        storage.examSessions = filteredSessions;
        localStorage.setItem('school_' + schoolId, JSON.stringify(storage));
    },
    
    showResults(percentage, correct, wrong, unanswered, obtained, total) {
        // Hide exam, show result
        document.getElementById('examSection').style.display = 'none';
        document.getElementById('examResultSection').style.display = 'block';
        
        // Update result display
        const scoreEl = document.getElementById('resultScore');
        scoreEl.textContent = Math.round(percentage) + '%';
        
        let scoreClass = 'poor';
        if (percentage >= 90) scoreClass = 'excellent';
        else if (percentage >= 70) scoreClass = 'good';
        else if (percentage >= 50) scoreClass = 'average';
        
        scoreEl.className = 'result-score ' + scoreClass;
        
        let message = 'Keep practicing!';
        if (percentage >= 90) message = 'Excellent!';
        else if (percentage >= 70) message = 'Good job!';
        else if (percentage >= 50) message = 'Not bad!';
        
        document.getElementById('resultMessage').textContent = message;
        document.getElementById('resultDetails').textContent = `Score: ${obtained}/${total} marks`;
        
        document.getElementById('correctCount').textContent = correct;
        document.getElementById('wrongCount').textContent = wrong;
        document.getElementById('unansweredCount').textContent = unanswered;
        
        Toast.success('Test submitted successfully!');
    }
};
