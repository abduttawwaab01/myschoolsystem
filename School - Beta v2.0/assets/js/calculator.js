const Calculator = {
    isOpen: false,
    mode: 'basic',
    
    init() {
        this.createModal();
    },
    
    createModal() {
        const existing = document.getElementById('calculatorModal');
        if (existing) return;
        
        const html = `
            <div id="calculatorModal" class="calculator-modal" style="display: none;">
                <div class="calculator-container">
                    <div class="calculator-header">
                        <span class="calculator-title">Calculator</span>
                        <div class="calculator-controls">
                            <button class="calc-mode-btn" onclick="Calculator.toggleMode()">
                                <i class="fas fa-calculator"></i> <span id="calcModeLabel">Scientific</span>
                            </button>
                            <button class="calc-close-btn" onclick="Calculator.close()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="calculator-display">
                        <input type="text" id="calcDisplay" class="calc-display-input" readonly>
                    </div>
                    <div class="calculator-buttons" id="calcButtons">
                    </div>
                </div>
            </div>
        `;
        
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div);
        this.renderButtons();
    },
    
    renderButtons() {
        const container = document.getElementById('calcButtons');
        if (!container) return;
        
        if (this.mode === 'basic') {
            container.innerHTML = `
                <div class="calc-row">
                    <button class="calc-btn calc-clear" onclick="Calculator.clear()">C</button>
                    <button class="calc-btn calc-operator" onclick="Calculator.append('/')">÷</button>
                    <button class="calc-btn calc-operator" onclick="Calculator.append('*')">×</button>
                    <button class="calc-btn calc-operator" onclick="Calculator.backspace()">⌫</button>
                </div>
                <div class="calc-row">
                    <button class="calc-btn" onclick="Calculator.append('7')">7</button>
                    <button class="calc-btn" onclick="Calculator.append('8')">8</button>
                    <button class="calc-btn" onclick="Calculator.append('9')">9</button>
                    <button class="calc-btn calc-operator" onclick="Calculator.append('-')">−</button>
                </div>
                <div class="calc-row">
                    <button class="calc-btn" onclick="Calculator.append('4')">4</button>
                    <button class="calc-btn" onclick="Calculator.append('5')">5</button>
                    <button class="calc-btn" onclick="Calculator.append('6')">6</button>
                    <button class="calc-btn calc-operator" onclick="Calculator.append('+')">+</button>
                </div>
                <div class="calc-row">
                    <button class="calc-btn" onclick="Calculator.append('1')">1</button>
                    <button class="calc-btn" onclick="Calculator.append('2')">2</button>
                    <button class="calc-btn" onclick="Calculator.append('3')">3</button>
                    <button class="calc-btn calc-equals" onclick="Calculator.calculate()">=</button>
                </div>
                <div class="calc-row">
                    <button class="calc-btn calc-zero" onclick="Calculator.append('0')">0</button>
                    <button class="calc-btn" onclick="Calculator.append('.')">.</button>
                    <button class="calc-btn calc-percent" onclick="Calculator.percent()">%</button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="calc-row">
                    <button class="calc-btn calc-sci" onclick="Calculator.append('Math.sqrt(')">√</button>
                    <button class="calc-btn calc-sci" onclick="Calculator.append('Math.pow(')">x²</button>
                    <button class="calc-btn calc-sci" onclick="Calculator.append('Math.pow(', true)">xʸ</button>
                    <button class="calc-btn calc-clear" onclick="Calculator.clear()">C</button>
                </div>
                <div class="calc-row">
                    <button class="calc-btn calc-sci" onclick="Calculator.append('Math.sin(')">sin</button>
                    <button class="calc-btn calc-sci" onclick="Calculator.append('Math.cos(')">cos</button>
                    <button class="calc-btn calc-sci" onclick="Calculator.append('Math.tan(')">tan</button>
                    <button class="calc-btn calc-operator" onclick="Calculator.append('/')">÷</button>
                </div>
                <div class="calc-row">
                    <button class="calc-btn calc-sci" onclick="Calculator.append('Math.log10(')">log</button>
                    <button class="calc-btn calc-sci" onclick="Calculator.append('Math.log(')">ln</button>
                    <button class="calc-btn calc-sci" onclick="Calculator.append('Math.PI')">π</button>
                    <button class="calc-btn calc-operator" onclick="Calculator.append('*')">×</button>
                </div>
                <div class="calc-row">
                    <button class="calc-btn" onclick="Calculator.append('7')">7</button>
                    <button class="calc-btn" onclick="Calculator.append('8')">8</button>
                    <button class="calc-btn" onclick="Calculator.append('9')">9</button>
                    <button class="calc-btn calc-operator" onclick="Calculator.append('-')">−</button>
                </div>
                <div class="calc-row">
                    <button class="calc-btn" onclick="Calculator.append('4')">4</button>
                    <button class="calc-btn" onclick="Calculator.append('5')">5</button>
                    <button class="calc-btn" onclick="Calculator.append('6')">6</button>
                    <button class="calc-btn calc-operator" onclick="Calculator.append('+')">+</button>
                </div>
                <div class="calc-row">
                    <button class="calc-btn" onclick="Calculator.append('1')">1</button>
                    <button class="calc-btn" onclick="Calculator.append('2')">2</button>
                    <button class="calc-btn" onclick="Calculator.append('3')">3</button>
                    <button class="calc-btn calc-equals" onclick="Calculator.calculate()">=</button>
                </div>
                <div class="calc-row">
                    <button class="calc-btn calc-zero" onclick="Calculator.append('0')">0</button>
                    <button class="calc-btn" onclick="Calculator.append('.')">.</button>
                    <button class="calc-btn calc-sci" onclick="Calculator.append('Math.E')">e</button>
                    <button class="calc-btn calc-backspace" onclick="Calculator.backspace()">⌫</button>
                </div>
            `;
        }
    },
    
    toggleMode() {
        this.mode = this.mode === 'basic' ? 'scientific' : 'basic';
        document.getElementById('calcModeLabel').textContent = this.mode === 'basic' ? 'Scientific' : 'Basic';
        this.renderButtons();
    },
    
    open() {
        const modal = document.getElementById('calculatorModal');
        if (modal) {
            modal.style.display = 'flex';
            this.isOpen = true;
        }
    },
    
    close() {
        const modal = document.getElementById('calculatorModal');
        if (modal) {
            modal.style.display = 'none';
            this.isOpen = false;
        }
    },
    
    append(value, isPower = false) {
        const display = document.getElementById('calcDisplay');
        if (isPower) {
            display.value += ',';
        } else {
            display.value += value;
        }
        display.focus();
    },
    
    clear() {
        const display = document.getElementById('calcDisplay');
        display.value = '';
        display.focus();
    },
    
    backspace() {
        const display = document.getElementById('calcDisplay');
        display.value = display.value.slice(0, -1);
        display.focus();
    },
    
    percent() {
        const display = document.getElementById('calcDisplay');
        try {
            const result = eval(display.value) / 100;
            display.value = result;
        } catch (e) {
            display.value = 'Error';
        }
        display.focus();
    },
    
    calculate() {
        const display = document.getElementById('calcDisplay');
        try {
            let expression = display.value;
            expression = expression.replace(/×/g, '*').replace(/−/g, '-').replace(/÷/g, '/');
            expression = expression.replace(/Math\.sin\(/g, 'Math.sin(');
            expression = expression.replace(/Math\.cos\(/g, 'Math.cos(');
            expression = expression.replace(/Math\.tan\(/g, 'Math.tan(');
            expression = expression.replace(/Math\.sqrt\(/g, 'Math.sqrt(');
            expression = expression.replace(/Math\.log10\(/g, 'Math.log10(');
            expression = expression.replace(/Math\.log\(/g, 'Math.log(');
            expression = expression.replace(/Math\.PI/g, 'Math.PI');
            expression = expression.replace(/Math\.E/g, 'Math.E');
            expression = expression.replace(/\^/g, '**');
            
            const result = eval(expression);
            display.value = Number.isFinite(result) ? Math.round(result * 10000000000) / 10000000000 : 'Error';
        } catch (e) {
            display.value = 'Error';
        }
        display.focus();
    },
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
};

window.Calculator = Calculator;

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && Calculator.isOpen) {
        Calculator.close();
    }
    if (e.key === '/' && e.altKey && !Calculator.isOpen) {
        e.preventDefault();
        Calculator.open();
    }
});
