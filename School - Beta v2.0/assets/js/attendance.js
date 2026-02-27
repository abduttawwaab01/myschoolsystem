// QRious Library - QR Code Generator
(function(global) {
    'use strict';
    
    var QRious = function(options) {
        options = options || {};
        
        this.value = options.value || '';
        this.size = options.size || 200;
        this.level = options.level || 'L';
        this.minVersion = options.minVersion || 1;
        this.maxVersion = options.maxVersion || 40;
        this.background = options.background || 'white';
        this.foreground = options.foreground || 'black';
        this.padding = options.padding || 0;
        
        this._canvas = document.createElement('canvas');
        this._canvas.width = this.size;
        this._canvas.height = this.size;
        this._canvas.className = 'qrcode';
    };
    
    QRious.prototype.toDataURL = function() {
        return this._canvas.toDataURL('image/png');
    };
    
    QRious.prototype._draw = function() {
        var canvas = this._canvas;
        var ctx = canvas.getContext('2d');
        var size = this.size;
        var padding = this.padding;
        
        ctx.fillStyle = this.background;
        ctx.fillRect(0, 0, size, size);
        
        ctx.fillStyle = this.foreground;
        
        var data = this._generateQR();
        var moduleCount = data.length;
        var moduleSize = (size - 2 * padding) / moduleCount;
        
        for (var row = 0; row < moduleCount; row++) {
            for (var col = 0; col < moduleCount; col++) {
                if (data[row][col]) {
                    var x = padding + col * moduleSize;
                    var y = padding + row * moduleSize;
                    ctx.fillRect(x, y, moduleSize, moduleSize);
                }
            }
        }
    };
    
    QRious.prototype._generateQR = function() {
        var value = this.value;
        var level = this.level;
        var version = this._getBestVersion(value, level);
        
        var typeNumber = version;
        var errorCorrectionLevel = { 'L': 1, 'M': 0, 'Q': 3, 'H': 2 }[level];
        
        var data = this._encodeData(value, typeNumber, errorCorrectionLevel);
        var modules = this._createEmptyModule(typeNumber);
        
        this._setupPositionProbe(modules, 0, 0, typeNumber);
        this._setupPositionProbe(modules, modules.length - 7, 0, typeNumber);
        this._setupPositionProbe(modules, 0, modules.length - 7, typeNumber);
        
        this._setupPositionAdjust(modules, typeNumber);
        this._setupTiming(modules);
        
        this._setupTypeInfo(modules, data, errorCorrectionLevel);
        
        if (typeNumber >= 7) {
            this._setupVersion(modules, typeNumber);
        }
        
        this._mapData(modules, data);
        
        return modules;
    };
    
    QRious.prototype._encodeData = function(data, typeNumber, errorCorrectionLevel) {
        var bytes = [];
        for (var i = 0; i < data.length; i++) {
            bytes.push(data.charCodeAt(i));
        }
        
        var totalCodeCount = [26, 44, 70, 100, 134, 172, 196, 242, 292, 346, 404, 466, 532, 581, 655, 733, 815, 901, 991, 1085, 1156, 1258, 1370, 1452, 1538, 1628, 1722, 1809, 1911, 1989, 2099, 2213, 2331];
        var ecCodeCount = [[7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30], [10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28], [15, 26, 18, 26, 24, 18, 18, 22, 22, 26, 30, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 30, 30, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28], [20, 18, 26, 18, 24, 26, 28, 24, 28, 30, 30, 28, 26, 26, 28, 28, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]];
        
        var totalCount = totalCodeCount[typeNumber - 1] || 100;
        var ecCount = ecCodeCount[errorCorrectionLevel][typeNumber - 1] || 10;
        
        var dataCodeCount = totalCount - ecCount;
        
        var dataBytes = bytes.slice(0, dataCodeCount);
        
        return {
            data: dataBytes,
            totalCount: totalCount,
            dataCount: dataCodeCount,
            ecCount: ecCount
        };
    };
    
    QRious.prototype._createEmptyModule = function(typeNumber) {
        var moduleCount = typeNumber * 4 + 17;
        var modules = [];
        for (var i = 0; i < moduleCount; i++) {
            modules[i] = [];
            for (var j = 0; j < moduleCount; j++) {
                modules[i][j] = null;
            }
        }
        return modules;
    };
    
    QRious.prototype._setupPositionProbe = function(modules, row, col, typeNumber) {
        for (var i = -1; i <= 7; i++) {
            for (var j = -1; j <= 7; j++) {
                var r = row + i;
                var c = col + j;
                if (r < 0 || r >= modules.length || c < 0 || c >= modules.length) continue;
                
                if ((0 <= i && i <= 6 && (j === 0 || j === 6)) ||
                    (0 <= j && j <= 6 && (i === 0 || i === 6)) ||
                    (2 <= i && i <= 4 && 2 <= j && j <= 4)) {
                    modules[r][c] = true;
                } else {
                    modules[r][c] = false;
                }
            }
        }
    };
    
    QRious.prototype._setupPositionAdjust = function(modules, typeNumber) {
        var patterns = {
            2: [[6, 18]],
            3: [[6, 22]],
            4: [[6, 26]],
            5: [[6, 30]],
            6: [[6, 34]],
            7: [[6, 22, 38]],
            8: [[6, 24, 42]],
            9: [[6, 26, 46]],
            10: [[6, 28, 50]],
            11: [[6, 30, 54]],
            12: [[6, 32, 58]],
            13: [[6, 34, 62]],
            14: [[6, 26, 46, 66]],
            15: [[6, 26, 48, 70]],
            16: [[6, 26, 50, 74]],
            17: [[6, 30, 54, 78]],
            18: [[6, 30, 56, 82]],
            19: [[6, 30, 58, 86]],
            20: [[6, 34, 62, 90]],
            21: [[6, 28, 50, 72, 94]],
            22: [[6, 26, 50, 74, 98]],
            23: [[6, 30, 54, 78, 102]],
            24: [[6, 28, 54, 80, 106]],
            25: [[6, 32, 58, 84, 110]],
            26: [[6, 30, 58, 86, 114]],
            27: [[6, 34, 62, 90, 118]],
            28: [[6, 26, 50, 74, 98, 122]],
            29: [[6, 30, 54, 78, 102, 126]],
            30: [[6, 26, 52, 78, 104, 130]],
            31: [[6, 30, 56, 82, 108, 134]],
            32: [[6, 34, 60, 86, 112, 138]],
            33: [[6, 30, 58, 86, 114, 142]],
            34: [[6, 34, 62, 90, 118, 146]],
            35: [[6, 30, 54, 78, 102, 126, 150]],
            36: [[6, 24, 50, 76, 102, 128, 154]],
            37: [[6, 28, 54, 80, 106, 132, 158]],
            38: [[6, 32, 58, 84, 110, 136, 162]],
            39: [[6, 26, 54, 82, 110, 138, 166]],
            40: [[6, 30, 58, 86, 114, 142, 170]]
        };
        
        var pattern = patterns[typeNumber];
        if (!pattern) return;
        
        pattern.forEach(function(pos) {
            pos.forEach(function(p) {
                for (var i = -2; i <= 2; i++) {
                    for (var j = -2; j <= 2; j++) {
                        var r = p + i;
                        var c = p + j;
                        if (r < 0 || r >= modules.length || c < 0 || c >= modules.length) continue;
                        modules[r][c] = (Math.abs(i) === 2 || Math.abs(j) === 2 || (i === 0 && j === 0));
                    }
                }
            });
        });
    };
    
    QRious.prototype._setupTiming = function(modules) {
        for (var i = 8; i < modules.length - 8; i++) {
            modules[i][6] = (i % 2 === 0);
            modules[6][i] = (i % 2 === 0);
        }
    };
    
    QRious.prototype._setupTypeInfo = function(modules, data, errorCorrectionLevel) {
        var typeInfo = (errorCorrectionLevel << 3) | 0;
        var bits = this._getBCHTypeInfo(typeInfo);
        
        for (var i = 0; i < 15; i++) {
            var bit = ((bits >> i) & 1) === 1;
            var r = i < 6 ? i : i + 1;
            var c = 8;
            modules[r][c] = bit;
            c = modules.length - 1 - (i < 8 ? i : i - 1);
            modules[8][c] = bit;
        }
        
        modules[modules.length - 8][8] = true;
    };
    
    QRious.prototype._setupVersion = function(modules, typeNumber) {
        var version = typeNumber;
        var bits = this._getBCHVersion(version);
        
        for (var i = 0; i < 18; i++) {
            var bit = ((bits >> i) & 1) === 1;
            var r = Math.floor(i / 3);
            var c = i % 3 + modules.length - 8 - 3;
            modules[r][c] = bit;
            modules[c][r] = bit;
        }
    };
    
    QRious.prototype._getBCHTypeInfo = function(data) {
        var d = data << 10;
        while (this._getBCHDigit(d) - this._getBCHDigit(0x537) >= 0) {
            d ^= (0x537 << (this._getBCHDigit(d) - this._getBCHDigit(0x537)));
        }
        return ((data << 10) | d) ^ 0x5412;
    };
    
    QRious.prototype._getBCHVersion = function(data) {
        var d = data << 12;
        while (this._getBCHDigit(d) - this._getBCHDigit(0x1f25) >= 0) {
            d ^= (0x1f25 << (this._getBCHDigit(d) - this._getBCHDigit(0x1f25)));
        }
        return (data << 12) | d;
    };
    
    QRious.prototype._getBCHDigit = function(data) {
        var digit = 0;
        while (data !== 0) {
            digit++;
            data >>>= 1;
        }
        return digit;
    };
    
    QRious.prototype._mapData = function(modules, data) {
        var dataBytes = data.data;
        var bitIndex = 0;
        var byteIndex = 0;
        
        var up = true;
        var right = modules.length - 1;
        
        while (right >= 0) {
            if (right === 6) right--;
            
            while (right >= 0 && right <= modules.length - 1) {
                for (var i = 0; i < 2; i++) {
                    var c = right - i;
                    if (modules[up ? modules.length - 1 - c : c][c] === null) {
                        var bit = false;
                        if (byteIndex < dataBytes.length) {
                            bit = ((dataBytes[byteIndex] >>> (7 - bitIndex)) & 1) === 1;
                            bitIndex++;
                            if (bitIndex === 8) {
                                bitIndex = 0;
                                byteIndex++;
                            }
                        }
                        modules[up ? modules.length - 1 - c : c][c] = bit;
                    }
                }
                right -= 2;
            }
            right++;
            up = !up;
            right--;
        }
    };
    
    QRious.prototype._getBestVersion = function(data, level) {
        var dataLen = data.length;
        var version;
        
        for (version = 1; version <= 40; version++) {
            var capacities = [14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450, 504, 560, 624, 666, 711, 779, 857, 911, 997, 1059, 1125, 1190, 1264, 1370, 1452, 1538, 1628, 1722, 1809, 1911, 1989, 2099, 2213, 2331];
            var capacity = capacities[version - 1];
            
            var ecLevels = { 'L': 0.07, 'M': 0.15, 'Q': 0.25, 'H': 0.3 };
            var maxData = Math.floor(capacity * (1 - ecLevels[level]));
            
            if (dataLen <= maxData) break;
        }
        
        return Math.max(version, this.minVersion);
    };
    
    QRious.prototype.render = function(options) {
        if (options) {
            this.value = options.value !== undefined ? options.value : this.value;
            this.size = options.size !== undefined ? options.size : this.size;
            this.level = options.level !== undefined ? options.level : this.level;
            this.background = options.background !== undefined ? options.background : this.background;
            this.foreground = options.foreground !== undefined ? options.foreground : this.foreground;
        }
        
        this._draw();
        return this._canvas;
    };
    
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = QRious;
    } else {
        global.QRious = QRious;
    }
    
})(typeof window !== 'undefined' ? window : this);
