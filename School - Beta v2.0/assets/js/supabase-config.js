// Supabase Configuration
// Add your Supabase credentials here when ready for production

const SupabaseConfig = {
    // Replace with your Supabase URL and Anon Key
    // You can find these in your Supabase dashboard -> Settings -> API
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
    
    // Enable/disable Supabase (falls back to localStorage if disabled)
    enabled: false,
    
    // Tables names
    tables: {
        chats: 'chats',
        messages: 'messages',
        users: 'users'
    }
};

// Initialize Supabase client
let supabase = null;
let isSupabaseReady = false;

async function initSupabase() {
    if (!SupabaseConfig.enabled || SupabaseConfig.url === 'YOUR_SUPABASE_URL') {
        console.log('Supabase not configured - using localStorage only');
        return false;
    }
    
    try {
        // Load Supabase from CDN if not already loaded
        if (!window.supabase) {
            await loadSupabaseScript();
        }
        
        supabase = window.supabase.createClient(SupabaseConfig.url, SupabaseConfig.anonKey);
        isSupabaseReady = true;
        console.log('Supabase connected successfully');
        
        // Test connection
        const { data, error } = await supabase.from('chats').select('count').limit(1);
        if (error) {
            console.error('Supabase connection error:', error.message);
            return false;
        }
        
        return true;
    } catch (err) {
        console.error('Failed to initialize Supabase:', err);
        return false;
    }
}

function loadSupabaseScript() {
    return new Promise((resolve, reject) => {
        if (window.supabase) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function isSupabaseEnabled() {
    return SupabaseConfig.enabled && isSupabaseReady;
}

// Supabase Database Helper Functions
const SupabaseDB = {
    // Chats
    async createChat(chatData) {
        if (!isSupabaseEnabled()) return { data: null, error: 'Supabase not enabled' };
        
        const { data, error } = await supabase
            .from(SupabaseConfig.tables.chats)
            .insert(chatData)
            .select()
            .single();
        
        return { data, error };
    },
    
    async getChat(chatId) {
        if (!isSupabaseEnabled()) return { data: null, error: 'Supabase not enabled' };
        
        const { data, error } = await supabase
            .from(SupabaseConfig.tables.chats)
            .select('*')
            .eq('id', chatId)
            .single();
        
        return { data, error };
    },
    
    async getChatByParticipants(userId1, userId2) {
        if (!isSupabaseEnabled()) return { data: null, error: 'Supabase not enabled' };
        
        const { data, error } = await supabase
            .from(SupabaseConfig.tables.chats)
            .select('*')
            .contains('participants', [userId1, userId2])
            .eq('is_group', false)
            .single();
        
        return { data, error };
    },
    
    async getUserChats(userId) {
        if (!isSupabaseEnabled()) return { data: [], error: 'Supabase not enabled' };
        
        const { data, error } = await supabase
            .from(SupabaseConfig.tables.chats)
            .select('*')
            .contains('participants', [userId])
            .order('updated_at', { ascending: false });
        
        return { data: data || [], error };
    },
    
    async updateChat(chatId, updates) {
        if (!isSupabaseEnabled()) return { data: null, error: 'Supabase not enabled' };
        
        const { data, error } = await supabase
            .from(SupabaseConfig.tables.chats)
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', chatId)
            .select()
            .single();
        
        return { data, error };
    },
    
    // Messages
    async sendMessage(messageData) {
        if (!isSupabaseEnabled()) return { data: null, error: 'Supabase not enabled' };
        
        const { data, error } = await supabase
            .from(SupabaseConfig.tables.messages)
            .insert(messageData)
            .select()
            .single();
        
        return { data, error };
    },
    
    async getMessages(chatId, limit = 50) {
        if (!isSupabaseEnabled()) return { data: [], error: 'Supabase not enabled' };
        
        const { data, error } = await supabase
            .from(SupabaseConfig.tables.messages)
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true })
            .limit(limit);
        
        return { data: data || [], error };
    },
    
    async markMessagesAsRead(chatId, userId) {
        if (!isSupabaseEnabled()) return { error: 'Supabase not enabled' };
        
        const { error } = await supabase
            .from(SupabaseConfig.tables.messages)
            .update({ read: true })
            .eq('chat_id', chatId)
            .neq('sender_id', userId);
        
        return { error };
    },
    
    // Real-time subscription
    subscribeToChat(chatId, callback) {
        if (!isSupabaseEnabled()) return null;
        
        return supabase
            .channel(`chat:${chatId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `chat_id=eq.${chatId}`
            }, callback)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages',
                filter: `chat_id=eq.${chatId}`
            }, callback)
            .subscribe();
    },
    
    subscribeToUserChats(userId, callback) {
        if (!isSupabaseEnabled()) return null;
        
        return supabase
            .channel(`user_chats:${userId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'chats',
                filter: `participants=cs.${JSON.stringify([userId]).replace('[', '').replace(']', '')}`
            }, callback)
            .subscribe();
    },
    
    // Sync localStorage with Supabase
    async syncChatsFromCloud(userId) {
        if (!isSupabaseEnabled()) return;
        
        const { data: cloudChats } = await this.getUserChats(userId);
        if (!cloudChats || cloudChats.length === 0) return;
        
        const localChats = Storage.getData('chats') || [];
        
        cloudChats.forEach(cloudChat => {
            const localIndex = localChats.findIndex(c => c.id === cloudChat.id);
            if (localIndex === -1) {
                localChats.push(cloudChat);
            } else {
                // Merge messages
                const localMessages = localChats[localIndex].messages || [];
                const cloudMessages = cloudChat.messages || [];
                const mergedMessages = [...localMessages];
                
                cloudMessages.forEach(msg => {
                    if (!mergedMessages.find(m => m.id === msg.id)) {
                        mergedMessages.push(msg);
                    }
                });
                
                localChats[localIndex] = { ...cloudChat, messages: mergedMessages };
            }
        });
        
        Storage.setData('chats', localChats);
    },
    
    async syncChatToCloud(chat) {
        if (!isSupabaseEnabled()) return;
        
        const { data: existing } = await this.getChat(chat.id);
        
        if (existing) {
            await this.updateChat(chat.id, chat);
        } else {
            await this.createChat(chat);
        }
    }
};

// Auto-initialize Supabase when loaded
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
});

// Export to window
window.SupabaseConfig = SupabaseConfig;
window.initSupabase = initSupabase;
window.isSupabaseEnabled = isSupabaseEnabled;
window.supabase = supabase;
window.SupabaseDB = SupabaseDB;
