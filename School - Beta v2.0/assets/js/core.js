const App = {
    init() {
        this.setupEventListeners();
        this.initComponents();
    },
    
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.dropdown')) {
                const dropdown = e.target.closest('.dropdown');
                document.querySelectorAll('.dropdown').forEach(d => {
                    if (d !== dropdown) d.classList.remove('active');
                });
                dropdown.classList.toggle('active');
            } else {
                document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
            }
        });
        
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.parentElement.querySelector('input');
                const icon = this.querySelector('i');
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.replace('fa-eye', 'fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.replace('fa-eye-slash', 'fa-eye');
                }
            });
        });
        
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal-overlay').classList.remove('active');
            });
        });
        
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                }
            });
        });
    },
    
    initComponents() {
        this.initTooltips();
        this.initDropdowns();
    },
    
    initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = el.dataset.tooltip;
                document.body.appendChild(tooltip);
                
                const rect = el.getBoundingClientRect();
                tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
                tooltip.style.left = rect.left + (rect.width - tooltip.offsetWidth) / 2 + 'px';
                
                el._tooltip = tooltip;
            });
            
            el.addEventListener('mouseleave', () => {
                if (el._tooltip) {
                    el._tooltip.remove();
                    el._tooltip = null;
                }
            });
        });
    },
    
    initDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown-toggle');
        dropdowns.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = toggle.closest('.dropdown');
                document.querySelectorAll('.dropdown').forEach(d => {
                    if (d !== dropdown) d.classList.remove('active');
                });
                dropdown.classList.toggle('active');
            });
        });
    }
};

const Utils = {
    formatDate(date, format = 'short') {
        const d = new Date(date);
        
        if (format === 'short') {
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        
        if (format === 'long') {
            return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        }
        
        if (format === 'time') {
            return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        
        if (format === 'datetime') {
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        
        return d.toISOString().split('T')[0];
    },
    
    formatCurrency(amount, currency = 'NGN') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },
    
    formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
    },
    
    formatPercentage(value, decimals = 1) {
        return value.toFixed(decimals) + '%';
    },
    
    getInitials(name) {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    },
    
    generateClassId() {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `CLS-${year}-${random}`;
    },
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            Toast.success('Copied to clipboard');
        }).catch(() => {
            Toast.error('Failed to copy');
        });
    },
    
    downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },
    
exportToCSV(data, filename) {
                if (!Auth.hasFeature('downloads')) {
                    Toast.error('Data export has been restricted by the Super Admin.');
                    return;
                }
                if (!data.length) return;
                
                const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                let cell = row[header] || '';
                cell = cell.toString().replace(/"/g, '""');
                return `"${cell}"`;
            }).join(','))
        ].join('\n');
        
        this.downloadFile(csvContent, filename, 'text/csv');
    },
    
    exportToPDF(content, filename) {
        const blob = new Blob([content], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },
    
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    validatePhone(phone) {
        return /^\+?[\d\s-]{10,}$/.test(phone);
    },
    
    validatePassword(password) {
        return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
    },
    
    generateRandomColor() {
        const colors = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        return colors[Math.floor(Math.random() * colors.length)];
    },
    
    timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };
        
        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }
        
        return 'Just now';
    },
    
    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    },
    
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    },
    
    sortBy(array, key, order = 'asc') {
        return array.sort((a, b) => {
            if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
            return 0;
        });
    },
    
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            if (!result[group]) result[group] = [];
            result[group].push(item);
            return result;
        }, {});
    },
    
    calculateAverage(numbers) {
        if (!numbers.length) return 0;
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    },
    
    calculatePercentage(value, total) {
        if (!total) return 0;
        return (value / total) * 100;
    },
    
    truncate(str, length = 50) {
        if (str.length <= length) return str;
        return str.substring(0, length) + '...';
    },
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    slugify(str) {
        return str
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
};

