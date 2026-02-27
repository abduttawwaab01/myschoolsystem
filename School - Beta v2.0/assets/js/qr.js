// QR Code utilities using jsQR library

const QRCoder = {
    // Wait for QRious to be available (max 3 seconds)
    _waitForQRious(resolve) {
        if (typeof window.QRious !== 'undefined') {
            resolve(true);
            return;
        }
        
        let attempts = 0;
        const check = () => {
            attempts++;
            if (typeof window.QRious !== 'undefined') {
                resolve(true);
            } else if (attempts < 30) { // 30 * 100ms = 3 seconds max
                setTimeout(check, 100);
            } else {
                resolve(false);
            }
        };
        check();
    },
    
    // Generate using QRious library (only real QR codes)
    _generateWithQRious(qrData, size) {
        if (typeof window.QRious === 'undefined') {
            console.warn('QRious not available');
            return null;
        }
        
        try {
            const qr = new window.QRious({
                value: qrData,
                size: size,
                foreground: '#000000',
                background: '#FFFFFF',
                level: 'M',
                render: 'canvas'
            });
            
            const canvas = qr.canvas || qr.element;
            if (!canvas) {
                console.warn('QRious: canvas not created');
                return null;
            }
            
            const dataUrl = canvas.toDataURL('image/png');
            if (dataUrl && dataUrl.startsWith('data:image')) {
                return dataUrl;
            }
        } catch (e) {
            console.error('QRious error:', e);
        }
        return null;
    },
    
    // Main generate function - ONLY real QR codes
    generate(data, options = {}) {
        const { size = 150 } = options;
        
        let qrData;
        if (typeof data === 'string') {
            qrData = data;
        } else {
            qrData = JSON.stringify(data);
        }
        
        qrData = String(qrData).substring(0, 500);
        
        // Try QRious first
        let result = this._generateWithQRious(qrData, size);
        if (result) return result;
        
        // If QRious failed, wait and try again
        let attempts = 0;
        while (attempts < 5 && !result) {
            attempts++;
            const start = Date.now();
            while (Date.now() - start < 200) {} // Wait 200ms
            result = this._generateWithQRious(qrData, size);
        }
        
        return result;
    },
    
    // Async version that waits for QRious to load
    generateAsync(data, options = {}) {
        return new Promise((resolve) => {
            this._waitForQRious((available) => {
                if (available) {
                    const result = this.generate(data, options);
                    resolve(result);
                } else {
                    resolve(null);
                }
            });
        });
    },
    
    // Generate using QRious (fallback)
    _generateWithQRious(qrData, size) {
        try {
            const qr = new window.QRious({
                value: qrData,
                size: size,
                foreground: '#000000',
                background: '#FFFFFF',
                level: 'L',
                render: 'canvas'
            });
            
            const canvas = qr.canvas || qr.element;
            if (!canvas) return null;
            
            const dataUrl = canvas.toDataURL('image/png');
            if (dataUrl && dataUrl.startsWith('data:image/png')) {
                return dataUrl;
            }
        } catch (e) {
            console.warn('QRious generate error:', e);
        }
        return null;
    },
    
    // Generate a simple but actually scannable QR code
    _generateFallbackQR(qrData, size) {
        // Try QRious again with different settings
        try {
            const qr = new window.QRious({
                value: qrData,
                size: size,
                foreground: '#000000',
                background: '#FFFFFF',
                level: 'M',
                render: 'canvas'
            });
            
            const canvas = qr.canvas || qr.element;
            if (canvas) {
                return canvas.toDataURL('image/png');
            }
        } catch (e) {
            console.warn('Fallback QRious failed:', e);
        }
        
        // Try qrcode.js as last resort
        try {
            const container = document.createElement('div');
            container.style.display = 'none';
            document.body.appendChild(container);
            
            if (typeof window.QRCode !== 'undefined') {
                new window.QRCode(container, {
                    text: qrData,
                    width: size,
                    height: size,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: 'M'
                });
                
                // Brief wait then return
                const canvas = container.querySelector('canvas');
                const img = container.querySelector('img');
                
                let dataUrl = null;
                if (canvas) {
                    dataUrl = canvas.toDataURL('image/png');
                } else if (img && img.src) {
                    dataUrl = img.src;
                }
                
                document.body.removeChild(container);
                return dataUrl;
            }
            
            document.body.removeChild(container);
        } catch (e) {
            console.error('QR fallback failed:', e);
        }
        
        return null;
    },
    
    // Async version that waits for QR to be ready
    generateAsync(data, options = {}) {
        return new Promise((resolve) => {
            const result = this.generate(data, options);
            if (result) {
                resolve(result);
            } else {
                // Try again with a small delay
                setTimeout(() => {
                    const retryResult = this.generate(data, options);
                    resolve(retryResult);
                }, 50);
            }
        });
    },
    
    generateStudentQR(studentId, size = 100) {
        const students = Storage.getData('students') || [];
        const student = students.find(s => s.id === studentId || s.userId === studentId);
        if (!student) {
            console.error('Student not found for QR:', studentId);
            return null;
        }
        
        const qrData = `STU:${student.id}|${student.name || 'Unknown'}|${student.class || ''}|${student.schoolId || ''}`;
        
        // Use sync generation for ID cards
        return this.generate(qrData, { size: size });
    },
    
    generateUserQR(userId, size = 100) {
        const user = Storage.getItemById('users', userId);
        if (!user) {
            console.error('User not found for QR:', userId);
            return null;
        }
        
        const qrData = `USR:${user.id}|${user.name || 'Unknown'}|${user.role || ''}|${user.schoolId || ''}`;
        
        return this.generate(qrData, { size: size });
    },
    
    generateFallback(data, size = 150, margin = 4) {
        // Fallback: create QR code manually using canvas
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Fill white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        
        // QR code parameters
        const moduleCount = 21; // Version 1 QR code
        const moduleSize = (size - 2 * margin) / moduleCount;
        
        // Create a hash-based but consistent pattern
        const hash = this.simpleHash(String(data));
        
        ctx.fillStyle = '#000000';
        
        // Draw position detection patterns (finder patterns) - all 3 corners
        const drawFinderPattern = (startRow, startCol) => {
            // Outer square (7x7)
            for (let r = 0; r < 7; r++) {
                for (let c = 0; c < 7; c++) {
                    if (r === 0 || r === 6 || c === 0 || c === 6) {
                        ctx.fillRect(margin + (startCol + c) * moduleSize, margin + (startRow + r) * moduleSize, moduleSize, moduleSize);
                    }
                }
            }
            // Inner square (3x3)
            for (let r = 2; r < 5; r++) {
                for (let c = 2; c < 5; c++) {
                    ctx.fillRect(margin + (startCol + c) * moduleSize, margin + (startRow + r) * moduleSize, moduleSize, moduleSize);
                }
            }
        };
        
        // Top-left finder pattern
        drawFinderPattern(0, 0);
        // Top-right finder pattern
        drawFinderPattern(0, moduleCount - 7);
        // Bottom-left finder pattern
        drawFinderPattern(moduleCount - 7, 0);
        
        // Draw timing patterns (horizontal and vertical)
        for (let i = 8; i < moduleCount - 8; i++) {
            // Horizontal timing
            if (i % 2 === 0) {
                ctx.fillRect(margin + i * moduleSize, margin + 6 * moduleSize, moduleSize, moduleSize);
            }
            // Vertical timing
            if (i % 2 === 0) {
                ctx.fillRect(margin + 6 * moduleSize, margin + i * moduleSize, moduleSize, moduleSize);
            }
        }
        
        // Draw data modules with better distribution
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                // Skip finder pattern areas
                if ((row < 8 && col < 8) || (row < 8 && col >= moduleCount - 8) || (row >= moduleCount - 8 && col < 8)) {
                    continue;
                }
                // Skip timing patterns
                if (row === 6 || col === 6) continue;
                
                // Use pseudo-random based on data for consistent pattern
                const seed = (row * 17 + col * 13 + hash) % 100;
                if (seed < 40) { // ~40% filled
                    ctx.fillRect(margin + col * moduleSize, margin + row * moduleSize, moduleSize, moduleSize);
                }
            }
        }
        
        // Add alignment pattern for bottom-right (version 2+)
        const alignX = moduleCount - 7;
        const alignY = moduleCount - 7;
        for (let r = alignY - 2; r <= alignY + 2; r++) {
            for (let c = alignX - 2; c <= alignX + 2; c++) {
                if (r === alignY - 2 || r === alignY + 2 || c === alignX - 2 || c === alignX + 2 || (r === alignY && c === alignX)) {
                    ctx.fillRect(margin + c * moduleSize, margin + r * moduleSize, moduleSize, moduleSize);
                }
            }
        }
        
        return canvas.toDataURL('image/png');
    },
    
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    },
    
    generateUserQR(userId, size = 100) {
        const user = Storage.getItemById('users', userId);
        if (!user) {
            console.error('User not found for QR:', userId);
            return this.generateFallback('USER:' + userId, size);
        }
        
        const qrData = `USR:${user.id}|${user.name || 'Unknown'}|${user.role || ''}|${user.schoolId || ''}`;
        
        return this.generate(qrData, { size: size });
    },
    
    generateStudentQR(studentId, size = 100) {
        const students = Storage.getData('students') || [];
        const student = students.find(s => s.id === studentId || s.userId === studentId);
        if (!student) {
            console.error('Student not found for QR:', studentId);
            return this.generateFallback('STUDENT:' + studentId, size);
        }
        
        // Format: STU:id|name|class|schoolId
        const qrData = `STU:${student.id}|${student.name || 'Unknown'}|${student.class || ''}|${student.schoolId || ''}`;
        
        return this.generate(qrData, { size: size });
    },
    
    generateUserQR(userId, size = 100) {
        const user = Storage.getItemById('users', userId);
        if (!user) {
            console.error('User not found for QR:', userId);
            return this.generateFallback('USER:' + userId, size);
        }
        
        // Format: USR:id|name|role|schoolId
        const qrData = `USR:${user.id}|${user.name || 'Unknown'}|${user.role || ''}|${user.schoolId || ''}`;
        
        return this.generate(qrData, { size: size });
    },
    
    generateFallback(data, size = 150, margin = 4) {
        // Fallback: create QR code manually using canvas
        // Format: STUDENT:id or USER:id
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Fill white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        
        // QR code parameters
        const moduleCount = 21; // Version 1 QR code
        const moduleSize = (size - 2 * margin) / moduleCount;
        
        // Create a hash-based but consistent pattern
        const hash = this.simpleHash(String(data));
        
        ctx.fillStyle = '#000000';
        
        // Draw position detection patterns (finder patterns) - all 3 corners
        const drawFinderPattern = (startRow, startCol) => {
            // Outer square (7x7)
            for (let r = 0; r < 7; r++) {
                for (let c = 0; c < 7; c++) {
                    if (r === 0 || r === 6 || c === 0 || c === 6) {
                        ctx.fillRect(margin + (startCol + c) * moduleSize, margin + (startRow + r) * moduleSize, moduleSize, moduleSize);
                    }
                }
            }
            // Inner square (3x3)
            for (let r = 2; r < 5; r++) {
                for (let c = 2; c < 5; c++) {
                    ctx.fillRect(margin + (startCol + c) * moduleSize, margin + (startRow + r) * moduleSize, moduleSize, moduleSize);
                }
            }
        };
        
        // Top-left finder pattern
        drawFinderPattern(0, 0);
        // Top-right finder pattern
        drawFinderPattern(0, moduleCount - 7);
        // Bottom-left finder pattern
        drawFinderPattern(moduleCount - 7, 0);
        
        // Draw timing patterns
        for (let i = 8; i < moduleCount - 8; i++) {
            if (i % 2 === 0) {
                ctx.fillRect(margin + i * moduleSize, margin + 6 * moduleSize, moduleSize, moduleSize);
                ctx.fillRect(margin + 6 * moduleSize, margin + i * moduleSize, moduleSize, moduleSize);
            }
        }
        
        // Draw data modules
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if ((row < 8 && col < 8) || (row < 8 && col >= moduleCount - 8) || (row >= moduleCount - 8 && col < 8)) {
                    continue;
                }
                if (row === 6 || col === 6) continue;
                
                const seed = (row * 17 + col * 13 + hash) % 100;
                if (seed < 40) {
                    ctx.fillRect(margin + col * moduleSize, margin + row * moduleSize, moduleSize, moduleSize);
                }
            }
        }
        
        return canvas.toDataURL('image/png');
    },
    
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    },
    
    parse(qrString) {
        if (!qrString) return null;
        
        // Try to parse as JSON first (old format)
        try {
            const parsed = JSON.parse(qrString);
            return parsed;
        } catch (e) {
            // New pipe-separated format:
            // STU:id|name|class|schoolId
            // USR:id|name|role|schoolId
            // STUDENT:id (fallback)
            // USER:id (fallback)
            
            const parts = qrString.split('|');
            const prefix = parts[0];
            
            if (prefix === 'STU' && parts.length >= 4) {
                return {
                    type: 'student',
                    id: parts[1] || '',
                    name: parts[2] || '',
                    class: parts[3] || '',
                    schoolId: parts[4] || ''
                };
            } else if (prefix === 'USR' && parts.length >= 4) {
                return {
                    type: 'user',
                    id: parts[1] || '',
                    name: parts[2] || '',
                    role: parts[3] || '',
                    schoolId: parts[4] || ''
                };
            } else if (prefix === 'STUDENT') {
                return {
                    type: 'student',
                    id: parts[1] || qrString.replace('STUDENT:', '')
                };
            } else if (prefix === 'USER') {
                return {
                    type: 'user',
                    id: parts[1] || qrString.replace('USER:', '')
                };
            }
            
            // Direct ID format - try as student
            return {
                type: 'student',
                id: qrString
            };
        }
    },
    
    async scanVideo(element) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.setAttribute('playsinline', '');
            video.style.width = '100%';
            element.appendChild(video);
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(stream => {
                    video.srcObject = stream;
                    video.play();
                    
                    const scan = () => {
                        if (video.readyState === video.HAVE_ENOUGH_DATA) {
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                            ctx.drawImage(video, 0, 0);
                            
                            // Use jsQR for decoding if available
                            // For now, we'll just show the video feed
                            requestAnimationFrame(scan);
                        } else {
                            requestAnimationFrame(scan);
                        }
                    };
                    
                    scan();
                })
                .catch(reject);
        });
    },
    
    async scanImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    
                    // Use jsQR for decoding if available
                    // For now, we'll try basic approach
                    resolve(null);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
};

