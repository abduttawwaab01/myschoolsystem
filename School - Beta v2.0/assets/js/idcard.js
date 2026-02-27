// IDCard generation and download options for students and staff
// Uses qrcode.js library for real scannable QR codes

// Wait for qrcode.js to be available
function _waitForQRCode(callback) {
    if (typeof window.QRCode !== 'undefined') {
        callback();
        return;
    }
    
    let attempts = 0;
    const check = () => {
        attempts++;
        if (typeof window.QRCode !== 'undefined') {
            callback();
        } else if (attempts < 30) {
            setTimeout(check, 100);
        } else {
            console.error('qrcode.js failed to load');
            callback();
        }
    };
    check();
}

const IDCard = {
	// Async generation - waits for qrcode.js to be ready
	async generate(studentId, format = 'portrait') {
		const school = Auth.getSchool();
		const schoolColor = school && school.idCardColor ? school.idCardColor : '#16a34a';
		const schoolLogo = school && school.logoUrl ? school.logoUrl : this.getDefaultLogo();
		
		const students = Storage.getData('students');
		const student = students.find(s => s.id === studentId);
		if (!student) return null;
		
		// Wait for qrcode.js to be available
		await this._waitForQRCodeReady();
		
		// Generate QR code
		const qrSize = format === 'portrait' ? 65 : 95;
		let qrUrl = await this._generateStudentQR(student, qrSize);
		
		const passportUrl = student.passportUrl || this.getDefaultPassport();
		
		let html = '';
		
		if (format === 'portrait') {
			html = `
			<div class="idcard idcard-portrait" style="width:260px;height:400px;border:3px solid ${schoolColor};border-radius:12px;padding:0;background:#fff;overflow:hidden;position:relative;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-family:'Segoe UI',Arial,sans-serif;">
				<div style="background:linear-gradient(135deg,${schoolColor},${schoolColor}dd);padding:14px 12px;text-align:center;">
					<img src="${schoolLogo}" alt="Logo" style="width:40px;height:40px;border-radius:50%;margin:0 auto 6px;object-fit:contain;background:#fff;padding:2px;" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0iI2ZmZiI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiAvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZmZmZiIgLz48L3N2Zz4='">
					<h2 style="font-size:14px;color:#fff;margin:0;font-weight:700;">${school ? school.name : 'My School'}</h2>
					<p style="font-size:8px;color:rgba(255,255,255,0.9);margin:2px 0 0;">STUDENT ID CARD</p>
				</div>
				<div style="padding:12px;text-align:center;">
					<img src="${passportUrl}" alt="Passport" style="width:70px;height:75px;border:2px solid ${schoolColor};border-radius:6px;object-fit:cover;margin-bottom:8px;box-shadow:0 2px 6px rgba(0,0,0,0.1);" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzUiIHZpZXdCb3g9IjAgMCA3MCA3NSIgZmlsbD0iI2Y1ZjVmNSI+PHJlY3Qgd2lkdGg9IjcwIiBoZWlnaHQ9Ijc1IiAvPjx0ZXh0IHg9IjM1IiB5PSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSIjOTRhM2I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U3R1ZGVudDwvdGV4dD48L3N2Zz4='">
					<div style="font-size:13px;font-weight:700;margin-bottom:2px;color:#1e293b;">${student.name}</div>
					<div style="font-size:10px;color:#64748b;margin-bottom:1px;">Class: <strong>${student.class}</strong></div>
					<div style="font-size:9px;color:#94a3b8;">ID: ${student.id}</div>
				</div>
				<div style="text-align:center;padding:6px 12px 12px;">
					<img src="${qrUrl}" alt="QR" style="width:65px;height:65px;border:1px solid #e2e8f0;border-radius:4px;padding:2px;background:#fff;" onerror="this.style.display='none'">
				</div>
				<div style="position:absolute;bottom:6px;left:0;right:0;text-align:center;font-size:7px;color:#94a3b8;font-weight:500;">
					My School - Odebunmi Tawwab
				</div>
			</div>`;
		} else {
			html = `
			<div class="idcard idcard-landscape" style="width:400px;height:220px;border:3px solid ${schoolColor};border-radius:12px;padding:0;background:#fff;overflow:hidden;position:relative;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-family:'Segoe UI',Arial,sans-serif;">
				<div style="position:absolute;top:0;left:0;width:95px;height:100%;background:linear-gradient(180deg,${schoolColor},${schoolColor}dd);padding:8px 5px;text-align:center;display:flex;flex-direction:column;justify-content:center;">
					<img src="${schoolLogo}" alt="Logo" style="width:28px;height:28px;border-radius:50%;margin:0 auto 3px;object-fit:contain;background:#fff;padding:2px;" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0iI2ZmZiI+PHJlY3Qgd2lkdGg9IjI4IiBoZWlnaHQ9IjI4IiAvPjwvc3ZnPg=='">
					<h2 style="font-size:9px;color:#fff;margin:0;font-weight:700;">${school ? school.name : 'My School'}</h2>
					<p style="font-size:6px;color:rgba(255,255,255,0.9);margin:2px 0 0;">STUDENT</p>
				</div>
				<div style="margin-left:95px;padding:6px 8px;height:100%;display:flex;align-items:center;gap:3px;">
					<div style="flex:0 0 auto;text-align:center;padding-right:3px;border-right:1px dashed #e2e8f0;">
						<img src="${passportUrl}" alt="Passport" style="width:70px;height:75px;border:2px solid ${schoolColor};border-radius:4px;object-fit:cover;margin-bottom:4px;" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzUiIHZpZXdCb3g9IjAgMCA3MCA3NSIgZmlsbD0iI2Y1ZjVmNSI+PHJlY3Qgd2lkdGg9IjcwIiBoZWlnaHQ9Ijc1IiAvPjx0ZXh0IHg9IjM1IiB5PSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSIjOTRhM2I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U3R1ZGVudDwvdGV4dD48L3N2Zz4='">
						<div style="font-size:13px;font-weight:700;color:#1e293b;">${student.name}</div>
						<div style="font-size:11px;color:#64748b;">Class: <strong>${student.class}</strong></div>
						<div style="font-size:10px;color:#94a3b8;">ID: ${student.id}</div>
					</div>
					<div style="flex:1;display:flex;align-items:center;justify-content:center;">
						<img src="${qrUrl}" alt="QR" style="width:95px;height:95px;border:2px solid ${schoolColor};border-radius:6px;padding:4px;background:#fff;" onerror="this.style.display='none'">
					</div>
				</div>
				<div style="position:absolute;bottom:3px;right:6px;font-size:6px;color:#94a3b8;font-weight:500;">
					My School - Odebunmi Tawwab
				</div>
			</div>`;
		}
		return html;
	},
	
	// Generate backside for student ID card
	generateBack(studentId, format = 'portrait') {
		const school = Auth.getSchool();
		const schoolColor = school && school.idCardColor ? school.idCardColor : '#16a34a';
		const schoolLogo = school && school.logoUrl ? school.logoUrl : this.getDefaultLogo();
		
		const students = Storage.getData('students');
		const student = students.find(s => s.id === studentId);
		if (!student) return null;
		
		const returnMessage = school && school.idCardBackMessage ? school.idCardBackMessage : this.getDefaultReturnMessage();
		const schoolPhone = school?.phone || '';
		const schoolEmail = school?.email || '';
		const schoolAddress = school?.address || '';
		
		let html = '';
		
		if (format === 'portrait') {
			html = `
			<div class="idcard-back idcard-portrait" style="width:260px;height:400px;border:3px solid ${schoolColor};border-radius:12px;padding:0;background:#fff;overflow:hidden;position:relative;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-family:'Segoe UI',Arial,sans-serif;">
				<div style="background:linear-gradient(135deg,${schoolColor},${schoolColor}dd);padding:12px;text-align:center;">
					<img src="${schoolLogo}" alt="Logo" style="width:35px;height:35px;border-radius:50%;margin:0 auto 4px;object-fit:contain;background:#fff;padding:2px;" onerror="this.style.display='none'">
					<h2 style="font-size:13px;color:#fff;margin:0;font-weight:700;">${school ? school.name : 'My School'}</h2>
					<p style="font-size:7px;color:rgba(255,255,255,0.9);margin:2px 0 0;">ID CARD</p>
				</div>
				<div style="padding:15px 12px;text-align:center;">
					<div style="background:#fef3c7;border:2px dashed #f59e0b;border-radius:10px;padding:12px 8px;margin-bottom:12px;">
						<p style="font-size:11px;font-weight:700;color:#92400e;margin:0 0 4px;text-transform:uppercase;"><i class="fas fa-hand-holding-heart"></i> If Found, Please Return</p>
						<p style="font-size:9px;color:#b45309;margin:0;line-height:1.4;">${returnMessage}</p>
					</div>
					<div style="text-align:left;margin-top:10px;">
						<p style="font-size:9px;color:#64748b;margin:0 0 3px;"><strong>Contact:</strong></p>
						${schoolPhone ? `<p style="font-size:8px;color:#374151;margin:0 0 2px;"><i class="fas fa-phone"></i> ${schoolPhone}</p>` : ''}
						${schoolEmail ? `<p style="font-size:8px;color:#374151;margin:0 0 2px;"><i class="fas fa-envelope"></i> ${schoolEmail}</p>` : ''}
						${schoolAddress ? `<p style="font-size:8px;color:#374151;margin:0 0 2px;"><i class="fas fa-map-marker-alt"></i> ${schoolAddress}</p>` : ''}
					</div>
					<div style="margin-top:15px;padding-top:10px;border-top:1px dashed #e2e8f0;">
						<p style="font-size:7px;color:#94a3b8;margin:0;">Student: <strong>${student.name}</strong> | Class: <strong>${student.class}</strong></p>
					</div>
				</div>
				<div style="position:absolute;bottom:6px;left:0;right:0;text-align:center;font-size:6px;color:#94a3b8;">
					Card ID: ${student.id}
				</div>
			</div>`;
		} else {
			html = `
			<div class="idcard-back idcard-landscape" style="width:400px;height:220px;border:3px solid ${schoolColor};border-radius:12px;padding:0;background:#fff;overflow:hidden;position:relative;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-family:'Segoe UI',Arial,sans-serif;">
				<div style="position:absolute;top:0;left:0;width:130px;height:100%;background:linear-gradient(180deg,${schoolColor},${schoolColor}dd);padding:10px;text-align:center;display:flex;flex-direction:column;justify-content:center;">
					<img src="${schoolLogo}" alt="Logo" style="width:30px;height:30px;border-radius:50%;margin:0 auto 5px;object-fit:contain;background:#fff;padding:2px;" onerror="this.style.display='none'">
					<h2 style="font-size:10px;color:#fff;margin:0;font-weight:700;">${school ? school.name : 'My School'}</h2>
					<p style="font-size:6px;color:rgba(255,255,255,0.9);margin:2px 0 0;">ID CARD</p>
				</div>
				<div style="margin-left:130px;padding:10px;height:100%;display:flex;align-items:center;gap:10px;">
					<div style="flex:1;background:#fef3c7;border:2px dashed #f59e0b;border-radius:8px;padding:10px;">
						<p style="font-size:10px;font-weight:700;color:#92400e;margin:0 0 4px;text-transform:uppercase;"><i class="fas fa-hand-holding-heart"></i> If Found, Please Return</p>
						<p style="font-size:8px;color:#b45309;margin:0;line-height:1.3;">${returnMessage}</p>
					</div>
					<div style="flex:0 0 auto;max-width:140px;font-size:7px;color:#64748b;text-align:left;">
						${schoolPhone ? `<p style="margin:0 0 2px;"><i class="fas fa-phone"></i> ${schoolPhone}</p>` : ''}
						${schoolEmail ? `<p style="margin:0 0 2px;"><i class="fas fa-envelope"></i> ${schoolEmail}</p>` : ''}
						${schoolAddress ? `<p style="margin:0 0 2px;"><i class="fas fa-map-marker-alt"></i> ${schoolAddress}</p>` : ''}
						<p style="margin:5px 0 0;font-size:6px;color:#94a3b8;">${student.name} | ${student.class}</p>
					</div>
				</div>
			</div>`;
		}
		return html;
	},
	
	// Generate backside for staff ID card
	generateStaffBack(userId, format = 'portrait') {
		const school = Auth.getSchool();
		const schoolColor = school && school.idCardColor ? school.idCardColor : '#2563eb';
		const schoolLogo = school && school.logoUrl ? school.logoUrl : this.getDefaultLogo();
		
		const users = Storage.getData('users');
		const user = users.find(u => u.id === userId);
		if (!user) return null;
		
		const returnMessage = school && school.idCardBackMessage ? school.idCardBackMessage : this.getDefaultReturnMessage();
		const schoolPhone = school?.phone || '';
		const schoolEmail = school?.email || '';
		const schoolAddress = school?.address || '';
		
		const roleLabels = {
			teacher: 'TEACHER',
			accountant: 'ACCOUNTANT',
			director: 'DIRECTOR',
			school_admin: 'SCHOOL ADMIN'
		};
		const roleLabel = roleLabels[user.role] || 'STAFF';
		
		let html = '';
		
		if (format === 'portrait') {
			html = `
			<div class="idcard-back idcard-portrait" style="width:260px;height:400px;border:3px solid ${schoolColor};border-radius:12px;padding:0;background:#fff;overflow:hidden;position:relative;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-family:'Segoe UI',Arial,sans-serif;">
				<div style="background:linear-gradient(135deg,${schoolColor},${schoolColor}dd);padding:12px;text-align:center;">
					<img src="${schoolLogo}" alt="Logo" style="width:35px;height:35px;border-radius:50%;margin:0 auto 4px;object-fit:contain;background:#fff;padding:2px;" onerror="this.style.display='none'">
					<h2 style="font-size:13px;color:#fff;margin:0;font-weight:700;">${school ? school.name : 'My School'}</h2>
					<p style="font-size:7px;color:rgba(255,255,255,0.9);margin:2px 0 0;">ID CARD</p>
				</div>
				<div style="padding:15px 12px;text-align:center;">
					<div style="background:#fef3c7;border:2px dashed #f59e0b;border-radius:10px;padding:12px 8px;margin-bottom:12px;">
						<p style="font-size:11px;font-weight:700;color:#92400e;margin:0 0 4px;text-transform:uppercase;"><i class="fas fa-hand-holding-heart"></i> If Found, Please Return</p>
						<p style="font-size:9px;color:#b45309;margin:0;line-height:1.4;">${returnMessage}</p>
					</div>
					<div style="text-align:left;margin-top:10px;">
						<p style="font-size:9px;color:#64748b;margin:0 0 3px;"><strong>Contact:</strong></p>
						${schoolPhone ? `<p style="font-size:8px;color:#374151;margin:0 0 2px;"><i class="fas fa-phone"></i> ${schoolPhone}</p>` : ''}
						${schoolEmail ? `<p style="font-size:8px;color:#374151;margin:0 0 2px;"><i class="fas fa-envelope"></i> ${schoolEmail}</p>` : ''}
						${schoolAddress ? `<p style="font-size:8px;color:#374151;margin:0 0 2px;"><i class="fas fa-map-marker-alt"></i> ${schoolAddress}</p>` : ''}
					</div>
					<div style="margin-top:15px;padding-top:10px;border-top:1px dashed #e2e8f0;">
						<p style="font-size:7px;color:#94a3b8;margin:0;">Staff: <strong>${user.name}</strong> | ${roleLabel}</p>
					</div>
				</div>
				<div style="position:absolute;bottom:6px;left:0;right:0;text-align:center;font-size:6px;color:#94a3b8;">
					Card ID: ${user.id.substring(0, 12)}
				</div>
			</div>`;
		} else {
			html = `
			<div class="idcard-back idcard-landscape" style="width:400px;height:220px;border:3px solid ${schoolColor};border-radius:12px;padding:0;background:#fff;overflow:hidden;position:relative;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-family:'Segoe UI',Arial,sans-serif;">
				<div style="position:absolute;top:0;left:0;width:130px;height:100%;background:linear-gradient(180deg,${schoolColor},${schoolColor}dd);padding:10px;text-align:center;display:flex;flex-direction:column;justify-content:center;">
					<img src="${schoolLogo}" alt="Logo" style="width:30px;height:30px;border-radius:50%;margin:0 auto 5px;object-fit:contain;background:#fff;padding:2px;" onerror="this.style.display='none'">
					<h2 style="font-size:10px;color:#fff;margin:0;font-weight:700;">${school ? school.name : 'My School'}</h2>
					<p style="font-size:6px;color:rgba(255,255,255,0.9);margin:2px 0 0;">ID CARD</p>
				</div>
				<div style="margin-left:130px;padding:10px;height:100%;display:flex;align-items:center;gap:10px;">
					<div style="flex:1;background:#fef3c7;border:2px dashed #f59e0b;border-radius:8px;padding:10px;">
						<p style="font-size:10px;font-weight:700;color:#92400e;margin:0 0 4px;text-transform:uppercase;"><i class="fas fa-hand-holding-heart"></i> If Found, Please Return</p>
						<p style="font-size:8px;color:#b45309;margin:0;line-height:1.3;">${returnMessage}</p>
					</div>
					<div style="flex:0 0 auto;max-width:140px;font-size:7px;color:#64748b;text-align:left;">
						${schoolPhone ? `<p style="margin:0 0 2px;"><i class="fas fa-phone"></i> ${schoolPhone}</p>` : ''}
						${schoolEmail ? `<p style="margin:0 0 2px;"><i class="fas fa-envelope"></i> ${schoolEmail}</p>` : ''}
						${schoolAddress ? `<p style="margin:0 0 2px;"><i class="fas fa-map-marker-alt"></i> ${schoolAddress}</p>` : ''}
						<p style="margin:5px 0 0;font-size:6px;color:#94a3b8;">${user.name} | ${roleLabel}</p>
					</div>
				</div>
			</div>`;
		}
		return html;
	},
	
	getDefaultReturnMessage() {
		return 'This card is the property of the school. If found, please return to the school office or nearest police station. Your cooperation is highly appreciated.';
	},
	
	// Wait for qrcode.js to be ready (async)
	_waitForQRCodeReady() {
		return new Promise((resolve) => {
			if (typeof window.QRCode !== 'undefined') {
				resolve();
				return;
			}
			
			let attempts = 0;
			const check = () => {
				attempts++;
				if (typeof window.QRCode !== 'undefined') {
					resolve();
				} else if (attempts < 30) {
					setTimeout(check, 100);
				} else {
					console.error('qrcode.js failed to load');
					resolve();
				}
			};
			check();
		});
	},
	
	// Generate student QR code using qrcode.js
	_generateStudentQR(student, size) {
		return new Promise((resolve) => {
			const qrData = `STU|${student.id}|${student.name || 'Unknown'}|${student.class || ''}|${student.schoolId || ''}`;
			
			const container = document.createElement('div');
			container.style.position = 'absolute';
			container.style.left = '-9999px';
			container.style.top = '0';
			document.body.appendChild(container);
			
			try {
				// qrcode.js creates canvas/img directly in container
				const qr = new QRCode(container, {
					text: qrData,
					width: size,
					height: size,
					colorDark: '#000000',
					colorLight: '#ffffff',
					correctLevel: QRCode.CorrectLevel.M
				});
				
				// Wait for QR code to be generated
				setTimeout(() => {
					const canvas = container.querySelector('canvas');
					const img = container.querySelector('img');
					
					let qrUrl = null;
					if (canvas) {
						qrUrl = canvas.toDataURL('image/png');
					} else if (img && img.src) {
						qrUrl = img.src;
					}
					
					document.body.removeChild(container);
					resolve(qrUrl);
				}, 100);
			} catch (e) {
				console.error('QRCode.js error:', e);
				document.body.removeChild(container);
				resolve(null);
			}
		});
	},
	
	// Generate user QR code using qrcode.js
	_generateUserQR(user, size) {
		return new Promise((resolve) => {
			const qrData = `USR|${user.id}|${user.name || 'Unknown'}|${user.role || ''}|${user.schoolId || ''}`;
			
			const container = document.createElement('div');
			container.style.position = 'absolute';
			container.style.left = '-9999px';
			container.style.top = '0';
			document.body.appendChild(container);
			
			try {
				// qrcode.js creates canvas/img directly in container
				const qr = new QRCode(container, {
					text: qrData,
					width: size,
					height: size,
					colorDark: '#000000',
					colorLight: '#ffffff',
					correctLevel: QRCode.CorrectLevel.M
				});
				
				setTimeout(() => {
					const canvas = container.querySelector('canvas');
					const img = container.querySelector('img');
					
					let qrUrl = null;
					if (canvas) {
						qrUrl = canvas.toDataURL('image/png');
					} else if (img && img.src) {
						qrUrl = img.src;
					}
					
					document.body.removeChild(container);
					resolve(qrUrl);
				}, 100);
			} catch (e) {
				console.error('QRCode.js error:', e);
				document.body.removeChild(container);
				resolve(null);
			}
		});
	},
	
	hashCode(str) {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = ((hash << 5) - hash) + str.charCodeAt(i);
			hash = hash & hash;
		}
		return Math.abs(hash);
	},

	async generateStaff(userId, format = 'portrait') {
		const school = Auth.getSchool();
		const schoolColor = school && school.idCardColor ? school.idCardColor : '#2563eb';
		const schoolLogo = school && school.logoUrl ? school.logoUrl : this.getDefaultLogo();
		
		const users = Storage.getData('users');
		const user = users.find(u => u.id === userId);
		if (!user) return null;
		
		// Wait for qrcode.js to be ready
		await this._waitForQRCodeReady();
		
		// Generate QR code
		const qrSize = format === 'portrait' ? 65 : 95;
		let qrUrl = await this._generateUserQR(user, qrSize);
		
		const passportUrl = user.passportUrl || this.getDefaultPassport();
		
		const roleLabels = {
			teacher: 'TEACHER',
			accountant: 'ACCOUNTANT',
			director: 'DIRECTOR',
			school_admin: 'SCHOOL ADMIN'
		};
		
		const roleLabel = roleLabels[user.role] || 'STAFF';
		
		let html = '';
		
		if (format === 'portrait') {
			html = `
			<div class="idcard idcard-portrait" style="width:260px;height:400px;border:3px solid ${schoolColor};border-radius:12px;padding:0;background:#fff;overflow:hidden;position:relative;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-family:'Segoe UI',Arial,sans-serif;">
				<div style="background:linear-gradient(135deg,${schoolColor},${schoolColor}dd);padding:14px 12px;text-align:center;">
					<img src="${schoolLogo}" alt="Logo" style="width:40px;height:40px;border-radius:50%;margin:0 auto 6px;object-fit:contain;background:#fff;padding:2px;" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0iI2ZmZiI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiAvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZmZmZiIgLz48L3N2Zz4='">
					<h2 style="font-size:14px;color:#fff;margin:0;font-weight:700;">${school ? school.name : 'My School'}</h2>
					<p style="font-size:8px;color:rgba(255,255,255,0.9);margin:2px 0 0;">${roleLabel} ID CARD</p>
				</div>
				<div style="padding:12px;text-align:center;">
					<img src="${passportUrl}" alt="Passport" style="width:70px;height:75px;border:2px solid ${schoolColor};border-radius:6px;object-fit:cover;margin-bottom:8px;box-shadow:0 2px 6px rgba(0,0,0,0.1);" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzUiIHZpZXdCb3g9IjAgMCA3MCA3NSIgZmlsbD0iI2Y1ZjVmNSI+PHJlY3Qgd2lkdGg9IjcwIiBoZWlnaHQ9Ijc1IiAvPjx0ZXh0IHg9IjM1IiB5PSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSIjOTRhM2I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U3R1ZGVudDwvdGV4dD48L3N2Zz4='">
					<div style="font-size:13px;font-weight:700;margin-bottom:2px;color:#1e293b;">${user.name}</div>
					<div style="font-size:10px;color:#64748b;margin-bottom:1px;">Role: <strong>${roleLabel}</strong></div>
					<div style="font-size:9px;color:#94a3b8;">ID: ${user.id.substring(0, 12)}</div>
				</div>
				<div style="text-align:center;padding:6px 12px 12px;">
					<img src="${qrUrl}" alt="QR" style="width:65px;height:65px;border:1px solid #e2e8f0;border-radius:4px;padding:2px;background:#fff;" onerror="this.style.display='none'">
				</div>
				<div style="position:absolute;bottom:6px;left:0;right:0;text-align:center;font-size:7px;color:#94a3b8;font-weight:500;">
					My School - Odebunmi Tawwab
				</div>
			</div>`;
		} else {
			html = `
			<div class="idcard idcard-landscape" style="width:400px;height:220px;border:3px solid ${schoolColor};border-radius:12px;padding:0;background:#fff;overflow:hidden;position:relative;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-family:'Segoe UI',Arial,sans-serif;">
				<div style="position:absolute;top:0;left:0;width:95px;height:100%;background:linear-gradient(180deg,${schoolColor},${schoolColor}dd);padding:8px 5px;text-align:center;display:flex;flex-direction:column;justify-content:center;">
					<img src="${schoolLogo}" alt="Logo" style="width:28px;height:28px;border-radius:50%;margin:0 auto 3px;object-fit:contain;background:#fff;padding:2px;" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0iI2ZmZiI+PHJlY3Qgd2lkdGg9IjI4IiBoZWlnaHQ9IjI4IiAvPjwvc3ZnPg=='">
					<h2 style="font-size:9px;color:#fff;margin:0;font-weight:700;">${school ? school.name : 'My School'}</h2>
					<p style="font-size:6px;color:rgba(255,255,255,0.9);margin:2px 0 0;">${roleLabel}</p>
				</div>
				<div style="margin-left:95px;padding:6px 8px;height:100%;display:flex;align-items:center;gap:3px;">
					<div style="flex:0 0 auto;text-align:center;padding-right:3px;border-right:1px dashed #e2e8f0;">
						<img src="${passportUrl}" alt="Passport" style="width:70px;height:75px;border:2px solid ${schoolColor};border-radius:4px;object-fit:cover;margin-bottom:4px;" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzUiIHZpZXdCb3g9IjAgMCA3MCA3NSIgZmlsbD0iI2Y1ZjVmNSI+PHJlY3Qgd2lkdGg9IjcwIiBoZWlnaHQ9Ijc1IiAvPjx0ZXh0IHg9IjM1IiB5PSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSIjOTRhM2I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U3R1ZGVudDwvdGV4dD48L3N2Zz4='">
						<div style="font-size:13px;font-weight:700;color:#1e293b;">${user.name}</div>
						<div style="font-size:11px;color:#64748b;">Role: <strong>${roleLabel}</strong></div>
						<div style="font-size:10px;color:#94a3b8;">ID: ${user.id.substring(0, 12)}</div>
					</div>
					<div style="flex:1;display:flex;align-items:center;justify-content:center;">
						<img src="${qrUrl}" alt="QR" style="width:95px;height:95px;border:2px solid ${schoolColor};border-radius:6px;padding:4px;background:#fff;" onerror="this.style.display='none'">
					</div>
				</div>
				<div style="position:absolute;bottom:3px;right:6px;font-size:6px;color:#94a3b8;font-weight:500;">
					My School - Odebunmi Tawwab
				</div>
			</div>`;
		}
		return html;
	},
	
	// Legacy method - use qrcode.js now
	_generateUserQRSync(user, size) {
		return this._generateUserQR(user, size);
	},
	
	// Force generate QR user - legacy method
	async forceGenerateQRUser(userId, size) {
		const users = Storage.getData('users') || [];
		const user = users.find(u => u.id === userId);
		if (!user) return null;
		return await this._generateUserQR(user, size);
	},

	getDefaultPassport() {
		return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="#e2e8f0" width="100" height="100"/><circle fill="#94a3b8" cx="50" cy="35" r="20"/><path fill="#94a3b8" d="M50 60c-20 0-35 15-35 35v5h70v-5c0-20-15-35-35-35z"/></svg>');
	},

	getSchoolLogo() {
		const school = Auth.getSchool();
		return school && school.logoUrl ? school.logoUrl : this.getDefaultLogo();
	},

	getDefaultLogo() {
		return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="#16a34a"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>');
	},

	getSchoolColor() {
		const school = Auth.getSchool();
		return school && school.idCardColor ? school.idCardColor : '#16a34a';
	},

	async preview(studentId, format = 'portrait') {
		const html = await this.generate(studentId, format);
		const container = document.getElementById('idCardPreview');
		if (container) container.innerHTML = html;
	},

	async previewStaff(userId, format = 'portrait') {
		const html = await this.generateStaff(userId, format);
		const container = document.getElementById('idCardPreview');
		if (container) container.innerHTML = html;
	},

	download(studentId, format = 'portrait', type = 'png') {
		return this._downloadCard(() => this.generate(studentId, format), `idcard_${studentId}_${format}`, 'Student', type, format);
	},

	downloadStaff(userId, format = 'portrait', type = 'png') {
		return this._downloadCard(() => this.generateStaff(userId, format), `staff_idcard_${userId}_${format}`, 'Staff', type, format);
	},

	async _downloadCard(generateFn, filename, label, type, format) {
		Loading.show();
		try {
			const html = await generateFn();
			
			// Create a clean container for rendering
			const container = document.createElement('div');
			container.style.position = 'fixed';
			container.style.left = '-9999px';
			container.style.top = '0';
			container.style.background = '#ffffff';
			container.style.padding = '10px';
			container.innerHTML = html;
			document.body.appendChild(container);
			
			// Get the actual element (not text nodes)
			let card = container.firstElementChild;
			if (!card) {
				// Fallback: find the first element child
				for (let i = 0; i < container.childNodes.length; i++) {
					if (container.childNodes[i].nodeType === 1) {
						card = container.childNodes[i];
						break;
					}
				}
			}
			
			if (!card || card.nodeType !== 1) {
				throw new Error('Could not find card element');
			}
			
			// Wait for all images to load
			const images = card.querySelectorAll('img');
			const imagePromises = Array.from(images).map(img => {
				if (img.complete) return Promise.resolve();
				return new Promise(resolve => {
					img.onload = resolve;
					img.onerror = resolve;
				});
			});
			await Promise.all(imagePromises);
			
			// Small delay to ensure rendering is complete
			await new Promise(resolve => setTimeout(resolve, 100));
			
			if (!window.html2canvas) {
				Toast.error('html2canvas library not loaded');
				document.body.removeChild(container);
				Loading.hide();
				return;
			}

			// Use html2canvas with proper options
			const canvas = await window.html2canvas(card, {
				scale: 2,
				backgroundColor: '#ffffff',
				logging: false,
				useCORS: true,
				allowTaint: true,
				imageTimeout: 0
			});

			if (type === 'png') {
				const link = document.createElement('a');
				link.download = `${filename}.png`;
				link.href = canvas.toDataURL('image/png');
				link.click();
				Toast.success(`${label} ID Card saved as PNG`);
			} else if (type === 'pdf') {
				if (!window.jspdf) {
					Toast.error('jsPDF library not loaded');
					document.body.removeChild(container);
					Loading.hide();
					return;
				}
				const { jsPDF } = window.jspdf;
				const imgData = canvas.toDataURL('image/png');
				const pdf = new jsPDF({
					orientation: format === 'landscape' ? 'landscape' : 'portrait',
					unit: 'px',
					format: [canvas.width, canvas.height]
				});
				pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
				pdf.save(`${filename}.pdf`);
				Toast.success(`${label} ID Card saved as PDF`);
			}
			
			document.body.removeChild(container);
		} catch (e) {
			console.error('Download error:', e);
			Toast.error('Error downloading ID card: ' + e.message);
			// Try fallback method
			this._downloadCardFallback(generateFn, filename, label, type, format);
		}
		Loading.hide();
	},

	async _downloadCardFallback(generateFn, filename, label, type, format) {
		try {
			const html = await generateFn();
			
			// Create print-friendly version
			const printWindow = window.open('', '_blank');
			printWindow.document.write(`
				<!DOCTYPE html>
				<html>
				<head>
					<title>${label} ID Card</title>
					<style>
						body { margin: 0; padding: 20px; display: flex; justify-content: center; }
						@media print { body { margin: 0; padding: 0; } }
					</style>
				</head>
				<body>${html}</body>
				</html>
			`);
			printWindow.document.close();
			printWindow.focus();
			setTimeout(() => {
				printWindow.print();
			}, 500);
			Toast.success(`${label} ID Card opened for printing/saving`);
		} catch (e) {
			console.error('Fallback download error:', e);
			Toast.error('Could not generate ID card');
		}
	},
	
	downloadBack(studentId, format = 'portrait', type = 'png') {
		return this._downloadCard(() => this.generateBack(studentId, format), `idcard_back_${studentId}_${format}`, 'Student Back', type, format);
	},
	
	downloadStaffBack(userId, format = 'portrait', type = 'png') {
		return this._downloadCard(() => this.generateStaffBack(userId, format), `staff_idcard_back_${userId}_${format}`, 'Staff Back', type, format);
	},
	
	downloadBoth(studentId, format = 'portrait', type = 'png', layout = 'side') {
		return this._downloadBothCards(
			() => this.generate(studentId, format),
			() => this.generateBack(studentId, format),
			`idcard_both_${studentId}_${format}`,
			'Student',
			type,
			format,
			layout
		);
	},
	
	downloadStaffBoth(userId, format = 'portrait', type = 'png', layout = 'side') {
		return this._downloadBothCards(
			() => this.generateStaff(userId, format),
			() => this.generateStaffBack(userId, format),
			`staff_idcard_both_${userId}_${format}`,
			'Staff',
			type,
			format,
			layout
		);
	},
	
	async _downloadBothCards(frontFn, backFn, filename, label, type, format, layout) {
		Loading.show();
		try {
			const frontHtml = await frontFn();
			const backHtml = await backFn();
			
			const container = document.createElement('div');
			container.style.position = 'fixed';
			container.style.left = '-9999px';
			container.style.top = '0';
			container.style.background = '#ffffff';
			container.style.padding = '10px';
			
			if (layout === 'side') {
				container.innerHTML = `<div style="display:flex;gap:10px;">${frontHtml}${backHtml}</div>`;
			} else if (layout === 'stack') {
				container.innerHTML = `<div style="display:flex;flex-direction:column;gap:10px;">${frontHtml}${backHtml}</div>`;
			} else {
				container.innerHTML = frontHtml;
			}
			
			document.body.appendChild(container);
			
			const images = container.querySelectorAll('img');
			await Promise.all(Array.from(images).map(img => {
				if (img.complete) return Promise.resolve();
				return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
			}));
			await new Promise(resolve => setTimeout(resolve, 100));
			
			if (!window.html2canvas) {
				Toast.error('html2canvas library not loaded');
				document.body.removeChild(container);
				Loading.hide();
				return;
			}
			
			if (type === 'pdf' && layout === 'pdf') {
				const { jsPDF } = window.jspdf;
				const pdf = new jsPDF({
					orientation: format === 'landscape' ? 'landscape' : 'portrait',
					unit: 'px',
					format: [400, 600]
				});
				
				const frontCanvas = await window.html2canvas(container.querySelector('.idcard'), {
					scale: 2, backgroundColor: '#ffffff'
				});
				
				container.innerHTML = backHtml;
				await new Promise(r => setTimeout(r, 50));
				const backImages = container.querySelectorAll('img');
				await Promise.all(Array.from(backImages).map(img => {
					if (img.complete) return Promise.resolve();
					return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
				}));
				
				const backCanvas = await window.html2canvas(container.querySelector('.idcard, .idcard-back'), {
					scale: 2, backgroundColor: '#ffffff'
				});
				
				pdf.addImage(frontCanvas.toDataURL('image/png'), 'PNG', 0, 0, 400, 600);
				pdf.addPage();
				pdf.addImage(backCanvas.toDataURL('image/png'), 'PNG', 0, 0, 400, 600);
				pdf.save(`${filename}.pdf`);
				Toast.success(`${label} ID Card (both sides) saved as PDF`);
			} else {
				const canvas = await window.html2canvas(container, {
					scale: 2,
					backgroundColor: '#ffffff',
					logging: false
				});
				
				const link = document.createElement('a');
				link.download = `${filename}.png`;
				link.href = canvas.toDataURL('image/png');
				link.click();
				Toast.success(`${label} ID Card (both sides) saved as PNG`);
			}
			
			document.body.removeChild(container);
		} catch (e) {
			console.error('Download both error:', e);
			Toast.error('Error downloading ID card: ' + e.message);
		}
		Loading.hide();
	}
};

window.IDCard = IDCard;
