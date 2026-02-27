const Finance = {
    currentType: 'all',
    currentDateRange: null,
    
    init() {
        this.loadDashboard();
        this.setupEventListeners();
        this.listReceipts();
    },
    
    setupEventListeners() {
        const typeFilter = document.getElementById('financeTypeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.currentType = e.target.value;
                this.loadDashboard();
            });
        }
        
        const dateRange = document.getElementById('dateRange');
        if (dateRange) {
            dateRange.addEventListener('change', (e) => {
                this.currentDateRange = e.target.value;
                this.loadDashboard();
            });
        }
    },
    
    loadDashboard() {
        const schoolId = Auth.getCurrentSchoolId();
        let transactions = Storage.getFinance(schoolId);
        
        if (this.currentType !== 'all') {
            transactions = transactions.filter(t => t.type === this.currentType);
        }
        
        if (this.currentDateRange) {
            const now = new Date();
            let startDate;
            
            switch (this.currentDateRange) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
                case 'year':
                    startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                    break;
            }
            
            transactions = transactions.filter(t => new Date(t.date) >= startDate);
        }
        
        this.updateStats(transactions);
        this.renderTransactions(transactions);
        this.renderCharts(transactions);
    },
    
    updateStats(transactions) {
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expenses;
        
        const totalIncomeEl = document.getElementById('totalIncome');
        const totalExpensesEl = document.getElementById('totalExpenses');
        const balanceEl = document.getElementById('balance') || document.getElementById('balanceAmount');
        
        if (totalIncomeEl) totalIncomeEl.textContent = Utils.formatCurrency(income);
        if (totalExpensesEl) totalExpensesEl.textContent = Utils.formatCurrency(expenses);
        if (balanceEl) {
            balanceEl.textContent = Utils.formatCurrency(balance);
            balanceEl.className = balance >= 0 ? 'stat-value text-success' : 'stat-value text-danger';
        }
    },
    
    renderTransactions(transactions) {
        const container = document.getElementById('transactionsList');
        if (!container) return;
        
        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <h3>No transactions</h3>
                    <p>No transactions found for the selected filters</p>
                </div>
            `;
            return;
        }
        
        const school = Auth.getSchool();
        let html = '<div class="list-group">';
        
        transactions.slice(0, 20).forEach(t => {
            const icon = t.type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up';
            const color = t.type === 'income' ? 'text-success' : 'text-danger';
            
            html += `
                <div class="list-group-item">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="stat-icon ${t.type === 'income' ? 'success' : 'danger'}" style="width: 44px; height: 44px;">
                            <i class="fas ${icon}"></i>
                        </div>
                        <div>
                            <div style="font-weight: 600;">${t.description}</div>
                            <div style="font-size: 13px; color: var(--gray);">${t.category} • ${Utils.formatDate(t.date)}</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div class="${color}" style="font-weight: 600;">${t.type === 'income' ? '+' : '-'}${Utils.formatCurrency(t.amount, school?.currency)}</div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    renderCharts(transactions) {
        const incomeByMonth = {};
        const expensesByMonth = {};
        
        transactions.forEach(t => {
            const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            
            if (t.type === 'income') {
                incomeByMonth[month] = (incomeByMonth[month] || 0) + t.amount;
            } else {
                expensesByMonth[month] = (expensesByMonth[month] || 0) + t.amount;
            }
        });
        
        const labels = Object.keys(incomeByMonth).length > Object.keys(expensesByMonth).length 
            ? Object.keys(incomeByMonth) 
            : Object.keys(expensesByMonth);
        
        const incomeData = labels.map(l => incomeByMonth[l] || 0);
        const expenseData = labels.map(l => expensesByMonth[l] || 0);
        
        this.renderLineChart(labels, incomeData, expenseData);
        this.renderPieChart(transactions);
    },
    
    renderLineChart(labels, incomeData, expenseData) {
        const canvas = document.getElementById('financeChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        canvas.style.width = '100%';
        canvas.style.height = '300px';
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!labels.length) {
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const maxVal = Math.max(...incomeData, ...expenseData);
        const padding = 50;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;
        
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
        }
        
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            const val = maxVal - (maxVal / 5) * i;
            ctx.fillText(Utils.formatNumber(Math.round(val)), padding - 10, y + 4);
        }
        
        const drawLine = (data, color) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            data.forEach((val, i) => {
                const x = padding + (chartWidth / (data.length - 1 || 1)) * i;
                const y = padding + chartHeight - (val / maxVal) * chartHeight;
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            
            ctx.stroke();
            
            ctx.fillStyle = color;
            data.forEach((val, i) => {
                const x = padding + (chartWidth / (data.length - 1 || 1)) * i;
                const y = padding + chartHeight - (val / maxVal) * chartHeight;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        };
        
        drawLine(incomeData, '#16a34a');
        drawLine(expenseData, '#dc2626');
        
        ctx.fillStyle = '#6b7280';
        ctx.textAlign = 'center';
        labels.forEach((label, i) => {
            const x = padding + (chartWidth / (labels.length - 1 || 1)) * i;
            ctx.fillText(label, x, canvas.height - 15);
        });
        
        const legendX = canvas.width - 120;
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(legendX, 20, 12, 12);
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'left';
        ctx.fillText('Income', legendX + 18, 30);
        
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(legendX, 40, 12, 12);
        ctx.fillStyle = '#374151';
        ctx.fillText('Expenses', legendX + 18, 50);
    },
    
    renderPieChart(transactions) {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = 300;
        canvas.height = 300;
        
        const expenses = transactions.filter(t => t.type === 'expense');
        const categories = {};
        
        expenses.forEach(t => {
            categories[t.category] = (categories[t.category] || 0) + t.amount;
        });
        
        const labels = Object.keys(categories);
        const data = Object.values(categories);
        const colors = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        
        if (!labels.length) {
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('No expense data', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const total = data.reduce((a, b) => a + b, 0);
        let startAngle = 0;
        
        data.forEach((val, i) => {
            const sliceAngle = (val / total) * Math.PI * 2;
            
            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, canvas.height / 2);
            ctx.arc(canvas.width / 2, canvas.height / 2, 100, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();
            
            startAngle += sliceAngle;
        });
    },
    
    addTransaction(data) {
        const { type, amount, description, category, date, paymentMethod } = data;
        
        if (!amount || !description || !category) {
            Toast.error('Please fill all required fields');
            return;
        }
        
        const schoolId = Auth.getCurrentSchoolId();
        
        const transaction = {
            type,
            amount: parseFloat(amount),
            description,
            category,
            date: date || new Date().toISOString().split('T')[0],
            paymentMethod: paymentMethod || 'cash',
            recordedBy: Auth.getCurrentUser().id,
            schoolId,
            createdAt: new Date().toISOString()
        };
        
        Storage.addItem('finance', transaction);
        
        const user = Auth.getCurrentUser();
        const amountStr = '₦' + parseFloat(amount).toLocaleString();
        Auth.logActivity(user.id, 'finance', `Added ${type}: ${amountStr} - ${description}`);
        Auth.addNotification(user.id, `Added ${type} of ${amountStr} for ${description}`, 'finance');
        
        Toast.success('Transaction added successfully');
        Modal.hide('addTransactionModal');
        this.loadDashboard();
        
        Form.reset('transactionForm');
    },
    
    deleteTransaction(id) {
        Modal.confirm({
            title: 'Delete Transaction',
            message: 'Are you sure you want to delete this transaction?',
            onConfirm: () => {
                Storage.deleteItem('finance', id);
                Toast.success('Transaction deleted');
                this.loadDashboard();
            }
        });
    },
    
    generateReport(startDate, endDate) {
        const schoolId = Auth.getCurrentSchoolId();
        let transactions = Storage.getFinance(schoolId);
        
        transactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });
        
        const income = transactions.filter(t => t.type === 'income');
        const expenses = transactions.filter(t => t.type === 'expense');
        
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
        
        const categories = {};
        expenses.forEach(t => {
            categories[t.category] = (categories[t.category] || 0) + t.amount;
        });
        
        return {
            period: { startDate, endDate },
            totalIncome,
            totalExpenses,
            netBalance: totalIncome - totalExpenses,
            incomeCount: income.length,
            expenseCount: expenses.length,
            expensesByCategory: categories,
            transactions
        };
    },
    
    exportReport(format = 'csv') {
        const schoolId = Auth.getCurrentSchoolId();
        const school = Auth.getSchool();
        const report = this.generateReport(
            new Date(new Date().getFullYear(), 0, 1).toISOString(),
            new Date().toISOString()
        );
        
        if (format === 'csv') {
            const csv = [
                'Type,Description,Category,Amount,Date,Payment Method',
                ...report.transactions.map(t => 
                    `${t.type},${t.description},${t.category},${t.amount},${t.date},${t.paymentMethod}`
                ),
                '',
                `Total Income,${report.totalIncome}`,
                `Total Expenses,${report.totalExpenses}`,
                `Net Balance,${report.netBalance}`,
                '',
                'My School System - Odebunmi Tawwab'
            ].join('\n');
            
            Utils.downloadFile(csv, 'financial_report.csv', 'text/csv');
            Toast.success('Report exported to CSV');
        } else if (format === 'pdf') {
            const formatCurrency = (amount) => {
                return '₦' + parseFloat(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            };
            
            const content = `
                <div style="padding: 20px; font-family: Arial, sans-serif;">
                    <h2 style="text-align: center; color: #16a34a;">${school?.name || 'School'}</h2>
                    <p style="text-align: center;">${school?.address || ''} | ${school?.phone || ''}</p>
                    <h3 style="text-align: center; margin: 20px 0;">Financial Report - ${new Date().getFullYear()}</h3>
                    
                    <div style="display: flex; justify-content: space-around; margin: 30px 0;">
                        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; text-align: center;">
                            <p style="margin: 0; color: #166534;">Total Income</p>
                            <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #16a34a;">${formatCurrency(report.totalIncome)}</p>
                        </div>
                        <div style="background: #fee2e2; padding: 20px; border-radius: 8px; text-align: center;">
                            <p style="margin: 0; color: #991b1b;">Total Expenses</p>
                            <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #dc2626;">${formatCurrency(report.totalExpenses)}</p>
                        </div>
                        <div style="background: #e0e7ff; padding: 20px; border-radius: 8px; text-align: center;">
                            <p style="margin: 0; color: #3730a3;">Net Balance</p>
                            <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #4f46e5;">${formatCurrency(report.netBalance)}</p>
                        </div>
                    </div>
                    
                    <h4 style="margin: 20px 0;">Transaction Details</h4>
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                        <tr style="background: #16a34a; color: white;">
                            <th style="padding: 10px; border: 1px solid #16a34a;">Type</th>
                            <th style="padding: 10px; border: 1px solid #16a34a;">Description</th>
                            <th style="padding: 10px; border: 1px solid #16a34a;">Category</th>
                            <th style="padding: 10px; border: 1px solid #16a34a;">Amount</th>
                            <th style="padding: 10px; border: 1px solid #16a34a;">Date</th>
                        </tr>
                        ${report.transactions.slice(0, 50).map(t => `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd; color: ${t.type === 'income' ? '#16a34a' : '#dc2626'};">${t.type}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${t.description}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${t.category}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(t.amount)}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${t.date}</td>
                            </tr>
                        `).join('')}
                    </table>
                    ${report.transactions.length > 50 ? `<p style="text-align: center; color: #666;">... and ${report.transactions.length - 50} more transactions</p>` : ''}
                    <p style="text-align: center; font-size: 9px; color: #999; margin-top: 30px;">My School System - Odebunmi Tawwab</p>
                </div>
            `;
            
            const temp = document.createElement('div');
            temp.innerHTML = content;
            document.body.appendChild(temp);
            
            if (window.html2canvas && window.jspdf) {
                html2canvas(temp, { scale: 2 }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new window.jspdf.jsPDF({ orientation: canvas.width > canvas.height ? 'landscape' : 'portrait', unit: 'pt', format: [canvas.width, canvas.height] });
                    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                    pdf.save(`financial_report_${new Date().toISOString().split('T')[0]}.pdf`);
                    document.body.removeChild(temp);
                    Toast.success('Report exported to PDF');
                }).catch(err => {
                    document.body.removeChild(temp);
                    Toast.error('Error generating PDF');
                });
            } else {
                const fullHtml = `<!DOCTYPE html><html><head><title>Financial Report</title></head><body>${content}</body></html>`;
                const printWindow = window.open('', '_blank');
                printWindow.document.write(fullHtml);
                printWindow.document.close();
                printWindow.print();
                document.body.removeChild(temp);
                Toast.success('Report opened for printing/saving as PDF');
            }
        } else if (format === 'doc') {
            const formatCurrency = (amount) => {
                return '₦' + parseFloat(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            };
            
            const content = `
                <div style="padding: 20px; font-family: Arial, sans-serif;">
                    <h2 style="text-align: center; color: #16a34a;">${school?.name || 'School'}</h2>
                    <p style="text-align: center;">${school?.address || ''} | ${school?.phone || ''}</p>
                    <h3 style="text-align: center; margin: 20px 0;">Financial Report - ${new Date().getFullYear()}</h3>
                    
                    <div style="display: flex; justify-content: space-around; margin: 30px 0;">
                        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; text-align: center;">
                            <p style="margin: 0; color: #166534;">Total Income</p>
                            <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #16a34a;">${formatCurrency(report.totalIncome)}</p>
                        </div>
                        <div style="background: #fee2e2; padding: 20px; border-radius: 8px; text-align: center;">
                            <p style="margin: 0; color: #991b1b;">Total Expenses</p>
                            <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #dc2626;">${formatCurrency(report.totalExpenses)}</p>
                        </div>
                        <div style="background: #e0e7ff; padding: 20px; border-radius: 8px; text-align: center;">
                            <p style="margin: 0; color: #3730a3;">Net Balance</p>
                            <p style="margin: 5px 0; font-size: 24px; font-weight: bold; color: #4f46e5;">${formatCurrency(report.netBalance)}</p>
                        </div>
                    </div>
                    
                    <h4 style="margin: 20px 0;">Transaction Details</h4>
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                        <tr style="background: #16a34a; color: white;">
                            <th style="padding: 10px; border: 1px solid #16a34a;">Type</th>
                            <th style="padding: 10px; border: 1px solid #16a34a;">Description</th>
                            <th style="padding: 10px; border: 1px solid #16a34a;">Category</th>
                            <th style="padding: 10px; border: 1px solid #16a34a;">Amount</th>
                            <th style="padding: 10px; border: 1px solid #16a34a;">Date</th>
                        </tr>
                        ${report.transactions.map(t => `
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd; color: ${t.type === 'income' ? '#16a34a' : '#dc2626'};">${t.type}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${t.description}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${t.category}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(t.amount)}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${t.date}</td>
                            </tr>
                        `).join('')}
                    </table>
                    <p style="text-align: center; font-size: 9px; color: #999; margin-top: 30px;">My School System - Odebunmi Tawwab</p>
                </div>
            `;
            
            const fullHtml = `<!DOCTYPE html><html><head><title>Financial Report</title></head><body>${content}</body></html>`;
            const blob = new Blob([fullHtml], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `financial_report_${new Date().toISOString().split('T')[0]}.doc`;
            a.click();
            URL.revokeObjectURL(url);
            Toast.success('Report exported to DOC');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('financeApp')) {
        Finance.init();
    }
});

window.Finance = Finance;

Finance.generateReceipt = function(data) {
    // Validate required fields
    const { paymentType, amount, payerName, receiverName, description, date, format } = data;
    if (!paymentType || !amount || !payerName || !receiverName || !date || !format) {
        Toast.error('Please fill all required fields');
        return;
    }
    const school = Auth.getSchool();
    const receipt = {
        id: Storage.generateId(),
        schoolId: school.id,
        schoolName: school.name,
        schoolShortDetails: `${school.address || ''} ${school.phone || ''}`,
        systemName: 'My School System - Odebunmi Tawwab',
        paymentType,
        amount: parseFloat(amount),
        payerName,
        receiverName,
        description,
        date,
        format,
        createdAt: new Date().toISOString()
    };
    Storage.addItem('receipts', receipt);
    Toast.success('Receipt generated and saved');
    Modal.hide('generateReceiptModal');
    Form.reset('receiptForm');
    Finance.listReceipts();
};

Finance.listReceipts = function() {
    const schoolId = Auth.getCurrentSchoolId();
    const receipts = Storage.getData('receipts').filter(r => r.schoolId === schoolId);
    const container = document.getElementById('receiptsList');
    if (!container) return;
    if (receipts.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-receipt"></i><h3>No receipts</h3><p>No receipts found.</p></div>';
        return;
    }
    let html = '<div class="list-group">';
    receipts.forEach(r => {
        html += `<div class="list-group-item">
            <div><b>${r.paymentType}</b> - ${Utils.formatCurrency(r.amount)}<br>
            <span style="font-size:13px;color:var(--gray)">${r.payerName} → ${r.receiverName} | ${Utils.formatDate(r.date)}</span></div>
            <div style="text-align:right">
                <button class="btn btn-outline btn-sm" onclick="Finance.downloadReceipt('${r.id}')"><i class="fas fa-download"></i> Download</button>
                <button class="btn btn-danger btn-sm" onclick="Finance.removeReceipt('${r.id}')"><i class="fas fa-trash"></i> Remove</button>
            </div>
        </div>`;
    });
    Finance.removeReceipt = function(id) {
        Modal.confirm({
            title: 'Delete Receipt',
            message: 'Are you sure you want to delete this receipt?',
            onConfirm: () => {
                Storage.deleteItem('receipts', id);
                Toast.success('Receipt deleted');
                Finance.listReceipts();
            }
        });
    };
    html += '</div>';
    container.innerHTML = html;
};

Finance.downloadReceipt = function(id) {
    const receipt = Storage.getItemById('receipts', id);
    if (!receipt) { Toast.error('Receipt not found'); return; }
    const systemBranding = 'My School System - Odebunmi Tawwab';
    const school = Auth.getSchool();
    
    const formatCurrency = (amount) => {
        return '₦' + parseFloat(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    };
    
    const receiptNumber = 'RCPT-' + receipt.id.slice(-8).toUpperCase();
    const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>${receiptNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 40px; 
            background: #fff;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
        }
        .receipt-container {
            border: 2px solid #1a1a2e;
            border-radius: 8px;
            overflow: hidden;
        }
        .receipt-header {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .school-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
            letter-spacing: 1px;
        }
        .school-address {
            font-size: 14px;
            opacity: 0.9;
        }
        .receipt-title {
            background: #f59e0b;
            color: #1a1a2e;
            padding: 12px;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 3px;
            text-transform: uppercase;
        }
        .receipt-info {
            display: flex;
            justify-content: space-between;
            padding: 20px 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #eee;
        }
        .receipt-info-item {
            text-align: center;
        }
        .receipt-info-label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .receipt-info-value {
            font-size: 14px;
            font-weight: bold;
            color: #1a1a2e;
        }
        .receipt-body {
            padding: 30px;
        }
        .amount-box {
            background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
            color: white;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 25px;
        }
        .amount-label {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 2px;
            opacity: 0.9;
        }
        .amount-value {
            font-size: 36px;
            font-weight: bold;
            margin-top: 5px;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .details-table tr {
            border-bottom: 1px solid #eee;
        }
        .details-table td {
            padding: 12px 0;
        }
        .details-label {
            color: #666;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .details-value {
            text-align: right;
            font-weight: 500;
        }
        .receipt-footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #eee;
        }
        .footer-text {
            font-size: 12px;
            color: #999;
            font-style: italic;
        }
        .system-brand {
            margin-top: 10px;
            font-size: 11px;
            color: #bbb;
        }
        .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, #f59e0b, transparent);
            margin: 20px 0;
        }
        @media print {
            body { padding: 0; }
            .receipt-container { border: none; }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="receipt-header">
            <div class="school-name">${school?.name || 'School Name'}</div>
            <div class="school-address">${school?.address || ''} | ${school?.phone || ''} | ${school?.email || ''}</div>
        </div>
        <div class="receipt-title">Official Receipt</div>
        <div class="receipt-info">
            <div class="receipt-info-item">
                <div class="receipt-info-label">Receipt No.</div>
                <div class="receipt-info-value">${receiptNumber}</div>
            </div>
            <div class="receipt-info-item">
                <div class="receipt-info-label">Date</div>
                <div class="receipt-info-value">${formatDate(receipt.date)}</div>
            </div>
            <div class="receipt-info-item">
                <div class="receipt-info-label">Payment Type</div>
                <div class="receipt-info-value">${receipt.paymentType}</div>
            </div>
        </div>
        <div class="receipt-body">
            <div class="amount-box">
                <div class="amount-label">Amount Received</div>
                <div class="amount-value">${formatCurrency(receipt.amount)}</div>
            </div>
            <table class="details-table">
                <tr>
                    <td class="details-label">Received From</td>
                    <td class="details-value">${receipt.payerName}</td>
                </tr>
                <tr>
                    <td class="details-label">Received By</td>
                    <td class="details-value">${receipt.receiverName}</td>
                </tr>
                <tr>
                    <td class="details-label">Description</td>
                    <td class="details-value">${receipt.description || '-'}</td>
                </tr>
            </table>
            <div class="divider"></div>
        </div>
        <div class="receipt-footer">
            <div class="footer-text">Thank you for your payment!</div>
            <div class="system-brand">${systemBranding}</div>
        </div>
    </div>
</body>
</html>`;
    
    if (receipt.format === 'pdf') {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
        Toast.success('Receipt opened for printing/saving as PDF');
    } else if (receipt.format === 'doc') {
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${receiptNumber}.doc`;
        a.click();
        URL.revokeObjectURL(url);
        Toast.success('Receipt downloaded successfully');
    }
};