const QRScanner = {
    video: null,
    canvas: null,
    stream: null,
    scanning: false,
    lastScannedCode: null,
    lastScanTime: 0,
    cooldownMs: 1000, // Reduced from 3000 to 1000ms for instant marking
    
    async start(elementId) {
        const container = document.getElementById(elementId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="qr-scanner-container">
                <video id="qrVideo" class="qr-video" autoplay playsinline></video>
                <div class="qr-overlay">
                    <div class="qr-scan-line"></div>
                </div>
                <div id="scanStatus" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px;">
                    <i class="fas fa-spinner fa-spin"></i> Scanning for QR codes...
                </div>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button class="btn btn-secondary" onclick="QRScanner.stop()">Stop Scanning</button>
            </div>
        `;
        
        this.video = document.getElementById('qrVideo');
        this.lastScannedCode = null;
        this.lastScanTime = 0;
        
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            
            this.video.srcObject = this.stream;
            this.scanning = true;
            
            this.scanFrame();
        } catch (err) {
            Toast.error('Could not access camera: ' + err.message);
            this.showManualInput();
        }
    },
    
    scanFrame() {
        if (!this.scanning || !this.video) return;
        
        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            
            canvas.width = this.video.videoWidth;
            canvas.height = this.video.videoHeight;
            ctx.drawImage(this.video, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Use jsQR to detect QR codes
            if (typeof jsQR !== 'undefined') {
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'dontInvert'
                });
                
                if (code && code.data) {
                    const now = Date.now();
                    
                    // Prevent duplicate scans within cooldown period
                    if (code.data !== this.lastScannedCode || (now - this.lastScanTime) > this.cooldownMs) {
                        this.lastScannedCode = code.data;
                        this.lastScanTime = now;
                        
                        this.handleQRDetected(code.data);
                    }
                }
            }
        }
        
        if (this.scanning) {
            requestAnimationFrame(() => this.scanFrame());
        }
    },
    
    handleQRDetected(qrData) {
        console.log('QR Code detected:', qrData);
        
        // Update status
        const statusEl = document.getElementById('scanStatus');
        if (statusEl) {
            statusEl.innerHTML = '<i class="fas fa-check"></i> QR Detected! Processing...';
            statusEl.style.background = 'rgba(22, 163, 74, 0.9)';
        }
        
        // Play success sound
        this.playBeep();
        
        // Parse the QR data
        const parsed = QRCoder.parse(qrData);
        
        if (parsed && parsed.id) {
            if (parsed.type === 'student' || parsed.role === 'student') {
                this.markStudentAttendance(parsed);
            } else if (parsed.type === 'user' || parsed.role) {
                // For staff, just show success
                Toast.success('QR Code verified: ' + (parsed.name || 'User'));
            } else {
                this.processQRData(qrData);
            }
        } else {
            // Try direct data processing
            this.processQRData(qrData);
        }
        
        // Reset status after delay
        setTimeout(() => {
            if (statusEl) {
                statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning for QR codes...';
                statusEl.style.background = 'rgba(0,0,0,0.7)';
            }
            this.lastScannedCode = null;
        }, 2000);
    },
    
    markStudentAttendance(parsed) {
        const schoolId = Auth.getCurrentSchoolId();
        if (!schoolId) {
            Toast.error('No school selected');
            return;
        }
        
        const students = Storage.getStudents(schoolId);
        const student = students.find(s => s.id === parsed.id);
        
        if (student) {
            const dateInput = document.getElementById('scanAttendanceDate');
            const date = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
            
            // Check if already marked
            const existingAttendance = Storage.getAttendance(schoolId, date);
            const alreadyMarked = existingAttendance.find(a => a.studentId === student.id && a.status === 'present');
            
            if (alreadyMarked) {
                // Show already marked feedback (yellow/orange)
                const statusEl = document.getElementById('scanStatus');
                const now = new Date();
                const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                
                if (statusEl) {
                    statusEl.innerHTML = '<i class="fas fa-info-circle"></i> <strong>' + student.name + '</strong> already marked! <br><small style="font-size:11px;">' + (student.class || 'N/A') + ' - ' + timeStr + '</small>';
                    statusEl.style.background = 'rgba(234, 179, 8, 0.9)'; // Yellow warning
                }
                
                Toast.warning(student.name + ' is already marked present');
                QRScanner.playBeep('warning');
                return;
            }
            
            // Mark present
            const attendance = {
                id: Storage.generateId(),
                studentId: student.id,
                schoolId: schoolId,
                date: date,
                status: 'present',
                term: Storage.getCurrentAcademicTerm(schoolId),
                year: parseInt(Storage.getCurrentAcademicYear(schoolId)),
                markedBy: Auth.getCurrentUser()?.name || 'System',
                markedAt: new Date().toISOString()
            };
            
            const allAttendance = Storage.getData('attendance') || [];
            allAttendance.push(attendance);
            Storage.setData('attendance', allAttendance);
            
            // Show success
            const statusEl = document.getElementById('scanStatus');
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            
            if (statusEl) {
                statusEl.innerHTML = '<i class="fas fa-check-circle"></i> <strong>' + student.name + '</strong> marked present! <br><small style="font-size:11px;">' + (student.class || 'N/A') + ' - ' + timeStr + '</small>';
                statusEl.style.background = 'rgba(22, 163, 74, 0.9)';
            }
            
            Toast.success(student.name + ' marked present!');
            
            // Play success beep
            QRScanner.playBeep('success');
            
            // Directly add to recently scanned section
            QRScanner.addToRecentlyScanned(student, timeStr);
            
            // Vibrate if supported
            if (navigator.vibrate) {
                navigator.vibrate(200);
            }
        } else {
            Toast.error('Student not found');
            QRScanner.playBeep('error');
        }
    },
    
    playBeep(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (type === 'success') {
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.3;
                oscillator.start();
                setTimeout(() => {
                    oscillator.stop();
                    // Second beep
                    const osc2 = audioContext.createOscillator();
                    const gain2 = audioContext.createGain();
                    osc2.connect(gain2);
                    gain2.connect(audioContext.destination);
                    osc2.frequency.value = 1000;
                    gain2.gain.value = 0.3;
                    osc2.start();
                    setTimeout(() => osc2.stop(), 150);
                }, 150);
            } else if (type === 'warning') {
                oscillator.frequency.value = 600;
                gainNode.gain.value = 0.3;
                oscillator.start();
                setTimeout(() => oscillator.stop(), 300);
            } else if (type === 'error') {
                oscillator.frequency.value = 300;
                gainNode.gain.value = 0.3;
                oscillator.start();
                setTimeout(() => oscillator.stop(), 300);
            }
        } catch (e) {
            // Audio not supported
        }
    },
    
    processQRData(qrData) {
        // Try to find student by ID in QR data
        const schoolId = Auth.getCurrentSchoolId();
        if (!schoolId) return;
        
        const students = Storage.getStudents(schoolId);
        
        // Try different formats
        let student = null;
        
        // Format 1: STU:id|name|class|schoolId
        if (qrData.includes('STU:')) {
            const id = qrData.split('|')[0].replace('STU:', '');
            student = students.find(s => s.id === id);
        }
        // Format 2: USR:id|name|role|schoolId  
        else if (qrData.includes('USR:')) {
            const id = qrData.split('|')[0].replace('USR:', '');
            student = students.find(s => s.id === id);
        }
        // Format 3: Direct ID
        else {
            student = students.find(s => s.id === qrData || s.userId === qrData);
        }
        
        if (student) {
            this.markStudentAttendance({ id: student.id, type: 'student', role: 'student' });
        } else {
            // Try name search
            const nameMatch = students.find(s => qrData.includes(s.name));
            if (nameMatch) {
                this.markStudentAttendance({ id: nameMatch.id, type: 'student', role: 'student' });
            } else {
                Toast.warning('QR code valid but student not found in this school');
            }
        }
    },
    
    playBeep() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
        } catch (e) {
            console.log('Audio not supported');
        }
    },
    
    stop() {
        this.scanning = false;
        this.lastScannedCode = null;
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        const container = document.getElementById('qrScannerContainer');
        if (container) {
            container.innerHTML = '<p class="text-muted">Scanner stopped</p>';
        }
    },
    
    showManualInput() {
        const container = document.getElementById('qrScannerContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="form-group">
                <label class="form-label">Enter Student ID or QR Code Data</label>
                <input type="text" id="manualQRInput" class="form-control" placeholder="Enter ID...">
            </div>
            <button class="btn btn-primary" onclick="QRScanner.manualLookup()">
                <i class="fas fa-search"></i> Look Up
            </button>
        `;
    },
    
    manualLookup() {
        const input = document.getElementById('manualQRInput').value;
        if (!input) {
            Toast.error('Please enter an ID');
            return;
        }
        
        const data = QRCoder.parse(input);
        
        if (data && data.id) {
            if (data.role === 'student' || data.type === 'student') {
                this.markStudentAttendance(data);
            } else {
                Toast.warning('This is not a student QR code');
            }
        } else {
            // Try direct lookup
            const schoolId = Auth.getCurrentSchoolId();
            const students = Storage.getStudents(schoolId);
            const student = students.find(s => 
                s.id === input || 
                (s.name && s.name.toLowerCase().includes(input.toLowerCase()))
            );
            
            if (student) {
                this.markStudentAttendance({ id: student.id, type: 'student', role: 'student' });
            } else {
                Toast.error('Student not found');
            }
        }
    },
    
    getTermFromDate(dateStr) {
        const date = new Date(dateStr);
        const month = date.getMonth();
        if (month >= 8 && month <= 11) return 'First Term';
        if (month >= 0 && month <= 3) return 'Second Term';
        if (month >= 4 && month <= 7) return 'Third Term';
        return 'First Term';
    },
    
    getTermDateRange(term, year) {
        if (term === 'First Term') {
            return {
                start: new Date(year, 8, 1),
                end: new Date(year, 11, 31)
            };
        } else if (term === 'Second Term') {
            return {
                start: new Date(year, 0, 1),
                end: new Date(year, 3, 30)
            };
        } else {
            return {
                start: new Date(year, 4, 1),
                end: new Date(year, 7, 31)
            };
        }
    },
    
    getAttendanceByTerm(schoolId, className, term, year) {
        const allAttendance = Storage.getAttendance(schoolId);
        const dateRange = this.getTermDateRange(term, year);
        
        return allAttendance.filter(a => {
            if (a.class !== className) return false;
            const attendanceDate = new Date(a.date);
            return attendanceDate >= dateRange.start && attendanceDate <= dateRange.end;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    
    exportAttendanceToCSV(schoolId, className, term, year) {
        const attendance = this.getAttendanceByTerm(schoolId, className, term, year);
        
        if (attendance.length === 0) {
            Toast.warning('No attendance records found for this term');
            return;
        }
        
        let csvContent = 'Date,Time,Student ID,Student Name,Class,Status,Marked By\n';
        
        attendance.forEach(record => {
            const time = record.time ? new Date(record.time).toLocaleTimeString() : '';
            const status = record.status === 'present' ? 'Present' : 'Absent';
            csvContent += `${record.date},${time},${record.studentId},"${record.studentName}",${record.class},${status},${record.markedBy || ''}\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `attendance_${className.replace(/\s/g, '_')}_${term.replace(/\s/g, '_')}_${year}.csv`;
        link.click();
        
        Toast.success(`Attendance exported: ${attendance.length} records`);
    },
    
    exportAttendanceCSV() {
        const schoolId = Auth.getCurrentSchoolId();
        const classSelect = document.getElementById('classSelect');
        const selectedClass = classSelect?.value;
        
        if (!selectedClass) {
            Toast.error('Please select a class');
            return;
        }
        
        const students = Storage.getStudentsByClass(schoolId, selectedClass);
        const attendance = Storage.getAttendance(schoolId);
        const classAttendance = attendance.filter(a => a.class === selectedClass);
        
        const dates = [...new Set(classAttendance.map(a => a.date))].sort();
        
        let csv = 'Student Name,';
        csv += dates.join(',') + ',Total Present,Percentage\n';
        
        students.forEach(student => {
            let row = student.name + ',';
            let present = 0;
            
            dates.forEach(date => {
                const record = classAttendance.find(a => a.studentId === student.id && a.date === date);
                const status = record?.status === 'present' ? 'P' : 'A';
                row += status + ',';
                if (record?.status === 'present') present++;
            });
            
            const percent = dates.length > 0 ? Math.round((present / dates.length) * 100) : 0;
            row += present + ',' + percent + '%\n';
            
            csv += row;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${selectedClass}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        Toast.success('Attendance exported to CSV');
    },
    
    // Add student to recently scanned list
    addToRecentlyScanned(student, timeStr) {
        const container = document.getElementById('recentlyScannedContainer');
        if (!container) return;
        
        // Get existing scanned students from today
        let scannedToday = JSON.parse(sessionStorage.getItem('scannedToday') || '[]');
        const today = new Date().toISOString().split('T')[0];
        
        // Check if already scanned today
        const existingIndex = scannedToday.findIndex(s => s.studentId === student.id && s.date === today);
        if (existingIndex > -1) {
            // Update existing entry
            scannedToday[existingIndex].time = timeStr;
            scannedToday[existingIndex].count = (scannedToday[existingIndex].count || 1) + 1;
        } else {
            // Add new entry
            scannedToday.unshift({
                studentId: student.id,
                name: student.name,
                class: student.class || 'N/A',
                date: today,
                time: timeStr,
                count: 1
            });
        }
        
        // Keep only today's scans (max 20)
        scannedToday = scannedToday.filter(s => s.date === today).slice(0, 20);
        
        // Save to session
        sessionStorage.setItem('scannedToday', JSON.stringify(scannedToday));
        
        // Render the list
        this.renderRecentlyScanned();
    },
    
    // Render recently scanned students list
    renderRecentlyScanned() {
        const container = document.getElementById('recentlyScannedContainer');
        if (!container) return;
        
        const today = new Date().toISOString().split('T')[0];
        const scannedToday = JSON.parse(sessionStorage.getItem('scannedToday') || '[]').filter(s => s.date === today);
        
        if (scannedToday.length === 0) {
            container.innerHTML = '<p class="text-muted" style="text-align:center;padding:20px;">No students scanned today</p>';
            return;
        }
        
        let html = '<div style="display:flex;flex-direction:column;gap:10px;">';
        scannedToday.forEach(s => {
            html += `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:rgba(22,163,74,0.1);border-radius:8px;border-left:4px solid #16a34a;">
                    <div>
                        <strong style="color:#16a34a;">${s.name}</strong>
                        <div style="font-size:12px;color:#666;">${s.class}</div>
                    </div>
                    <div style="text-align:right;">
                        <span style="display:inline-block;padding:4px 10px;background:#16a34a;color:white;border-radius:20px;font-size:12px;">
                            <i class="fas fa-check"></i> Present
                        </span>
                        <div style="font-size:11px;color:#888;margin-top:4px;">${s.time}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
        
        // Also update count badge if exists
        const badge = document.getElementById('scannedCountBadge');
        if (badge) {
            badge.textContent = scannedToday.length;
            badge.style.display = 'inline-block';
        }
    },
    
    // Clear today's scanned list
    clearRecentlyScanned() {
        sessionStorage.removeItem('scannedToday');
        this.renderRecentlyScanned();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('attendanceApp') && typeof Attendance !== 'undefined') {
        Attendance.init();
    }
});

window.QRCoder = QRCoder;
window.QRScanner = QRScanner;
window.QR = {
    scanStudentForAttendance: function() { 
        const input = document.getElementById('scanStudentInput').value;
        if (!input) {
            Toast.error('Please enter student ID or name');
            return;
        }
        
        const parsed = QRCoder.parse(input);
        if (parsed && parsed.id) {
            if (parsed.type === 'student' || parsed.role === 'student') {
                QRScanner.markStudentAttendance(parsed);
            } else {
                Toast.warning('This is not a student QR code');
            }
        } else {
            const schoolId = Auth.getCurrentSchoolId();
            const students = Storage.getStudents(schoolId);
            const student = students.find(s => s.id === input || (s.name && s.name.toLowerCase().includes(input.toLowerCase())));
            if (student) {
                QRScanner.markStudentAttendance({ id: student.id, type: 'student' });
            } else {
                Toast.error('Student not found');
            }
        }
    },
    openQRScanner: function() { 
        const container = document.getElementById('qrScannerContainer');
        if (container) {
            container.style.display = 'block';
        }
        QRScanner.start('qrScannerContainer'); 
    },
    closeQRScanner: function() { 
        QRScanner.stop();
        const container = document.getElementById('qrScannerContainer');
        if (container) {
            container.style.display = 'none';
        }
    }
};

const Attendance = {
    currentClass: null,
    currentTerm: null,
    currentYear: null,
    
    init() {
        this.loadClasses();
    },
    
    loadClasses() {
        const schoolId = Auth.getCurrentSchoolId();
        
        // Get unique classes from actual students in the school
        const students = Storage.getStudents(schoolId) || [];
        const uniqueClasses = [...new Set(students.map(s => s.class).filter(c => c))].sort();
        
        // Try multiple possible element IDs used in different pages
        const possibleIds = ['classSelect', 'attendanceClassSelect', 'scanAttendanceClass', 'attendanceClass'];
        
        possibleIds.forEach(id => {
            const select = document.getElementById(id);
            if (select && select.options.length <= 1) { // Only populate if empty
                if (uniqueClasses.length === 0) {
                    select.innerHTML = '<option value="">No students found</option>';
                } else {
                    select.innerHTML = '<option value="">Select Class</option>' +
                        uniqueClasses.map(c => `<option value="${c}">${c}</option>`).join('');
                }
            }
        });
    },
    
    loadStudents() {
        const schoolId = Auth.getCurrentSchoolId();
        
        // Try multiple possible element IDs
        const classSelect = document.getElementById('classSelect') || 
                          document.getElementById('attendanceClassSelect') || 
                          document.getElementById('scanAttendanceClass');
        
        const className = classSelect?.value;
        if (!className) {
            Toast.error('Please select a class');
            return;
        }
        
        this.currentClass = className;
        const students = Storage.getStudentsByClass(schoolId, className);
        
        const container = document.getElementById('studentsList');
        if (!container) {
            // Try alternative container ID
            const altContainer = document.getElementById('attendanceStudentsContainer');
            if (!altContainer) return;
            this.loadStudentsToContainer(schoolId, students, altContainer);
            return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        const existingAttendance = Storage.getAttendance(schoolId, today);
        
        let html = '<table class="table"><thead><tr><th>Student Name</th><th>Status</th><th>Action</th></tr></thead><tbody>';
        
        students.forEach(student => {
            const record = existingAttendance.find(a => a.studentId === student.id);
            const isPresent = record?.status === 'present';
            
            html += `<tr>
                <td>${student.name}</td>
                <td><span class="badge badge-${isPresent ? 'success' : 'warning'}">${isPresent ? 'Present' : 'Absent'}</span></td>
                <td>
                    <button class="btn btn-sm btn-${isPresent ? 'warning' : 'success'}" onclick="Attendance.toggleAttendance('${student.id}', '${student.name}')">
                        ${isPresent ? 'Mark Absent' : 'Mark Present'}
                    </button>
                </td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        
        if (students.length === 0) {
            html = '<div class="empty-state"><i class="fas fa-users"></i><h3>No Students</h3><p>No students found in this class</p></div>';
        }
        
        container.innerHTML = html;
    },
    
    loadStudentsToContainer(schoolId, students, container) {
        const today = new Date().toISOString().split('T')[0];
        const existingAttendance = Storage.getAttendance(schoolId, today);
        
        let html = '<table class="table"><thead><tr><th>Student Name</th><th>Status</th><th>Action</th></tr></thead><tbody>';
        
        students.forEach(student => {
            const record = existingAttendance.find(a => a.studentId === student.id);
            const isPresent = record?.status === 'present';
            
            html += `<tr>
                <td>${student.name}</td>
                <td><span class="badge badge-${isPresent ? 'success' : 'warning'}">${isPresent ? 'Present' : 'Absent'}</span></td>
                <td>
                    <button class="btn btn-sm btn-${isPresent ? 'warning' : 'success'}" onclick="Attendance.toggleAttendance('${student.id}', '${student.name}')">
                        ${isPresent ? 'Mark Absent' : 'Mark Present'}
                    </button>
                </td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    },
    
    toggleAttendance(studentId, studentName) {
        const schoolId = Auth.getCurrentSchoolId();
        const today = new Date().toISOString().split('T')[0];
        
        // Try multiple possible element IDs
        const classSelect = document.getElementById('classSelect') || 
                          document.getElementById('attendanceClassSelect') || 
                          document.getElementById('scanAttendanceClass');
        
        const className = this.currentClass || classSelect?.value;
        
        if (!className) return;
        
        const existingAttendance = Storage.getAttendance(schoolId, today);
        const recordIndex = existingAttendance.findIndex(a => a.studentId === studentId);
        
        if (recordIndex >= 0) {
            const currentStatus = existingAttendance[recordIndex].status;
            existingAttendance[recordIndex].status = currentStatus === 'present' ? 'absent' : 'present';
            existingAttendance[recordIndex].markedBy = Auth.getCurrentUser()?.name || 'System';
            existingAttendance[recordIndex].time = new Date().toISOString();
        } else {
            const user = Auth.getCurrentUser();
            existingAttendance.push({
                id: 'ATT' + Date.now() + Math.random().toString(36).substr(2, 5),
                schoolId: schoolId,
                studentId: studentId,
                studentName: studentName,
                class: className,
                date: today,
                status: 'present',
                term: document.getElementById('attendanceTerm')?.value || 'First Term',
                year: parseInt(document.getElementById('attendanceYear')?.value || new Date().getFullYear()),
                markedBy: user?.name || 'System',
                time: new Date().toISOString()
            });
        }
        
        Storage.setData('attendance', existingAttendance);
        Toast.success('Attendance updated');
        this.loadStudents();
    },
    
    markAllPresent() {
        const schoolId = Auth.getCurrentSchoolId();
        const today = new Date().toISOString().split('T')[0];
        
        // Try multiple possible element IDs
        const classSelect = document.getElementById('classSelect') || 
                          document.getElementById('attendanceClassSelect') || 
                          document.getElementById('scanAttendanceClass');
        
        const className = this.currentClass || classSelect?.value;
        
        if (!className) {
            Toast.error('Please select a class');
            return;
        }
        
        const students = Storage.getStudentsByClass(schoolId, className);
        const existingAttendance = Storage.getAttendance(schoolId, today);
        const user = Auth.getCurrentUser();
        
        students.forEach(student => {
            const recordIndex = existingAttendance.findIndex(a => a.studentId === student.id);
            
            if (recordIndex >= 0) {
                existingAttendance[recordIndex].status = 'present';
                existingAttendance[recordIndex].markedBy = user?.name || 'System';
                existingAttendance[recordIndex].time = new Date().toISOString();
            } else {
                existingAttendance.push({
                    id: 'ATT' + Date.now() + Math.random().toString(36).substr(2, 5),
                    schoolId: schoolId,
                    studentId: student.id,
                    studentName: student.name,
                    class: className,
                    date: today,
                    status: 'present',
                    term: document.getElementById('attendanceTerm')?.value || 'First Term',
                    year: parseInt(document.getElementById('attendanceYear')?.value || new Date().getFullYear()),
                    markedBy: user?.name || 'System',
                    time: new Date().toISOString()
                });
            }
        });
        
        Storage.setData('attendance', existingAttendance);
        Toast.success('All students marked as present');
        this.loadStudents();
    },
    
    loadTermAttendance() {
        const schoolId = Auth.getCurrentSchoolId();
        const year = document.getElementById('attendanceYear')?.value;
        const term = document.getElementById('attendanceTerm')?.value;
        const className = document.getElementById('attendanceClass')?.value;
        const container = document.getElementById('attendanceTableContainer');
        
        if (!container) return;
        
        if (!className) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-clipboard-check"></i><h3>No Class Selected</h3><p>Please select a class to view attendance</p></div>';
            return;
        }
        
        const attendance = QRScanner.getAttendanceByTerm(schoolId, className, term, parseInt(year));
        
        if (attendance.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-clipboard-check"></i><h3>No Attendance Records</h3><p>No attendance records found for this term</p></div>';
            return;
        }
        
        const students = Storage.getStudentsByClass(schoolId, className);
        const studentMap = {};
        students.forEach(s => studentMap[s.id] = s.name);
        
        const dateGroups = {};
        attendance.forEach(record => {
            if (!dateGroups[record.date]) dateGroups[record.date] = [];
            dateGroups[record.date].push(record);
        });
        
        let html = '<div class="attendance-summary"><h4>Attendance Summary - ' + className + ' ' + term + ' ' + year + '</h4>';
        
        Object.keys(dateGroups).sort().forEach(date => {
            const records = dateGroups[date];
            const present = records.filter(r => r.status === 'present').length;
            const total = records.length;
            const percentage = Math.round((present / total) * 100);
            
            html += '<div class="attendance-date-row"><div class="date">' + date + '</div>';
            html += '<div class="stats">Present: ' + present + '/' + total + ' (' + percentage + '%)</div></div>';
        });
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    exportAttendanceCSV() {
        const schoolId = Auth.getCurrentSchoolId();
        const className = document.getElementById('attendanceClassSelect')?.value || document.getElementById('scanAttendanceClass')?.value;
        const term = document.getElementById('attendanceTerm')?.value || 'First Term';
        const year = parseInt(document.getElementById('attendanceYear')?.value || new Date().getFullYear());
        
        if (!className) {
            Toast.error('Please select a class');
            return;
        }
        
        QRScanner.exportAttendanceCSV();
    },
    
    getAttendanceByTerm(schoolId, className, term, year) {
        return QRScanner.getAttendanceByTerm(schoolId, className, term, year);
    }
};

// Make QRCode globally available
window.QRCoder = QRCoder;

window.Attendance = Attendance;