const Toast = {
    show(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const icons = {
            success: 'fa-check',
            error: 'fa-times',
            warning: 'fa-exclamation',
            info: 'fa-info'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icons[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.remove(toast));
        
        setTimeout(() => this.remove(toast), duration);
    },
    
    remove(toast) {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    },
    
    success(message) { this.show(message, 'success'); },
    error(message) { this.show(message, 'error'); },
    warning(message) { this.show(message, 'warning'); },
    info(message) { this.show(message, 'info'); }
};

const Modal = {
    show(modalId) {
        document.getElementById(modalId)?.classList.add('active');
    },
    
    hide(modalId) {
        document.getElementById(modalId)?.classList.remove('active');
    },
    
    confirm(options) {
        const { title, message, onConfirm, onCancel } = options;
        
        const modalHtml = `
            <div id="confirmModal" class="modal-overlay">
                <div class="modal" style="max-width: 420px;">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close" onclick="Modal.hide('confirmModal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="Modal.hide('confirmModal')">Cancel</button>
                        <button class="btn btn-danger" id="confirmBtn">Confirm</button>
                    </div>
                </div>
            </div>
        `;
        
        const existingModal = document.getElementById('confirmModal');
        if (existingModal) existingModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        document.getElementById('confirmBtn').addEventListener('click', () => {
            if (onConfirm) onConfirm();
            this.hide('confirmModal');
        });
        
        this.show('confirmModal');
    },
    
    alert(options) {
        const { title, message, onOk } = options;
        
        const modalHtml = `
            <div id="alertModal" class="modal-overlay">
                <div class="modal" style="max-width: 420px;">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close" onclick="Modal.hide('alertModal')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" id="alertOkBtn">OK</button>
                    </div>
                </div>
            </div>
        `;
        
        const existingModal = document.getElementById('alertModal');
        if (existingModal) existingModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        document.getElementById('alertOkBtn').addEventListener('click', () => {
            if (onOk) onOk();
            this.hide('alertModal');
        });
        
        this.show('alertModal');
    }
};

const Loading = {
    show() {
        const existing = document.querySelector('.loading-overlay');
        if (existing) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(overlay);
    },
    
    hide() {
        document.querySelector('.loading-overlay')?.remove();
    }
};

const Form = {
    getData(formId) {
        const form = document.getElementById(formId);
        if (!form) return {};
        
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    },
    
    validate(formId, rules) {
        const data = this.getData(formId);
        const errors = {};
        
        for (const [field, ruleSet] of Object.entries(rules)) {
            const value = data[field];
            
            if (ruleSet.required && !value) {
                errors[field] = ruleSet.messages?.required || 'This field is required';
                continue;
            }
            
            if (value) {
                if (ruleSet.email && !Utils.validateEmail(value)) {
                    errors[field] = ruleSet.messages?.email || 'Invalid email address';
                }
                
                if (ruleSet.phone && !Utils.validatePhone(value)) {
                    errors[field] = ruleSet.messages?.phone || 'Invalid phone number';
                }
                
                if (ruleSet.minLength && value.length < ruleSet.minLength) {
                    errors[field] = ruleSet.messages?.minLength || `Minimum ${ruleSet.minLength} characters required`;
                }
                
                if (ruleSet.match && value !== data[ruleSet.match]) {
                    errors[field] = ruleSet.messages?.match || 'Fields do not match';
                }
            }
        }
        
        return { isValid: Object.keys(errors).length === 0, errors };
    },
    
    showErrors(formId, errors) {
        Object.entries(errors).forEach(([field, message]) => {
            const input = document.querySelector(`#${formId} [name="${field}"]`);
            if (input) {
                input.style.borderColor = 'var(--danger)';
                input.title = message;
            }
        });
    },
    
    clearErrors(formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        form.querySelectorAll('input, select, textarea').forEach(input => {
            input.style.borderColor = '';
            input.title = '';
        });
    },
    
    reset(formId) {
        document.getElementById(formId)?.reset();
        this.clearErrors(formId);
    }
};

const Table = {
    render(containerId, options) {
        const { data, columns, sortable = true, searchable = true, pagination = true, perPage = 20 } = options;
        
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let currentPage = 1;
        let sortColumn = null;
        let sortOrder = 'asc';
        let searchQuery = '';
        
        const render = () => {
            let filteredData = [...data];
            
            if (searchQuery) {
                filteredData = filteredData.filter(row => 
                    Object.values(row).some(val => 
                        String(val).toLowerCase().includes(searchQuery.toLowerCase())
                    )
                );
            }
            
            if (sortColumn) {
                filteredData.sort((a, b) => {
                    const aVal = a[sortColumn];
                    const bVal = b[sortColumn];
                    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
                    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
                    return 0;
                });
            }
            
            const totalPages = Math.ceil(filteredData.length / perPage);
            const start = (currentPage - 1) * perPage;
            const paginatedData = pagination ? filteredData.slice(start, start + perPage) : filteredData;
            
            let html = '<div class="table-container"><table class="table"><thead><tr>';
            
            columns.forEach(col => {
                const sortableClass = sortable ? 'sortable' : '';
                const sortIcon = sortColumn === col.key ? 
                    (sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort';
                html += `
                    <th class="${sortableClass}" data-column="${col.key}">
                        ${col.label}
                        ${sortable ? `<i class="fas ${sortIcon}"></i>` : ''}
                    </th>
                `;
            });
            
            html += '</tr></thead><tbody>';
            
            if (paginatedData.length === 0) {
                html += `<tr><td colspan="${columns.length}" class="text-center">No data available</td></tr>`;
            } else {
                paginatedData.forEach(row => {
                    html += '<tr>';
                    columns.forEach(col => {
                        const value = row[col.key];
                        const formatted = col.formatter ? col.formatter(value, row) : value;
                        html += `<td>${formatted}</td>`;
                    });
                    html += '</tr>';
                });
            }
            
            html += '</tbody></table></div>';
            
            if (pagination && totalPages > 1) {
                html += '<div class="pagination">';
                html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="Table.goToPage('${containerId}', ${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
                
                for (let i = 1; i <= totalPages; i++) {
                    html += `<button class="${i === currentPage ? 'active' : ''}" onclick="Table.goToPage('${containerId}', ${i})">${i}</button>`;
                }
                
                html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="Table.goToPage('${containerId}', ${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
                html += '</div>';
            }
            
            container.innerHTML = html;
            
            if (sortable) {
                container.querySelectorAll('th.sortable').forEach(th => {
                    th.addEventListener('click', () => {
                        const column = th.dataset.column;
                        if (sortColumn === column) {
                            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                        } else {
                            sortColumn = column;
                            sortOrder = 'asc';
                        }
                        render();
                    });
                });
            }
        };
        
        if (searchable) {
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = 'form-control';
            searchInput.placeholder = 'Search...';
            searchInput.addEventListener('input', Utils.debounce(e => {
                searchQuery = e.target.value;
                currentPage = 1;
                render();
            }, 300));
            container.before(searchInput);
        }
        
        render();
    },
    
    goToPage(containerId, page) {
        const event = new CustomEvent('tablePageChange', { detail: { page } });
        document.getElementById(containerId)?.dispatchEvent(event);
    }
};

function displayAnnouncementBanner() {
    const banner = document.getElementById('announcementBanner');
    const content = document.getElementById('announcementContent');
    
    if (!banner || !content) return;
    
    const announcement = Storage.getAnnouncement();
    if (announcement && announcement.isActive && announcement.message) {
        content.textContent = announcement.message;
        banner.classList.add('active');
    } else {
        banner.classList.remove('active');
    }
}

window.displayAnnouncementBanner = displayAnnouncementBanner;

const ThemeManager = {
    DARK_MODE_KEY: 'userDarkMode',
    FONT_SIZE_KEY: 'userFontSize',
    GLOBAL_THEME_KEY: 'globalThemeSettings',
    DEFAULT_THEME: {
        primary: '#16a34a',
        primaryDark: '#15803d',
        primaryLight: '#22c55e',
        accent: '#10b981',
        fontFamily: 'Inter, Poppins, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    },
    
    init() {
        this.loadUserTheme();
        this.loadGlobalTheme();
    },
    
    loadUserTheme() {
        const isDark = localStorage.getItem(this.DARK_MODE_KEY) === 'true';
        if (isDark) {
            document.body.classList.add('dark-mode');
        }
    },
    
    loadGlobalTheme() {
        const savedTheme = localStorage.getItem(this.GLOBAL_THEME_KEY);
        if (savedTheme) {
            try {
                const theme = JSON.parse(savedTheme);
                this.applyTheme(theme, false);
            } catch (e) {
                console.error('Error loading global theme:', e);
            }
        }
    },
    
    getGlobalTheme() {
        const savedTheme = localStorage.getItem(this.GLOBAL_THEME_KEY);
        if (savedTheme) {
            try {
                return JSON.parse(savedTheme);
            } catch (e) {
                return { ...this.DEFAULT_THEME };
            }
        }
        return { ...this.DEFAULT_THEME };
    },
    
    saveGlobalTheme(theme) {
        theme.updatedAt = new Date().toISOString();
        localStorage.setItem(this.GLOBAL_THEME_KEY, JSON.stringify(theme));
        this.applyTheme(theme, true);
    },
    
    applyTheme(theme, permanent = true) {
        const root = document.documentElement;
        
        if (theme.primary) {
            root.style.setProperty('--primary', theme.primary);
            root.style.setProperty('--primary-dark', theme.primaryDark || this.adjustColor(theme.primary, -20));
            root.style.setProperty('--primary-light', theme.primaryLight || this.adjustColor(theme.primary, 20));
        }
        
        if (theme.accent) {
            root.style.setProperty('--accent', theme.accent);
        }
        
        if (theme.fontFamily) {
            root.style.setProperty('--font-sans', theme.fontFamily);
        }
        
        if (permanent) {
            Toast.success('Theme applied successfully');
        }
    },
    
    adjustColor(color, percent) {
        const hex = color.replace('#', '');
        const num = parseInt(hex, 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    },
    
    previewTheme(theme, duration = 10000) {
        this.applyTheme(theme, false);
        
        if (this.previewTimeout) {
            clearTimeout(this.previewTimeout);
        }
        
        Toast.info('Preview mode - theme will reset in 10 seconds');
        
        this.previewTimeout = setTimeout(() => {
            this.loadGlobalTheme();
            Toast.info('Preview ended - theme reverted');
        }, duration);
    },
    
    resetTheme() {
        localStorage.removeItem(this.GLOBAL_THEME_KEY);
        this.applyTheme(this.DEFAULT_THEME, true);
        Toast.success('Theme reset to default');
    },
    
    toggleDarkMode() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem(this.DARK_MODE_KEY, isDark);
        return isDark;
    },
    
    isDarkMode() {
        return document.body.classList.contains('dark-mode');
    },
    
    setFontSize(size) {
        document.body.style.fontSize = size;
        localStorage.setItem(this.FONT_SIZE_KEY, size);
    },
    
    getFontSize() {
        return localStorage.getItem(this.FONT_SIZE_KEY) || '14px';
    }
};

window.App = App;
window.Utils = Utils;
window.Toast = Toast;
window.Modal = Modal;
window.Loading = Loading;
window.Form = Form;
window.Table = Table;
window.ThemeManager = ThemeManager;

document.addEventListener('DOMContentLoaded', () => {
    App.init();
    ThemeManager.init();
});
