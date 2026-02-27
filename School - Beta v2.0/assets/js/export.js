const ExportUtils = {
    exportToPDF(htmlContent, filename = 'export.pdf') {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.onload = function() {
            printWindow.print();
        };
    },

    exportToDOC(htmlContent, filename = 'export.doc') {
        const docContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>${filename}</title>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `;
        
        const blob = new Blob([docContent], {
            type: 'application/msword'
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    generateQuestionsPrintHTML(questions, options = {}) {
        const { title = 'Questions', includeAnswers = false, schoolName = 'My School', ownerName = 'Odebunmi Tawwab' } = options;
        
        let html = '<html><head><title>' + title + '</title>';
        html += '<style>';
        html += 'body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }';
        html += '.header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }';
        html += '.school-name { font-size: 28px; font-weight: bold; color: #1a1a1a; margin-bottom: 10px; }';
        html += '.test-title { font-size: 20px; margin-top: 10px; color: #333; }';
        html += '.exam-info { margin-top: 10px; color: #666; font-size: 14px; }';
        html += '.instructions { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }';
        html += '.question { margin-bottom: 25px; padding: 15px; page-break-inside: avoid; }';
        html += '.question-number { font-weight: bold; margin-bottom: 8px; font-size: 16px; }';
        html += '.question-text { font-size: 15px; line-height: 1.6; margin-bottom: 10px; }';
        html += '.question-meta { font-size: 12px; color: #666; margin-bottom: 10px; }';
        html += '.options { margin-left: 25px; }';
        html += '.option { margin-bottom: 8px; font-size: 14px; line-height: 1.5; }';
        html += '.correct { color: #16a34a; font-weight: bold; }';
        html += '.answer-section { background: #f0fdf4; padding: 15px; margin-top: 15px; border-left: 4px solid #16a34a; }';
        html += '.answer-label { font-weight: bold; color: #16a34a; margin-bottom: 5px; }';
        html += '.footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }';
        html += '.page-break { page-break-after: always; }';
        html += '@media print { body { padding: 20mm; } }';
        html += '</style></head><body>';
        
        html += '<div class="header">';
        html += '<div class="school-name">' + schoolName + '</div>';
        html += '<div class="test-title">' + title + '</div>';
        html += '<div class="exam-info">Date: ' + new Date().toLocaleDateString() + ' | Total Questions: ' + questions.length + '</div>';
        html += '</div>';
        
        html += '<div class="instructions">';
        html += '<strong>Instructions:</strong> Answer all questions. Write clearly and legibly.';
        if (includeAnswers) {
            html += ' This document includes correct answers.';
        }
        html += '</div>';
        
        questions.forEach(function(q, index) {
            html += '<div class="question">';
            html += '<div class="question-number">Question ' + (index + 1) + '</div>';
            html += '<div class="question-meta">';
            html += 'Subject: ' + (q.subject || 'N/A') + ' | ';
            html += 'Class: ' + (q.class || 'N/A') + ' | ';
            html += 'Marks: ' + (q.marks || 0) + ' | ';
            html += 'Type: ' + (q.type || 'N/A');
            html += '</div>';
            html += '<div class="question-text">' + q.question + '</div>';
            
            if (q.type === 'mcq' && q.options) {
                html += '<div class="options">';
                q.options.forEach(function(opt) {
                    const isCorrect = opt.letter === q.correctAnswer;
                    html += '<div class="option' + (isCorrect && includeAnswers ? ' correct' : '') + '">';
                    html += opt.letter + '. ' + opt.text;
                    if (isCorrect && includeAnswers) html += ' ✓';
                    html += '</div>';
                });
                html += '</div>';
            } else if (q.type === 'tf') {
                html += '<div class="options">';
                html += '<div class="option' + (q.correctAnswer === 'True' && includeAnswers ? ' correct' : '') + '">A. True';
                if (q.correctAnswer === 'True' && includeAnswers) html += ' ✓';
                html += '</div>';
                html += '<div class="option' + (q.correctAnswer === 'False' && includeAnswers ? ' correct' : '') + '">B. False';
                if (q.correctAnswer === 'False' && includeAnswers) html += ' ✓';
                html += '</div>';
                html += '</div>';
            } else if (q.type === 'fillblank') {
                if (includeAnswers) {
                    html += '<div class="answer-section">';
                    html += '<div class="answer-label">Answer:</div>';
                    html += q.correctAnswer || 'N/A';
                    html += '</div>';
                }
            } else if (q.type === 'essay') {
                if (includeAnswers) {
                    html += '<div class="answer-section">';
                    html += '<div class="answer-label">Model Answer:</div>';
                    html += q.correctAnswer || 'Teacher to evaluate';
                    html += '</div>';
                }
            }
            
            html += '</div>';
        });
        
        html += '<div class="footer">';
        html += '<p>My School System - ' + ownerName + '</p>';
        html += '<p>Page 1 of 1</p>';
        html += '</div>';
        
        html += '</body></html>';
        
        return html;
    },

    generateTestResultsPrintHTML(testResults, options = {}) {
        const { title = 'Test Results', schoolName = 'My School', ownerName = 'Odebunmi Tawwab', showDetails = true } = options;
        
        let html = '<html><head><title>' + title + '</title>';
        html += '<style>';
        html += 'body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }';
        html += '.header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }';
        html += '.school-name { font-size: 28px; font-weight: bold; }';
        html += '.report-title { font-size: 20px; margin-top: 10px; }';
        html += 'table { width: 100%; border-collapse: collapse; margin: 20px 0; }';
        html += 'th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }';
        html += 'th { background: #f5f5f5; font-weight: bold; }';
        html += '.pass { color: #16a34a; }';
        html += '.fail { color: #dc2626; }';
        html += '.footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }';
        html += '@media print { body { padding: 10mm; } }';
        html += '</style></head><body>';
        
        html += '<div class="header">';
        html += '<div class="school-name">' + schoolName + '</div>';
        html += '<div class="report-title">' + title + '</div>';
        html += '<div>Date: ' + new Date().toLocaleDateString() + '</div>';
        html += '</div>';
        
        html += '<table>';
        html += '<thead><tr>';
        html += '<th>Student ID</th><th>Name</th><th>Subject</th><th>Test Type</th><th>Marks</th><th>Percentage</th><th>Status</th>';
        html += '</tr></thead><tbody>';
        
        testResults.forEach(function(result) {
            const percentage = parseFloat(result.percentage);
            const statusClass = percentage >= 50 ? 'pass' : 'fail';
            const status = percentage >= 50 ? 'Pass' : 'Fail';
            
            html += '<tr>';
            html += '<td>' + (result.studentId || 'N/A') + '</td>';
            html += '<td>' + (result.studentName || 'N/A') + '</td>';
            html += '<td>' + (result.subject || 'N/A') + '</td>';
            html += '<td>' + (result.testType || 'N/A') + '</td>';
            html += '<td>' + (result.obtainedMarks || 0) + '/' + (result.totalMarks || 0) + '</td>';
            html += '<td>' + percentage.toFixed(1) + '%</td>';
            html += '<td class="' + statusClass + '">' + status + '</td>';
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        
        html += '<div class="footer">';
        html += '<p>My School System - ' + ownerName + '</p>';
        html += '</div>';
        
        html += '</body></html>';
        
        return html;
    },
    
    generateTestPrintHTML(test, questions, options = {}) {
        const { schoolName = 'My School', ownerName = 'Odebunmi Tawwab' } = options;
        
        let html = '<html><head><title>' + test.title + '</title>';
        html += '<style>';
        html += 'body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }';
        html += '.header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #333; padding-bottom: 15px; }';
        html += '.school-name { font-size: 24px; font-weight: bold; color: #1a1a1a; }';
        html += '.test-title { font-size: 20px; font-weight: bold; margin-top: 15px; color: #333; }';
        html += '.test-info { margin-top: 10px; color: #666; font-size: 14px; }';
        html += '.instructions { background: #f5f5f5; padding: 12px; margin: 15px 0; border-radius: 5px; font-size: 13px; }';
        html += '.question { margin-bottom: 20px; padding: 10px; page-break-inside: avoid; }';
        html += '.question-number { font-weight: bold; margin-bottom: 6px; font-size: 14px; }';
        html += '.question-text { font-size: 14px; line-height: 1.5; margin-bottom: 8px; }';
        html += '.question-meta { font-size: 11px; color: #666; margin-bottom: 8px; }';
        html += '.options { margin-left: 20px; }';
        html += '.option { margin-bottom: 5px; font-size: 13px; line-height: 1.4; }';
        html += '.tf-options { display: flex; gap: 20px; margin-top: 5px; }';
        html += '.tf-box { border: 1px solid #ccc; padding: 5px 15px; border-radius: 4px; }';
        html += '.answer-box { border: 1px solid #333; padding: 10px; margin-top: 15px; min-height: 30px; }';
        html += '.summary { background: #f0f0f0; padding: 15px; margin-top: 20px; border-radius: 5px; }';
        html += '.footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }';
        html += '@media print { body { padding: 15mm; } }';
        html += '</style></head><body>';
        
        html += '<div class="header">';
        html += '<div class="school-name">' + schoolName + '</div>';
        html += '<div class="test-title">' + test.title + '</div>';
        html += '<div class="test-info">';
        html += '<strong>Subject:</strong> ' + (test.subject || 'N/A') + ' | ';
        html += '<strong>Class:</strong> ' + (test.class || 'N/A') + ' | ';
        html += '<strong>Type:</strong> ' + (test.testType || 'Quiz') + ' | ';
        html += '<strong>Duration:</strong> ' + (test.duration || 30) + ' minutes';
        html += '</div>';
        html += '<div class="test-info"><strong>Date:</strong> ' + new Date().toLocaleDateString() + '</div>';
        html += '</div>';
        
        if (test.instructions) {
            html += '<div class="instructions"><strong>Instructions:</strong> ' + test.instructions + '</div>';
        }
        
        html += '<div class="questions">';
        
        questions.forEach(function(q, index) {
            html += '<div class="question">';
            html += '<div class="question-number">Question ' + (index + 1) + ' <span style="font-weight: normal; color: #666;">(' + q.marks + ' mark' + (q.marks > 1 ? 's' : '') + ')</span></div>';
            html += '<div class="question-meta">' + (q.type || 'MCQ').toUpperCase() + ' - ' + (q.difficulty || 'Medium') + '</div>';
            html += '<div class="question-text">' + q.question + '</div>';
            
            if (q.type === 'mcq' && q.options) {
                html += '<div class="options">';
                q.options.forEach(function(opt) {
                    html += '<div class="option">' + opt.letter + '. ' + opt.text + '</div>';
                });
                html += '</div>';
            } else if (q.type === 'tf') {
                html += '<div class="tf-options">';
                html += '<div class="tf-box">□ True</div>';
                html += '<div class="tf-box">□ False</div>';
                html += '</div>';
            } else if (q.type === 'fillblank') {
                html += '<div class="answer-box"></div>';
            } else if (q.type === 'essay') {
                html += '<div class="answer-box" style="min-height: 100px;"></div>';
            }
            
            html += '</div>';
        });
        
        html += '</div>';
        
        html += '<div class="summary">';
        html += '<strong>Total Questions:</strong> ' + questions.length + ' | ';
        html += '<strong>Total Marks:</strong> ' + test.totalMarks;
        html += '</div>';
        
        html += '<div class="footer">';
        html += '<p>My School System - ' + ownerName + '</p>';
        html += '<p>Page 1 of 1</p>';
        html += '</div>';
        
        html += '</body></html>';
        
        return html;
    }
};

window.ExportUtils = ExportUtils;
