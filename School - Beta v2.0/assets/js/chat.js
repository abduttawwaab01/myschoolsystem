const Chat = {
    currentChat: null,
    currentUser: null,
    pollingInterval: null,
    isRecording: false,
    mediaRecorder: null,
    audioChunks: [],
    availableChatUsers: [],
    
    showNewChatModal() {
        const modal = document.getElementById('newChatModal');
        if (!modal) return;
        
        const schoolId = Auth.getCurrentSchoolId();
        let users = [];
        
        if (this.currentUser.role === 'super_admin') {
            users = Storage.getData('users').filter(u => u.role !== 'super_admin');
        } else if (this.currentUser.role === 'parent') {
            const schoolUsers = Storage.getData('users').filter(u => u.schoolId === schoolId);
            users = schoolUsers.filter(u => ['teacher', 'school_admin', 'director'].includes(u.role));
        } else {
            const schoolUsers = Storage.getData('users').filter(u => u.schoolId === schoolId);
            let allowedRoles = ['teacher', 'accountant', 'director', 'school_admin', 'super_admin', 'parent'];
            
            if (this.currentUser.role === 'teacher' || this.currentUser.role === 'accountant') {
                allowedRoles = ['school_admin', 'director', 'parent'];
            }
            
            users = schoolUsers.filter(u => allowedRoles.includes(u.role) && String(u.id) !== String(this.currentUser.id));
            
            if (this.currentUser.role === 'school_admin' || this.currentUser.role === 'director') {
                const superAdmin = Storage.getData('users').find(u => u.role === 'super_admin');
                if (superAdmin) {
                    users = [superAdmin, ...users];
                }
            }
        }
        
        this.availableChatUsers = users;
        this.renderNewChatUserList(users);
        Modal.show('newChatModal');
    },
    
    renderNewChatUserList(users) {
        const userList = document.getElementById('newChatUserList');
        if (!userList) return;
        
        if (users.length === 0) {
            userList.innerHTML = '<div class="empty-state"><p>No users found</p></div>';
            return;
        }
        
        userList.innerHTML = users.map(user => `
            <div class="chat-item" onclick="Chat.startNewChat('${user.id}')" style="cursor: pointer; padding: 10px; border-bottom: 1px solid #eee;">
                <div class="chat-item-avatar" style="flex-shrink: 0;">
                    ${this.renderAvatar(user)}
                </div>
                <div class="chat-item-info">
                    <div class="chat-item-name">${user.name}</div>
                    <div class="chat-item-preview">${this.getRoleLabel(user.role)}</div>
                </div>
            </div>
        `).join('');
    },
    
    filterNewChatUsers(query) {
        const lowerQuery = query.toLowerCase();
        const filtered = this.availableChatUsers.filter(u => 
            u.name.toLowerCase().includes(lowerQuery) || 
            this.getRoleLabel(u.role).toLowerCase().includes(lowerQuery)
        );
        this.renderNewChatUserList(filtered);
    },
    
    startNewChat(userId) {
        Modal.hide('newChatModal');
        this.openChat(userId, null, 'direct');
    },
    
    showSuperAdminGroupModal() {
        if (this.currentUser.role !== 'super_admin') return;
        const modal = document.getElementById('superAdminGroupModal');
        if (!modal) return;
        const users = Storage.getData('users').filter(u => u.role !== 'super_admin');
        const userList = document.getElementById('superGroupUserList');
        userList.innerHTML = users.map(u => `<div><label><input type="checkbox" value="${u.id}"> ${u.name} (${this.getRoleLabel(u.role)}, ${u.schoolName || ''})</label></div>`).join('');
        Modal.show('superAdminGroupModal');
    },

    selectSuperGroup(type) {
        const users = Storage.getData('users').filter(u => u.role !== 'super_admin');
        let filtered = [];
        if (type === 'admins') {
            filtered = users.filter(u => u.role === 'school_admin');
        } else if (type === 'directors') {
            filtered = users.filter(u => u.role === 'director');
        } else {
            filtered = users;
        }
        const userList = document.getElementById('superGroupUserList');
        userList.innerHTML = filtered.map(u => `<div><label><input type="checkbox" value="${u.id}"> ${u.name} (${this.getRoleLabel(u.role)}, ${u.schoolName || ''})</label></div>`).join('');
        userList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
    },

    createSuperAdminGroup() {
        const groupName = document.getElementById('superGroupNameInput').value.trim();
        const userList = document.getElementById('superGroupUserList');
        const selectedIds = Array.from(userList.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
        if (!groupName || selectedIds.length === 0) {
            Toast.error('Enter group name and select at least one user');
            return;
        }
        selectedIds.push(this.currentUser.id);
        const groupId = 'group_' + Date.now();
        const group = {
            id: groupId,
            name: groupName,
            participants: selectedIds,
            isGroup: true,
            schoolId: null,
            messages: []
        };
        let chats = Storage.getData('chats');
        chats.push(group);
        Storage.setData('chats', chats);
        Modal.hide('superAdminGroupModal');
        Toast.success('Group chat created');
        this.loadGroups();
    },

    showCreateGroupModal() {
        if (!(this.currentUser.role === 'school_admin' || this.currentUser.role === 'director')) return;
        const modal = document.getElementById('createGroupModal');
        if (!modal) return;
        const schoolId = Auth.getCurrentSchoolId();
        const staff = Storage.getData('users').filter(u => u.schoolId === schoolId && ['teacher','accountant','director','school_admin'].includes(u.role) && u.id !== this.currentUser.id);
        const staffList = document.getElementById('groupStaffList');
        staffList.innerHTML = staff.map(u => `<div><label><input type="checkbox" value="${u.id}"> ${u.name} (${this.getRoleLabel(u.role)})</label></div>`).join('');
        Modal.show('createGroupModal');
    },

    selectAllStaff() {
        const staffList = document.getElementById('groupStaffList');
        if (!staffList) return;
        staffList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
    },

    createGroupChat() {
        const groupName = document.getElementById('groupNameInput').value.trim();
        const staffList = document.getElementById('groupStaffList');
        const selectedIds = Array.from(staffList.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
        if (!groupName || selectedIds.length === 0) {
            Toast.error('Enter group name and select at least one staff');
            return;
        }
        selectedIds.push(this.currentUser.id);
        const groupId = 'group_' + Date.now();
        const group = {
            id: groupId,
            name: groupName,
            participants: selectedIds,
            isGroup: true,
            schoolId: Auth.getCurrentSchoolId(),
            messages: []
        };
        let chats = Storage.getData('chats');
        chats.push(group);
        Storage.setData('chats', chats);
        Modal.hide('createGroupModal');
        Toast.success('Group chat created');
        this.loadGroups();
    },
    
    emojis: [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊',
        '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜',
        '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶',
        '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒',
        '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸',
        '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺',
        '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓',
        '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩',
        '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇',
        '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘',
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕',
        '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🎵', '🎶', '🔥', '⭐', '🌟',
        '✨', '💫', '⚡', '💥', '🎉', '🎊', '🎈', '✅', '❌', '⚠️', '💯', '🔴'
    ],
    
    init() {
        this.currentUser = Auth.getCurrentUser();
        if (!this.currentUser) return;
        
        this.loadChatList();
        this.loadGroups();
        this.startPolling();
        this.subscribeToRealtime();
        this.handleMobileChatView();
        
        // Add window resize listener for mobile toggle
        window.addEventListener('resize', () => {
            if (this.isMobile()) {
                this.handleMobileChatView();
            }
        });
    },

    renderAvatar(user, size = 'normal') {
        const initials = Utils.getInitials(user.name);
        const color = this.getAvatarColor(user.role);
        
        if (user.avatar) {
            return `<div class="chat-avatar-img" style="background: ${color}">
                <img src="${user.avatar}" alt="${initials}">
            </div>`;
        }
        
        const sizeClass = size === 'large' ? 'chat-avatar-large' : '';
        return `<div class="chat-avatar-initials ${sizeClass}" style="background: ${color}">
            ${initials}
        </div>`;
    },
    
    isMobile() {
        return window.innerWidth <= 768;
    },
    
    closeSidebar() {
        const sidebar = document.getElementById('chatSidebar');
        const chatMain = document.getElementById('chatMain');
        const backBtn = document.getElementById('chatBackBtn');
        
        if (sidebar && chatMain) {
            sidebar.style.display = 'none';
            chatMain.style.display = 'block';
            if (backBtn) backBtn.style.display = 'block';
        }
    },
    
    showSidebar() {
        const sidebar = document.getElementById('chatSidebar');
        const chatMain = document.getElementById('chatMain');
        const backBtn = document.getElementById('chatBackBtn');
        
        if (sidebar && chatMain) {
            sidebar.style.display = 'flex';
            chatMain.style.display = 'none';
            if (backBtn) backBtn.style.display = 'none';
        }
    },
    
    handleMobileChatView() {
        if (this.isMobile()) {
            this.showSidebar();
            const backBtn = document.getElementById('chatBackBtn');
            if (backBtn) backBtn.style.display = 'none';
        }
    },
    
    loadChatList() {
        const schoolId = Auth.getCurrentSchoolId();
        let users = [];
        
        if (this.currentUser.role === 'super_admin') {
            const allUsers = Storage.getData('users');
            users = allUsers.filter(u => u.role !== 'super_admin');
        } else if (this.currentUser.role === 'parent') {
            const schoolUsers = Storage.getData('users').filter(u => u.schoolId === schoolId);
            users = schoolUsers.filter(u => ['teacher', 'school_admin', 'director'].includes(u.role));
        } else {
            const schoolUsers = Storage.getData('users').filter(u => u.schoolId === schoolId);
            let allowedRoles = ['teacher', 'accountant', 'director', 'school_admin', 'super_admin', 'parent'];
            
            if (this.currentUser.role === 'teacher' || this.currentUser.role === 'accountant') {
                allowedRoles = ['school_admin', 'director', 'parent'];
            }
            
            users = schoolUsers.filter(u => allowedRoles.includes(u.role) && String(u.id) !== String(this.currentUser.id));
            
            if (this.currentUser.role === 'school_admin' || this.currentUser.role === 'director') {
                const superAdmin = Storage.getData('users').find(u => u.role === 'super_admin');
                if (superAdmin) {
                    users = [superAdmin, ...users];
                }
            }
        }
        
        this.renderChatList(users);
        this.renderGroupsList();
    },
    
    hasPreviousChatWith(userId) {
        const currentUserId = String(this.currentUser.id);
        const targetUserId = String(userId);
        const chats = Storage.getData('chats');
        return chats.some(c => {
            const participants = c.participants.map(p => String(p));
            return participants.includes(currentUserId) && participants.includes(targetUserId);
        });
    },
    
    renderChatList(users) {
        const listContainer = document.getElementById('chatList');
        if (!listContainer) return;
        
        const schoolId = Auth.getCurrentSchoolId();
        const currentUserId = String(this.currentUser.id);
        
        // Get all chats where user is a participant
        const allChats = Storage.getData('chats') || [];
        
        // Filter chats to show - direct messages only
        const existingChats = allChats.filter(c => {
            // Must not be a group
            if (c.isGroup) return false;
            
            // User must be a participant
            const participants = c.participants.map(p => String(p));
            if (!participants.includes(currentUserId)) return false;
            
            // For non-super_admin, show chats from same school or schoolId: null
            // Also show chats where the other participant is from the same school
            if (this.currentUser.role !== 'super_admin') {
                if (c.schoolId === schoolId || c.schoolId === null) {
                    return true;
                }
                // Check if any participant (other than current user) is from the same school
                const otherParticipants = c.participants.filter(p => p !== currentUserId);
                const users = Storage.getData('users') || [];
                return otherParticipants.some(pId => {
                    const user = users.find(u => String(u.id) === String(pId));
                    return user && String(user.schoolId) === String(schoolId);
                });
            }
            
            return true;
        });
        
        let html = '<div class="chat-section-title">Direct Messages</div>';
        
        // Show ALL available users from the users list, not just existing chats
        if (!users || users.length === 0) {
            html += '<div class="empty-state"><p>No users available</p></div>';
        } else {
            users.forEach(user => {
                const userIdStr = String(user.id);
                
                // Find existing chat with this user
                const chat = existingChats.find(c => {
                    const participants = c.participants.map(p => String(p));
                    return participants.includes(userIdStr);
                });
                
                const lastMessage = chat && chat.messages ? chat.messages[chat.messages.length - 1] : null;
                const unreadCount = chat ? chat.messages.filter(m => !m.read && String(m.senderId) !== currentUserId).length : 0;
                const chatId = chat ? chat.id : 'chat__' + [currentUserId, userIdStr].sort().join('__');
                
                html += `
                    <div class="chat-item ${this.currentChat === chatId ? 'active' : ''}" 
                         data-user-id="${user.id}" 
                         data-chat-id="${chat?.id || ''}"
                         data-type="direct"
                         onclick="Chat.openDirectChat('${user.id}', '${chat?.id || ''}')">
                        <div class="chat-item-avatar">
                            ${this.renderAvatar(user)}
                            <div class="online-dot"></div>
                        </div>
                        <div class="chat-item-info">
                            <div class="chat-item-name">${user.name}</div>
                            <div class="chat-item-preview">${lastMessage ? Utils.truncate(this.stripHtml(lastMessage.text), 30) : this.getRoleLabel(user.role)}</div>
                        </div>
                        <div class="chat-item-meta">
                            <div class="chat-item-time">${lastMessage ? Utils.timeAgo(lastMessage.timestamp) : ''}</div>
                            ${unreadCount > 0 ? `<span class="chat-item-badge">${unreadCount}</span>` : ''}
                        </div>
                    </div>
                `;
            });
        }
        
        listContainer.innerHTML = html;
        
        listContainer.querySelectorAll('.chat-item[data-type="direct"]').forEach(item => {
            item.addEventListener('click', () => {
                const userId = item.dataset.userId;
                const chatId = item.dataset.chatId || '';
                this.openDirectChat(userId, chatId);
            });
        });
    },
    
    loadGroups() {
        this.renderGroupsList();
    },
    
    renderGroupsList() {
        const groupsContainer = document.getElementById('groupsList');
        if (!groupsContainer) return;
        
        const schoolId = Auth.getCurrentSchoolId();
        const currentUserId = String(this.currentUser.id);
        
        let groups = [];
        
        if (this.currentUser.role === 'super_admin') {
            groups = Storage.getData('chats').filter(c => c.isGroup);
        } else {
            groups = Storage.getData('chats').filter(c => {
                if (!c.isGroup) return false;
                const participants = c.participants.map(p => String(p));
                return participants.includes(currentUserId);
            });
        }
        
        if (groups.length === 0) {
            return;
        }
        
        let html = '<div class="chat-section-title">Groups</div>';
        
        groups.forEach(group => {
            const unreadCount = group.messages ? group.messages.filter(m => !m.read && String(m.senderId) !== currentUserId).length : 0;
            const lastMessage = group.messages ? group.messages[group.messages.length - 1] : null;
            
            html += `
                <div class="chat-item ${this.currentChat === group.id ? 'active' : ''}" 
                     data-group-id="${group.id}"
                     data-type="group">
                    <div class="chat-item-avatar" style="background: var(--primary)">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="chat-item-info">
                        <div class="chat-item-name">${group.name}</div>
                        <div class="chat-item-preview">${lastMessage ? Utils.truncate(this.stripHtml(lastMessage.text), 30) : group.participants.length + ' members'}</div>
                    </div>
                    <div class="chat-item-meta">
                        <div class="chat-item-time">${lastMessage ? Utils.timeAgo(lastMessage.timestamp) : ''}</div>
                        ${unreadCount > 0 ? `<span class="chat-item-badge">${unreadCount}</span>` : ''}
                    </div>
                </div>
            `;
        });
        
        const existingList = document.getElementById('chatList');
        if (existingList && groups.length > 0) {
            const existingGroups = existingList.querySelectorAll('.chat-item[data-type="group"]');
            existingGroups.forEach(item => item.remove());
            
            existingList.innerHTML += html;
            
            existingList.querySelectorAll('.chat-item[data-type="group"]').forEach(item => {
                item.addEventListener('click', () => {
                    const groupId = item.dataset.groupId;
                    this.openGroupChat(groupId);
                });
            });
        }
    },
    
    getAvatarColor(role) {
        const colors = {
            super_admin: '#8b5cf6',
            school_admin: '#16a34a',
            director: '#3b82f6',
            teacher: '#f59e0b',
            accountant: '#ef4444',
            parent: '#ec4899'
        };
        return colors[role] || '#6b7280';
    },
    
    getRoleLabel(role) {
        const labels = {
            super_admin: 'Super Admin',
            school_admin: 'Administrator',
            director: 'Director',
            teacher: 'Teacher',
            accountant: 'Accountant',
            parent: 'Parent'
        };
        return labels[role] || role;
    },
    
    openDirectChat(userId, chatId) {
        this.openChat(userId, chatId, 'direct');
    },
    
    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    },
    
    extractUserIdFromChatId(chatId, currentUserId) {
        if (!chatId) return null;
        
        const chatIdStr = String(chatId);
        const currentUserIdStr = String(currentUserId);
        
        if (chatIdStr.startsWith('chat__')) {
            const chatPart = chatIdStr.replace('chat__', '');
            const parts = chatPart.split('__');
            const otherPart = parts.find(p => p && p !== currentUserIdStr);
            return otherPart || null;
        } else if (chatIdStr.startsWith('chat_')) {
            const chatPart = chatIdStr.replace('chat_', '');
            const parts = chatPart.split(currentUserIdStr).filter(Boolean);
            return parts.length > 0 ? parts[0] : null;
        } else if (chatIdStr.startsWith('new_')) {
            return chatIdStr.replace('new_', '');
        }
        
        return chatIdStr;
    },
    
    openChat(userId, chatId, type = 'direct') {
        if (type === 'group') {
            this.openGroupChat(chatId);
            return;
        }
        
        const userIdStr = String(userId);
        const users = Storage.getData('users');
        const otherUser = users.find(u => String(u.id) === userIdStr);
        
        if (!otherUser) {
            console.error('User not found:', userId);
            return;
        }
        
        // Always generate a consistent chat ID regardless of passed chatId
        const sortedIds = [String(this.currentUser.id), userIdStr].sort();
        this.currentChat = 'chat__' + sortedIds.join('__');
        this.currentChatType = 'direct';
        
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
            if (String(item.dataset.userId) === userIdStr) {
                item.classList.add('active');
            }
        });
        
        const headerHtml = `
            <div class="chat-header-avatar">
                ${this.renderAvatar(otherUser, 'large')}
            </div>
            <div class="chat-header-info">
                <h3>${otherUser.name}</h3>
                <p>${this.getRoleLabel(otherUser.role)}</p>
            </div>
            <div class="chat-header-actions" style="margin-left: auto; display: flex; gap: 8px;">
                <button class="btn btn-icon" onclick="Chat.searchMessages()" title="Search">
                    <i class="fas fa-search"></i>
                </button>
            </div>
        `;
        
        document.getElementById('chatHeader').innerHTML = headerHtml;
        
        this.loadMessages(userId, null);
        
        // On mobile, show chat main area after selecting a conversation
        if (this.isMobile()) {
            const sidebar = document.getElementById('chatSidebar');
            const chatMain = document.getElementById('chatMain');
            const backBtn = document.getElementById('chatBackBtn');
            if (sidebar && chatMain) {
                sidebar.style.display = 'none';
                chatMain.style.display = 'flex';
                if (backBtn) backBtn.style.display = 'block';
            }
        }
    },
    
    openGroupChat(groupId) {
        const chats = Storage.getData('chats');
        const group = chats.find(c => c.id === groupId);
        
        if (!group) return;
        
        this.currentChat = groupId;
        this.currentChatType = 'group';
        
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.groupId === groupId) {
                item.classList.add('active');
            }
        });
        
        const headerHtml = `
            <div class="chat-header-avatar" style="background: var(--primary)">
                <i class="fas fa-users"></i>
            </div>
            <div class="chat-header-info">
                <h3>${group.name}</h3>
                <p>${group.participants.length} members</p>
            </div>
            <div class="chat-header-actions" style="margin-left: auto; display: flex; gap: 8px;">
                <button class="btn btn-icon" onclick="Chat.showGroupInfo('${groupId}')" title="Info">
                    <i class="fas fa-info-circle"></i>
                </button>
                <button class="btn btn-icon" onclick="Chat.searchMessages()" title="Search">
                    <i class="fas fa-search"></i>
                </button>
            </div>
        `;
        
        document.getElementById('chatHeader').innerHTML = headerHtml;
        
        this.loadGroupMessages(groupId);
        
        // On mobile, show chat main area after selecting a group
        if (this.isMobile()) {
            const sidebar = document.getElementById('chatSidebar');
            const chatMain = document.getElementById('chatMain');
            const backBtn = document.getElementById('chatBackBtn');
            if (sidebar && chatMain) {
                sidebar.style.display = 'none';
                chatMain.style.display = 'flex';
                if (backBtn) backBtn.style.display = 'block';
            }
        }
    },
    
    loadMessages(userId, groupId = null) {
        const schoolId = Auth.getCurrentSchoolId();
        const users = Storage.getData('users') || [];
        
        const currentUserId = String(this.currentUser.id);
        const targetUserId = String(userId);
        
        let chat = null;
        
        if (groupId) {
            const chats = Storage.getData('chats');
            chat = chats.find(c => c.id === groupId);
        } else {
            const chats = Storage.getData('chats');
            
            chat = chats.find(c => {
                if (c.isGroup) return false;
                const participants = c.participants.map(p => String(p));
                return participants.includes(currentUserId) && participants.includes(targetUserId);
            });
            
            if (chat) {
                const otherParticipant = chat.participants.find(p => String(p) !== currentUserId);
                const sortedIds = [currentUserId, String(otherParticipant)].sort();
                const newFormatChatId = 'chat__' + sortedIds.join('__');
                this.currentChat = newFormatChatId;
            }
        }
        
        if (!chat && !groupId) {
            const otherUser = Storage.getItemById('users', userId);
            if (!otherUser) {
                console.error('User not found:', userId);
                return;
            }
            const chatSchoolId = (this.currentUser.role === 'super_admin' || otherUser.role === 'super_admin') ? null : schoolId;
            const sortedIds = [currentUserId, targetUserId].sort();
            const newFormatChatId = 'chat__' + sortedIds.join('__');
            
            chat = {
                id: newFormatChatId,
                schoolId: chatSchoolId,
                isGroup: false,
                participants: [currentUserId, targetUserId],
                messages: [],
                createdAt: new Date().toISOString()
            };
            
            let chats = Storage.getData('chats') || [];
            const existingChat = chats.find(c => 
                !c.isGroup &&
                c.participants.map(p => String(p)).includes(currentUserId) && 
                c.participants.map(p => String(p)).includes(targetUserId)
            );
            
            if (!existingChat) {
                chats.push(chat);
                Storage.setData('chats', chats);
            } else {
                chat = existingChat;
            }
            
            this.currentChat = chat.id;
        }
        
        const messagesContainer = document.getElementById('chatMessages');
        
        if (!chat.messages || chat.messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="chat-empty-state">
                    <i class="fas fa-comments"></i>
                    <h3>No messages yet</h3>
                    <p>Send a message to start the conversation</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        let lastDate = '';
        
        chat.messages.forEach((msg, index) => {
            const isSent = String(msg.senderId) === currentUserId;
            const sender = users.find(u => u.id === msg.senderId || String(u.id) === String(msg.senderId));
            
            const msgDate = new Date(msg.timestamp).toLocaleDateString();
            if (msgDate !== lastDate) {
                html += `<div class="date-separator"><span>${msgDate}</span></div>`;
                lastDate = msgDate;
            }
            
            html += `
                <div class="message ${isSent ? 'sent' : ''} ${msg.deleted ? 'deleted' : ''}" data-message-id="${msg.id}">
                    <div class="message-avatar">
                        ${sender ? this.renderAvatar(sender) : '<div class="chat-avatar-initials" style="background: var(--primary)">U</div>'}
                    </div>
                    <div class="message-content">
                        ${!isSent && this.currentChatType !== 'group' ? `<div class="message-sender">${sender?.name}</div>` : ''}
                        <div class="message-text">${msg.deleted ? '<em>This message was deleted</em>' : this.formatMessage(msg.text)}</div>
                        ${msg.attachments?.length ? this.renderAttachments(msg.attachments) : ''}
                        <div class="message-meta">
                            <span class="message-time">${Utils.formatDate(msg.timestamp, 'time')}</span>
                            ${isSent ? `<span class="message-status">${msg.read ? '<i class="fas fa-check-double read"></i>' : '<i class="fas fa-check"></i>'}</span>` : ''}
                        </div>
                    </div>
                    ${!msg.deleted ? `
                        <div class="message-actions">
                            <button onclick="Chat.showMessageMenu('${msg.id}')"><i class="fas fa-ellipsis-v"></i></button>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        messagesContainer.innerHTML = html;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        if (!groupId) {
            this.markAsRead(userId);
        }
    },
    
    loadGroupMessages(groupId) {
        const chats = Storage.getData('chats');
        const users = Storage.getData('users');
        const group = chats.find(c => c.id === groupId);
        const currentUserId = String(this.currentUser.id);
        
        if (!group) return;
        
        this.currentChat = groupId;
        this.currentChatType = 'group';
        
        const messagesContainer = document.getElementById('chatMessages');
        
        if (!group.messages || group.messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="chat-empty-state">
                    <i class="fas fa-comments"></i>
                    <h3>No messages yet</h3>
                    <p>Start the group conversation</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        let lastDate = '';
        
        group.messages.forEach(msg => {
            const isSent = String(msg.senderId) === currentUserId;
            const sender = users.find(u => u.id === msg.senderId || String(u.id) === String(msg.senderId));
            
            const msgDate = new Date(msg.timestamp).toLocaleDateString();
            if (msgDate !== lastDate) {
                html += `<div class="date-separator"><span>${msgDate}</span></div>`;
                lastDate = msgDate;
            }
            
            html += `
                <div class="message ${isSent ? 'sent' : ''}" data-message-id="${msg.id}">
                    <div class="message-avatar">
                        ${sender ? this.renderAvatar(sender) : '<div class="chat-avatar-initials" style="background: var(--primary)">U</div>'}
                    </div>
                    <div class="message-content">
                        ${!isSent ? `<div class="message-sender">${sender?.name}</div>` : ''}
                        <div class="message-text">${this.formatMessage(msg.text)}</div>
                        ${msg.attachments?.length ? this.renderAttachments(msg.attachments) : ''}
                        <div class="message-meta">
                            <span class="message-time">${Utils.formatDate(msg.timestamp, 'time')}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        messagesContainer.innerHTML = html;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    formatMessage(text) {
        if (!text) return '';
        let formatted = text.replace(/\n/g, '<br>');
        
        this.emojis.forEach(emoji => {
            formatted = formatted.replace(new RegExp(this.escapeRegex(emoji), 'g'), `<span class="emoji">${emoji}</span>`);
        });
        
        formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="message-link">$1</a>');
        
        return formatted;
    },
    
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },
    
    renderAttachments(attachments) {
        if (!attachments || !attachments.length) return '';
        
        let html = '<div class="message-attachments">';
        
        attachments.forEach(att => {
            if (att.type.startsWith('image/')) {
                html += `<div class="message-attachment image" onclick="Chat.previewImage('${att.data}')"><img src="${att.data}" alt="${att.name}"></div>`;
            } else if (att.type.startsWith('audio/')) {
                html += `
                    <div class="message-attachment audio">
                        <audio controls>
                            <source src="${att.data}" type="${att.type}">
                        </audio>
                        <span class="audio-name"><i class="fas fa-music"></i> ${att.name}</span>
                    </div>
                `;
            } else if (att.type.startsWith('video/')) {
                html += `
                    <div class="message-attachment video" onclick="Chat.previewVideo('${att.data}')">
                        <video src="${att.data}"></video>
                        <div class="play-button"><i class="fas fa-play"></i></div>
                    </div>
                `;
            } else {
                html += `<div class="message-attachment file" onclick="Chat.downloadAttachment('${att.data}', '${att.name}')">
                    <i class="fas fa-file"></i>
                    <span>${att.name}</span>
                </div>`;
            }
        });
        
        html += '</div>';
        return html;
    },
    
    showMessageMenu(messageId) {
        const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageEl) return;
        
        const existingMenu = document.querySelector('.message-menu');
        if (existingMenu) existingMenu.remove();
        
        const menu = document.createElement('div');
        menu.className = 'message-menu';
        menu.innerHTML = `
            <div class="message-menu-item" onclick="Chat.copyMessage('${messageId}')">
                <i class="fas fa-copy"></i> Copy
            </div>
            <div class="message-menu-item" onclick="Chat.deleteMessageForMe('${messageId}')">
                <i class="fas fa-trash"></i> Delete for me
            </div>
        `;
        
        if (this.currentUser.role === 'super_admin' || this.currentChatType === 'group') {
            menu.innerHTML += `
                <div class="message-menu-item danger" onclick="Chat.deleteMessageForAll('${messageId}')">
                    <i class="fas fa-trash-alt"></i> Delete for everyone
                </div>
            `;
        }
        
        messageEl.appendChild(menu);
        
        setTimeout(() => {
            document.addEventListener('click', () => menu.remove(), { once: true });
        }, 100);
    },
    
    copyMessage(messageId) {
        const chat = this.currentChat;
        if (!chat || !chat.messages) return;
        
        const msg = chat.messages.find(m => m.id === messageId);
        if (msg) {
            Utils.copyToClipboard(msg.text);
        }
    },
    
    deleteMessageForMe(messageId) {
        const chatId = this.currentChat?.id || this.currentChat;
        if (!chatId || chatId.startsWith('new_')) return;
        
        let chats = Storage.getData('chats');
        const chatIndex = chats.findIndex(c => c.id === chatId);
        
        if (chatIndex !== -1) {
            const msgIndex = chats[chatIndex].messages.findIndex(m => m.id === messageId);
            if (msgIndex !== -1) {
                chats[chatIndex].messages.splice(msgIndex, 1);
                Storage.setData('chats', chats);
                
                if (this.currentChatType === 'group') {
                    this.loadGroupMessages(chatId);
                } else {
                    this.loadMessages(chatId.replace('new_', ''));
                }
            }
        }
    },
    
    deleteMessageForAll(messageId) {
        const chatId = this.currentChat?.id || this.currentChat;
        if (!chatId || chatId.startsWith('new_')) return;
        
        Modal.confirm({
            title: 'Delete Message',
            message: 'Delete this message for everyone in this conversation?',
            onConfirm: () => {
                let chats = Storage.getData('chats');
                const chatIndex = chats.findIndex(c => c.id === chatId);
                
                if (chatIndex !== -1) {
                    const msgIndex = chats[chatIndex].messages.findIndex(m => m.id === messageId);
                    if (msgIndex !== -1) {
                        chats[chatIndex].messages[msgIndex].deleted = true;
                        chats[chatIndex].messages[msgIndex].text = '';
                        Storage.setData('chats', chats);
                        
                        if (this.currentChatType === 'group') {
                            this.loadGroupMessages(chatId);
                        } else {
                            this.loadMessages(chatId.replace('new_', ''));
                        }
                        
                        Toast.success('Message deleted');
                    }
                }
            }
        });
    },
    
    sendMessage(text, attachments = []) {
        if (!this.currentChat || (!text.trim() && !attachments.length)) {
            console.error('Cannot send: currentChat is', this.currentChat, 'text is:', text);
            return;
        }
        
        const currentUserId = String(this.currentUser.id);
        
        const message = {
            id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            senderId: currentUserId,
            senderName: this.currentUser.name,
            text: text.trim(),
            attachments: attachments,
            timestamp: new Date().toISOString(),
            read: false,
            deleted: false
        };
        
        let chats = Storage.getData('chats') || [];
        let chat = null;
        let targetUserId = null;
        
        if (this.currentChatType === 'group') {
            chat = chats.find(c => c.id === this.currentChat && c.isGroup);
            if (chat) {
                chat.messages = chat.messages || [];
                chat.messages.push(message);
                chat.lastMessage = message;
                Storage.setData('chats', chats);
                
                const input = document.getElementById('chatInput');
                if (input) input.value = '';
                
                this.loadGroupMessages(this.currentChat);
                this.loadChatList();
                return;
            }
        }
        
        targetUserId = this.extractUserIdFromChatId(this.currentChat, currentUserId);
        
        if (!targetUserId) {
            console.error('Could not determine recipient user from chatId:', this.currentChat);
            return;
        }
        
        chat = chats.find(c => {
            if (c.isGroup) return false;
            const participants = c.participants.map(p => String(p));
            return participants.includes(currentUserId) && participants.includes(targetUserId);
        });
        
        if (chat) {
            chat.messages = chat.messages || [];
            chat.messages.push(message);
            chat.lastMessage = message;
            
            Storage.setData('chats', chats);
            
            const input = document.getElementById('chatInput');
            if (input) input.value = '';
            
            this.loadMessages(targetUserId);
            this.loadChatList();
            
            const recipient = Storage.getItemById('users', targetUserId);
            if (recipient) {
                Auth.addNotification(targetUserId, `New message from ${this.currentUser.name}`, 'message');
            }
            return;
        }
        
        let schoolId = Auth.getCurrentSchoolId();
        const otherUser = Storage.getItemById('users', targetUserId);
        if (this.currentUser.role === 'super_admin' || otherUser?.role === 'super_admin') {
            schoolId = null;
        }
        
        const sortedIds = [currentUserId, String(targetUserId)].sort();
        const chatId = 'chat__' + sortedIds.join('__');
        
        const newChat = {
            id: chatId,
            schoolId: schoolId,
            isGroup: false,
            participants: [currentUserId, String(targetUserId)],
            messages: [message],
            lastMessage: message,
            createdAt: new Date().toISOString()
        };
        
        chats.push(newChat);
        Storage.setData('chats', chats);
        
        const input = document.getElementById('chatInput');
        if (input) input.value = '';
        
        this.loadMessages(targetUserId);
        this.loadChatList();
        
        const recipient = Storage.getItemById('users', targetUserId);
        if (recipient) {
            Auth.addNotification(targetUserId, `New message from ${this.currentUser.name}`, 'message');
        }
    },
    
    markAsRead(userId) {
        const chatId = this.currentChat?.id || this.currentChat;
        if (!chatId || chatId.startsWith('new_')) return;
        
        const currentUserId = String(this.currentUser.id);
        let chats = Storage.getData('chats');
        const chatIndex = chats.findIndex(c => c.id === chatId);
        
        if (chatIndex !== -1) {
            let marked = false;
            chats[chatIndex].messages.forEach(msg => {
                if (String(msg.senderId) !== currentUserId && !msg.read) {
                    msg.read = true;
                    marked = true;
                }
            });
            if (marked) Storage.setData('chats', chats);
        }
    },
    
    showEmojiPicker() {
        const existingPicker = document.querySelector('.emoji-picker');
        if (existingPicker) {
            existingPicker.remove();
            return;
        }
        
        const picker = document.createElement('div');
        picker.className = 'emoji-picker';
        picker.innerHTML = `
            <div class="emoji-picker-header">
                <span>Emoji</span>
                <button onclick="this.closest('.emoji-picker').remove()"><i class="fas fa-times"></i></button>
            </div>
            <div class="emoji-grid">
                ${this.emojis.map(emoji => `<button class="emoji-btn" onclick="Chat.insertEmoji('${emoji}')">${emoji}</button>`).join('')}
            </div>
        `;
        
        const input = document.getElementById('chatInput');
        input.parentNode.appendChild(picker);
        
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!picker.contains(e.target) && !e.target.closest('.chat-header-actions')) {
                    picker.remove();
                }
            });
        }, 100);
    },
    
    insertEmoji(emoji) {
        const input = document.getElementById('chatInput');
        input.value += emoji;
        input.focus();
    },
    
    showAttachMenu() {
        const existingMenu = document.querySelector('.attach-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }
        
        const menu = document.createElement('div');
        menu.className = 'attach-menu';
        menu.innerHTML = `
            <div class="attach-menu-item" onclick="Chat.attachImage()">
                <i class="fas fa-image"></i>
                <span>Image</span>
            </div>
            <div class="attach-menu-item" onclick="Chat.attachVideo()">
                <i class="fas fa-video"></i>
                <span>Video</span>
            </div>
            <div class="attach-menu-item" onclick="Chat.attachAudio()">
                <i class="fas fa-music"></i>
                <span>Audio</span>
            </div>
            <div class="attach-menu-item" onclick="Chat.attachFile()">
                <i class="fas fa-file"></i>
                <span>Document</span>
            </div>
            <div class="attach-menu-item" onclick="Chat.startVoiceRecord()">
                <i class="fas fa-microphone"></i>
                <span>Voice Note</span>
            </div>
        `;
        
        const input = document.getElementById('chatInput');
        input.parentNode.appendChild(menu);
        
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target) && !e.target.closest('.chat-header-actions')) {
                    menu.remove();
                }
            });
        }, 100);
    },
    
    async attachImage() {
        document.querySelector('.attach-menu')?.remove();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = async (e) => {
            const files = Array.from(e.target.files);
            const attachments = await Promise.all(files.map(f => this.uploadFile(f)));
            this.sendMessage('', attachments);
        };
        input.click();
    },
    
    async attachVideo() {
        document.querySelector('.attach-menu')?.remove();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const attachment = await this.uploadFile(file);
            this.sendMessage('', [attachment]);
        };
        input.click();
    },
    
    async attachAudio() {
        document.querySelector('.attach-menu')?.remove();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const attachment = await this.uploadFile(file);
            this.sendMessage('', [attachment]);
        };
        input.click();
    },
    
    async attachFile() {
        document.querySelector('.attach-menu')?.remove();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const attachment = await this.uploadFile(file);
            this.sendMessage('', [attachment]);
        };
        input.click();
    },
    
    async startVoiceRecord() {
        document.querySelector('.attach-menu')?.remove();
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (e) => {
                this.audioChunks.push(e.data);
            };
            
            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const attachment = {
                        name: 'Voice note',
                        type: 'audio/webm',
                        size: audioBlob.size,
                        data: reader.result
                    };
                    this.sendMessage('', [attachment]);
                };
                reader.readAsDataURL(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            Toast.info('Recording... Click microphone again to stop');
            
            const voiceBtn = document.getElementById('voiceBtn');
            if (voiceBtn) voiceBtn.classList.add('recording');
            
        } catch (err) {
            Toast.error('Could not access microphone');
        }
    },
    
    stopVoiceRecord() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            const voiceBtn = document.getElementById('voiceBtn');
            if (voiceBtn) voiceBtn.classList.remove('recording');
        }
    },
    
    async uploadFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                resolve({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: e.target.result
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },
    
    previewImage(src) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay image-preview-modal';
        modal.innerHTML = `
            <div class="modal" style="max-width: 90%; max-height: 90%; background: transparent; box-shadow: none;">
                <div class="modal-body" style="padding: 0;">
                    <img src="${src}" style="max-width: 100%; max-height: 85vh; border-radius: 8px;">
                </div>
                <button class="modal-close" style="position: absolute; top: -40px; right: 0; background: white; border-radius: 50%;" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.classList.add('active');
    },
    
    previewVideo(src) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal" style="max-width: 80%;">
                <div class="modal-body" style="padding: 0;">
                    <video src="${src}" controls style="width: 100%; border-radius: 8px;"></video>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.classList.add('active');
    },
    
    downloadAttachment(dataUrl, name) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = name;
        link.click();
    },
    
    searchMessages() {
        const query = prompt('Search messages:');
        if (!query) return;
        
        const chat = this.currentChat;
        if (!chat || !chat.messages) return;
        
        const results = chat.messages.filter(m => 
            m.text && m.text.toLowerCase().includes(query.toLowerCase())
        );
        
        if (results.length === 0) {
            Toast.info('No messages found');
            return;
        }
        
        const messagesContainer = document.getElementById('chatMessages');
        let html = `<div class="search-results-header">${results.length} results found</div>`;
        
        results.forEach(msg => {
            const isSent = msg.senderId === this.currentUser.id;
            html += `
                <div class="message ${isSent ? 'sent' : ''}" onclick="this.scrollIntoView({behavior: 'smooth'})">
                    <div class="message-content">
                        <div class="message-text">${this.formatMessage(msg.text)}</div>
                        <div class="message-time">${Utils.formatDate(msg.timestamp, 'datetime')}</div>
                    </div>
                </div>
            `;
        });
        
        messagesContainer.innerHTML = html;
    },
    
    showGroupInfo(groupId) {
        const chats = Storage.getData('chats');
        const group = chats.find(c => c.id === groupId);
        
        if (!group) return;
        
        const users = Storage.getData('users');
        const members = group.participants.map(p => users.find(u => u.id === p)).filter(Boolean);
        
        let html = `
            <div class="group-info">
                <h3>${group.name}</h3>
                <p>${group.participants.length} members</p>
                
                <div class="members-list">
                    ${members.map(m => `
                        <div class="member-item">
                            <div class="avatar">${Utils.getInitials(m.name)}</div>
                            <div>
                                <div class="member-name">${m.name}</div>
                                <div class="member-role">${this.getRoleLabel(m.role)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.getElementById('chatMessages').innerHTML = html;
    },
    
    createGroup() {
        const groupName = prompt('Enter group name:');
        if (!groupName) return;
        
        const schoolId = Auth.getCurrentSchoolId();
        
        let availableUsers = [];
        
        if (this.currentUser.role === 'super_admin') {
            availableUsers = Storage.getData('users').filter(u => u.role !== 'super_admin');
        } else {
            availableUsers = Storage.getData('users').filter(u => 
                u.schoolId === schoolId && 
                u.id !== this.currentUser.id
            );
        }
        
        let html = `
            <div class="create-group-form">
                <h4>Add Members to "${groupName}"</h4>
                <div class="user-select-list">
                    ${availableUsers.map(u => `
                        <label class="user-select-item">
                            <input type="checkbox" value="${u.id}">
                            <div class="avatar">${Utils.getInitials(u.name)}</div>
                            <div>
                                <div>${u.name}</div>
                                <div class="text-muted">${this.getRoleLabel(u.role)}</div>
                            </div>
                        </label>
                    `).join('')}
                </div>
                <button class="btn btn-primary mt-2" onclick="Chat.finalizeGroup('${groupName}')">Create Group</button>
            </div>
        `;
        
        document.getElementById('chatMessages').innerHTML = html;
    },
    
    finalizeGroup(groupName) {
        const checkboxes = document.querySelectorAll('.user-select-item input:checked');
        const participantIds = [this.currentUser.id, ...Array.from(checkboxes).map(c => c.value)];
        
        const groupId = 'group_' + Date.now();
        
        const newGroup = {
            id: groupId,
            schoolId: this.currentUser.role === 'super_admin' ? null : Auth.getCurrentSchoolId(),
            isGroup: true,
            name: groupName,
            participants: participantIds,
            messages: [],
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser.id
        };
        
        const chats = Storage.getData('chats');
        chats.push(newGroup);
        Storage.setData('chats', chats);
        
        this.currentChat = groupId;
        this.currentChatType = 'group';
        
        this.loadChatList();
        this.openGroupChat(groupId);
        
        Toast.success('Group created successfully');
    },
    
    startPolling() {
        if (this.pollingInterval) clearInterval(this.pollingInterval);
        
        this.pollingInterval = setInterval(() => {
            if (typeof isSupabaseEnabled === 'function' && isSupabaseEnabled()) {
                this.syncChatsFromCloud();
            }
            
            if (this.currentChat) {
                const chatId = typeof this.currentChat === 'object' ? this.currentChat.id : this.currentChat;
                if (this.currentChatType === 'group') {
                    this.loadGroupMessages(chatId);
                } else if (!chatId.startsWith('new_')) {
                    const currentUserId = String(this.currentUser.id);
                    const userId = this.extractUserIdFromChatId(chatId, currentUserId);
                    if (userId) {
                        this.loadMessages(userId);
                    }
                }
            }
            this.loadChatList();
        }, 5000);
    },
    
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    },
    
    async syncMessageToCloud(chatId, message) {
        try {
            // Get the full chat object
            const chats = Storage.getData('chats');
            const chat = chats.find(c => c.id === chatId);
            if (!chat) return;
            
            // Sync chat to cloud
            await SupabaseDB.syncChatToCloud(chat);
            
            // Send individual message to cloud
            await SupabaseDB.sendMessage({
                id: message.id,
                chat_id: chatId,
                sender_id: message.senderId,
                text: message.text,
                attachments: message.attachments || [],
                read: false,
                deleted: false,
                created_at: message.timestamp
            });
        } catch (err) {
            console.error('Failed to sync message to cloud:', err);
        }
    },
    
    async syncChatsFromCloud() {
        if (typeof SupabaseDB === 'undefined' || !isSupabaseEnabled()) return;
        
        try {
            await SupabaseDB.syncChatsFromCloud(this.currentUser.id);
            this.loadChatList();
            if (this.currentChat) {
                const chatId = typeof this.currentChat === 'object' ? this.currentChat.id : this.currentChat;
                if (this.currentChatType === 'group') {
                    this.loadGroupMessages(chatId);
                } else {
                    // Extract the other user from the chat ID
                    const currentUserId = String(this.currentUser.id);
                    let userId;
                    if (chatId.startsWith('chat__')) {
                        const chatPart = chatId.replace('chat__', '');
                        const parts = chatPart.split(currentUserId).filter(Boolean);
                        userId = parts.length > 0 ? parts[parts.length - 1] : chatPart;
                    } else if (chatId.startsWith('chat_')) {
                        const chatPart = chatId.replace('chat_', '');
                        const parts = chatPart.split(currentUserId).filter(Boolean);
                        userId = parts.length > 0 ? parts[parts.length - 1] : chatPart;
                    } else {
                        userId = chatId;
                    }
                    this.loadMessages(userId);
                }
            }
        } catch (err) {
            console.error('Failed to sync chats from cloud:', err);
        }
    },
    
    realtimeChannel: null,
    
    subscribeToRealtime() {
        if (typeof SupabaseDB === 'undefined' || !isSupabaseEnabled()) {
            return;
        }
        
        try {
            // Subscribe to messages in user's chats
            this.realtimeChannel = supabase
                .channel('chat_updates')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                }, (payload) => {
                    this.handleNewMessage(payload.new);
                })
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages'
                }, (payload) => {
                    this.handleMessageUpdate(payload.new);
                })
                .subscribe();
        } catch (err) {
            console.error('Failed to subscribe to realtime:', err);
        }
    },
    
    handleNewMessage(message) {
        // Check if message is for a chat the user participates in
        const chats = Storage.getData('chats');
        const chat = chats.find(c => c.id === message.chat_id);
        
        if (!chat || !chat.participants.includes(this.currentUser.id)) return;
        
        // Add message to local storage if not already present
        const localChatIndex = chats.findIndex(c => c.id === message.chat_id);
        if (localChatIndex !== -1) {
            const msgExists = chats[localChatIndex].messages.some(m => m.id === message.id);
            if (!msgExists) {
                chats[localChatIndex].messages.push({
                    id: message.id,
                    senderId: message.sender_id,
                    text: message.text,
                    attachments: message.attachments,
                    timestamp: message.created_at,
                    read: message.read,
                    deleted: message.deleted
                });
                Storage.setData('chats', chats);
                
                // Refresh UI if this is the current chat
                const currentChatId = typeof this.currentChat === 'object' ? this.currentChat.id : this.currentChat;
                if (currentChatId === message.chat_id) {
                    if (this.currentChatType === 'group') {
                        this.loadGroupMessages(message.chat_id);
                    } else {
                        const currentUserId = String(this.currentUser.id);
                        let userId;
                        if (message.sender_id === this.currentUser.id) {
                            if (currentChatId.startsWith('chat__')) {
                                const chatPart = currentChatId.replace('chat__', '');
                                const parts = chatPart.split(currentUserId).filter(Boolean);
                                userId = parts.length > 0 ? parts[parts.length - 1] : chatPart;
                            } else if (currentChatId.startsWith('chat_')) {
                                const chatPart = currentChatId.replace('chat_', '');
                                const parts = chatPart.split(currentUserId).filter(Boolean);
                                userId = parts.length > 0 ? parts[parts.length - 1] : chatPart;
                            } else {
                                userId = currentChatId;
                            }
                        } else {
                            userId = message.sender_id;
                        }
                        this.loadMessages(userId);
                    }
                }
                
                this.loadChatList();
            }
        }
    },
    
    handleMessageUpdate(message) {
        // Handle message updates (like read receipts, deletions)
        const chats = Storage.getData('chats');
        const chatIndex = chats.findIndex(c => c.id === message.chat_id);
        
        if (chatIndex !== -1) {
            const msgIndex = chats[chatIndex].messages.findIndex(m => m.id === message.id);
            if (msgIndex !== -1) {
                chats[chatIndex].messages[msgIndex] = {
                    ...chats[chatIndex].messages[msgIndex],
                    ...message,
                    senderId: message.sender_id,
                    timestamp: message.created_at
                };
                Storage.setData('chats', chats);
                
                const currentChatId = typeof this.currentChat === 'object' ? this.currentChat.id : this.currentChat;
                if (currentChatId === message.chat_id) {
                    if (this.currentChatType === 'group') {
                        this.loadGroupMessages(message.chat_id);
                    } else {
                        this.loadMessages(currentChatId.replace('chat_', '').replace('new_', ''));
                    }
                }
            }
        }
    },
    
    unsubscribeFromRealtime() {
        if (this.realtimeChannel) {
            supabase.removeChannel(this.realtimeChannel);
            this.realtimeChannel = null;
        }
    },
    
    getUnreadCount() {
        const schoolId = Auth.getCurrentSchoolId();
        const currentUserId = String(this.currentUser.id);
        
        const allChats = Storage.getData('chats');
        const chats = allChats.filter(c => {
            const participants = c.participants.map(p => String(p));
            if (!participants.includes(currentUserId)) return false;
            if (c.isGroup) return true;
            return c.schoolId === schoolId || c.schoolId === null;
        });
        
        let count = 0;
        chats.forEach(chat => {
            if (chat.messages) {
                count += chat.messages.filter(m => !m.read && String(m.senderId) !== currentUserId).length;
            }
        });
        
        return count;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) return;
    
    Chat.init();
    
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                Chat.sendMessage(chatInput.value);
            }
        });
        
        chatInput.addEventListener('input', () => {
            // Typing indicator logic could go here
        });
    }
    
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            Chat.sendMessage(chatInput.value);
        });
    }
    
    const fileBtn = document.getElementById('fileBtn');
    if (fileBtn) {
        fileBtn.addEventListener('click', () => {
            Chat.showAttachMenu();
        });
    }
    
    const voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            if (Chat.isRecording) {
                Chat.stopVoiceRecord();
            } else {
                Chat.startVoiceRecord();
            }
        });
    }
    
    const searchInput = document.getElementById('chatSearch');
    if (searchInput) {
        searchInput.addEventListener('input', Utils.debounce((e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('.chat-item').forEach(item => {
                const name = item.querySelector('.chat-item-name')?.textContent.toLowerCase() || '';
                item.style.display = name.includes(query) ? 'flex' : 'none';
            });
        }, 300));
    }
    
    const createGroupBtn = document.getElementById('createGroupBtn');
    if (createGroupBtn) {
        createGroupBtn.addEventListener('click', () => {
            Chat.createGroup();
        });
    }
});

window.Chat = Chat;
