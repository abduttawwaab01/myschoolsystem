// Public Pages Shared Utilities
// Handles blog, resources, pricing, privacy policy, terms for public access

const PublicContent = {
    STORAGE_KEY: 'publicContent',
    
    init() {
        this.ensureDataExists();
    },
    
    ensureDataExists() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) {
            const defaultData = {
                blogPosts: this.getSampleBlogPosts(),
                resources: this.getSampleResources(),
                pricing: this.getDefaultPricing(),
                pages: {
                    privacy: this.getDefaultPrivacy(),
                    terms: this.getDefaultTerms()
                },
                comments: this.getSampleComments()
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultData));
        }
    },
    
    getSampleBlogPosts() {
        return [
            {
                id: 'BLOG001',
                slug: 'welcome-to-my-school-system',
                title: 'Welcome to My School System - Modern Education Management',
                content: `<p>Welcome to My School System, the comprehensive solution for modern educational institutions. Our platform is designed to streamline all aspects of school management, from student enrollment to academic reporting.</p>
                
                <h2>Why Choose My School System?</h2>
                <p>Our system provides a complete suite of tools that help schools operate more efficiently. Whether you're managing a small private school or a large educational institution, we have the features you need.</p>
                
                <h3>Key Features</h3>
                <ul>
                    <li><strong>Student Management:</strong> Complete student profiles, enrollment tracking, and academic records</li>
                    <li><strong>Attendance Tracking:</strong> Manual and QR code-based attendance systems</li>
                    <li><strong>Grade Management:</strong> Comprehensive score entry and report generation</li>
                    <li><strong>Financial Management:</strong> Fee collection, expense tracking, and financial reporting</li>
                    <li><strong>Parent Portal:</strong> Keep parents informed with real-time updates</li>
                </ul>
                
                <h3>Get Started Today</h3>
                <p>Join hundreds of schools already using My School System to transform their educational management. Sign up for a free trial today!</p>`,
                excerpt: 'Discover how My School System can transform your educational institution with comprehensive management tools.',
                featuredImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
                category: 'Announcements',
                tags: ['education', 'school management', 'announcements'],
                videoUrl: '',
                audioUrl: '',
                featured: true,
                commentsEnabled: true,
                status: 'published',
                views: 1250,
                createdAt: '2026-02-01T10:00:00.000Z',
                updatedAt: '2026-02-01T10:00:00.000Z'
            },
            {
                id: 'BLOG002',
                slug: 'tips-for-effective-online-learning',
                title: '10 Tips for Effective Online Learning',
                content: `<p>Online learning has become an essential part of modern education. Here are our top tips for making the most of your online learning experience.</p>
                
                <h2>1. Create a Dedicated Study Space</h2>
                <p>Set up a quiet, organized space specifically for learning. This helps your brain associate that area with focus and productivity.</p>
                
                <h2>2. Establish a Routine</h2>
                <p>Stick to a consistent schedule. Try to learn at the same times each day to build a habit.</p>
                
                <h2>3. Take Regular Breaks</h2>
                <p>Use techniques like the Pomodoro method - study for 25 minutes, then take a 5-minute break.</p>
                
                <h2>4. Stay Engaged</h2>
                <p>Participate in discussions, ask questions, and interact with your peers and teachers.</p>
                
                <h2>5. Use Visual Aids</h2>
                <p>Create mind maps, charts, and diagrams to help visualize complex concepts.</p>
                
                <h2>6. Practice Active Learning</h2>
                <p>Don't just passively watch or read. Take notes, summarize what you've learned, and teach it to someone else.</p>
                
                <h2>7. Manage Your Time Wisely</h2>
                <p>Use a planner or digital calendar to track assignments and deadlines.</p>
                
                <h2>8. Stay Healthy</h2>
                <p>Remember to exercise, eat well, and get enough sleep. Your brain works better when your body is healthy.</p>
                
                <h2>9. Minimize Distractions</h2>
                <p>Put your phone away, close unnecessary browser tabs, and let others know your study time.</p>
                
                <h2>10. Seek Help When Needed</h2>
                <p>Don't hesitate to reach out to teachers or classmates if you're struggling with any concept.</p>`,
                excerpt: 'Master online learning with these proven strategies for students and educators.',
                featuredImage: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800',
                category: 'Education Tips',
                tags: ['online learning', 'education tips', 'students'],
                videoUrl: '',
                audioUrl: '',
                featured: false,
                commentsEnabled: true,
                status: 'published',
                views: 890,
                createdAt: '2026-02-10T14:30:00.000Z',
                updatedAt: '2026-02-10T14:30:00.000Z'
            },
            {
                id: 'BLOG003',
                slug: 'importance-of-parent-teacher-communication',
                title: 'The Importance of Parent-Teacher Communication',
                content: `<p>Effective communication between parents and teachers is crucial for student success. When parents and teachers work together, students thrive academically and emotionally.</p>
                
                <h2>Why Communication Matters</h2>
                <p>Research consistently shows that parental involvement in education leads to better student outcomes. When teachers and parents maintain open lines of communication, everyone benefits.</p>
                
                <h2>Benefits for Students</h2>
                <ul>
                    <li>Improved academic performance</li>
                    <li>Better attendance and punctuality</li>
                    <li>Higher motivation and engagement</li>
                    <li>Stronger social-emotional development</li>
                </ul>
                
                <h2>How My School System Helps</h2>
                <p>Our platform includes a dedicated parent portal that allows:</p>
                <ul>
                    <li>Real-time attendance updates</li>
                    <li>Grade and score notifications</li>
                    <li>Direct messaging with teachers</li>
                    <li>Access to school announcements</li>
                </ul>
                
                <h2>Best Practices</h2>
                <p>Both parents and teachers should:</p>
                <ul>
                    <li>Check communication channels regularly</li>
                    <li>Respond promptly to messages</li>
                    <li>Share both concerns and achievements</li>
                    <li>Schedule regular check-ins</li>
                </ul>`,
                excerpt: 'Learn why parent-teacher communication is essential for student success.',
                featuredImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800',
                category: 'Education Tips',
                tags: ['parent', 'teacher', 'communication', 'education'],
                videoUrl: '',
                audioUrl: '',
                featured: false,
                commentsEnabled: true,
                status: 'published',
                views: 654,
                createdAt: '2026-02-15T09:00:00.000Z',
                updatedAt: '2026-02-15T09:00:00.000Z'
            }
        ];
    },
    
    getSampleResources() {
        return [
            {
                id: 'RES001',
                title: 'Student Registration Form Template',
                description: 'A comprehensive student registration form template that covers all necessary information for new student enrollment.',
                category: 'Documents',
                type: 'document',
                fileUrl: '',
                fileSize: '245 KB',
                downloads: 234,
                status: 'published',
                createdAt: '2026-01-15T10:00:00.000Z'
            },
            {
                id: 'RES002',
                title: 'School Calendar 2026',
                description: 'Complete school calendar for 2026 with all important dates, holidays, and examination periods.',
                category: 'Documents',
                type: 'document',
                fileUrl: '',
                fileSize: '128 KB',
                downloads: 567,
                status: 'published',
                createdAt: '2026-01-01T10:00:00.000Z'
            },
            {
                id: 'RES003',
                title: 'Introduction to Mathematics - Video Course',
                description: 'A comprehensive video series covering fundamental mathematical concepts for secondary school students.',
                category: 'Videos',
                type: 'video',
                fileUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                duration: '2 hours 30 minutes',
                views: 1234,
                status: 'published',
                createdAt: '2026-01-20T10:00:00.000Z'
            },
            {
                id: 'RES004',
                title: 'Science Experiment Guide',
                description: 'Step-by-step guide for conducting safe and educational science experiments in the classroom.',
                category: 'Documents',
                type: 'document',
                fileUrl: '',
                fileSize: '1.2 MB',
                downloads: 189,
                status: 'published',
                createdAt: '2026-02-01T10:00:00.000Z'
            },
            {
                id: 'RES005',
                title: 'English Literature Reading List',
                description: 'Recommended reading list for English literature students covering classic and contemporary works.',
                category: 'Documents',
                type: 'document',
                fileUrl: '',
                fileSize: '89 KB',
                downloads: 345,
                status: 'published',
                createdAt: '2026-02-05T10:00:00.000Z'
            },
            {
                id: 'RES006',
                title: 'Relaxation and Focus Music',
                description: 'Background music playlist designed to help students concentrate during study sessions.',
                category: 'Audio',
                type: 'audio',
                fileUrl: '',
                duration: '45 minutes',
                downloads: 456,
                status: 'published',
                createdAt: '2026-02-08T10:00:00.000Z'
            }
        ];
    },
    
    getSampleComments() {
        return [
            {
                id: 'CMT001',
                postId: 'BLOG001',
                author: 'John Smith',
                email: 'john@example.com',
                content: 'This system has transformed how our school manages daily operations. Highly recommended!',
                date: '2026-02-02T10:00:00.000Z',
                status: 'approved'
            },
            {
                id: 'CMT002',
                postId: 'BLOG001',
                author: 'Sarah Johnson',
                email: 'sarah@example.com',
                content: 'Great article! The parent portal feature is exactly what we needed.',
                date: '2026-02-03T14:30:00.000Z',
                status: 'approved'
            },
            {
                id: 'CMT003',
                postId: 'BLOG002',
                author: 'Michael Brown',
                email: 'michael@example.com',
                content: 'These tips really helped me improve my online learning experience. Thank you!',
                date: '2026-02-12T09:15:00.000Z',
                status: 'approved'
            }
        ];
    },
    
    getData() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },
    
    saveData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },
    
    // ==================== BLOG FUNCTIONS ====================
    
    getBlogPosts(status = null) {
        const data = this.getData();
        let posts = data?.blogPosts || [];
        
        if (status) {
            posts = posts.filter(p => p.status === status);
        }
        
        return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    
    getBlogPost(slug) {
        const data = this.getData();
        const posts = data?.blogPosts || [];
        return posts.find(p => p.slug === slug) || posts.find(p => p.id === slug);
    },
    
    getPublishedPosts() {
        return this.getBlogPosts('published');
    },
    
    getFeaturedPost() {
        const posts = this.getPublishedPosts();
        return posts.find(p => p.featured) || posts[0] || null;
    },
    
    createBlogPost(postData) {
        const data = this.getData();
        const slug = this.slugify(postData.title) + '-' + Date.now().toString(36);
        
        const newPost = {
            id: 'BLOG' + Date.now(),
            slug: slug,
            title: postData.title,
            content: postData.content,
            excerpt: postData.excerpt || this.generateExcerpt(postData.content),
            featuredImage: postData.featuredImage || '',
            category: postData.category || 'General',
            tags: postData.tags || [],
            videoUrl: postData.videoUrl || '',
            audioUrl: postData.audioUrl || '',
            featured: postData.featured || false,
            commentsEnabled: postData.commentsEnabled !== false,
            status: postData.status || 'draft',
            views: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        data.blogPosts.push(newPost);
        this.saveData(data);
        return newPost;
    },
    
    updateBlogPost(id, updates) {
        const data = this.getData();
        const index = data.blogPosts.findIndex(p => p.id === id);
        
        if (index === -1) return { success: false, message: 'Post not found' };
        
        data.blogPosts[index] = {
            ...data.blogPosts[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        this.saveData(data);
        return { success: true, post: data.blogPosts[index] };
    },
    
    deleteBlogPost(id) {
        const data = this.getData();
        const index = data.blogPosts.findIndex(p => p.id === id);
        
        if (index === -1) return { success: false, message: 'Post not found' };
        
        data.blogPosts.splice(index, 1);
        
        // Also delete associated comments
        data.comments = data.comments.filter(c => c.postId !== id);
        
        this.saveData(data);
        return { success: true };
    },
    
    incrementPostViews(id) {
        const data = this.getData();
        const post = data.blogPosts.find(p => p.id === id);
        if (post) {
            post.views = (post.views || 0) + 1;
            this.saveData(data);
        }
    },
    
    // ==================== COMMENTS FUNCTIONS ====================
    
    getComments(postId) {
        const data = this.getData();
        const comments = data?.comments || [];
        return comments
            .filter(c => c.postId === postId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    
    addComment(commentData) {
        const data = this.getData();
        
        const newComment = {
            id: 'CMT' + Date.now(),
            postId: commentData.postId,
            authorName: commentData.authorName.trim(),
            authorEmail: commentData.authorEmail || '',
            content: commentData.content.trim(),
            status: 'approved', // Auto-approve for now
            createdAt: new Date().toISOString()
        };
        
        data.comments.push(newComment);
        this.saveData(data);
        return newComment;
    },
    
    deleteComment(commentId) {
        const data = this.getData();
        const index = data.comments.findIndex(c => c.id === commentId);
        
        if (index === -1) return { success: false };
        
        data.comments.splice(index, 1);
        this.saveData(data);
        return { success: true };
    },
    
    // ==================== RESOURCES FUNCTIONS ====================
    
    getResources(category = null) {
        const data = this.getData();
        let resources = data?.resources || [];
        
        if (category) {
            resources = resources.filter(r => r.category === category);
        }
        
        return resources.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    
    getResource(id) {
        const data = this.getData();
        return data?.resources.find(r => r.id === id) || null;
    },
    
    addResource(resourceData) {
        const data = this.getData();
        
        const newResource = {
            id: 'RES' + Date.now(),
            title: resourceData.title,
            description: resourceData.description || '',
            category: resourceData.category || 'Documents',
            fileUrl: resourceData.fileUrl || '',
            fileType: resourceData.fileType || this.guessFileType(resourceData.fileUrl),
            fileSize: resourceData.fileSize || '',
            thumbnail: resourceData.thumbnail || '',
            tags: resourceData.tags || [],
            downloads: 0,
            status: resourceData.status || 'active',
            createdAt: new Date().toISOString()
        };
        
        data.resources.push(newResource);
        this.saveData(data);
        return newResource;
    },
    
    updateResource(id, updates) {
        const data = this.getData();
        const index = data.resources.findIndex(r => r.id === id);
        
        if (index === -1) return { success: false };
        
        data.resources[index] = { ...data.resources[index], ...updates };
        this.saveData(data);
        return { success: true, resource: data.resources[index] };
    },
    
    deleteResource(id) {
        const data = this.getData();
        const index = data.resources.findIndex(r => r.id === id);
        
        if (index === -1) return { success: false };
        
        data.resources.splice(index, 1);
        this.saveData(data);
        return { success: true };
    },
    
    incrementDownloads(id) {
        const data = this.getData();
        const resource = data.resources.find(r => r.id === id);
        if (resource) {
            resource.downloads = (resource.downloads || 0) + 1;
            this.saveData(data);
        }
    },
    
    // ==================== PRICING FUNCTIONS ====================
    
    getPricing() {
        const data = this.getData();
        return data?.pricing || this.getDefaultPricing();
    },
    
    updatePricing(pricingData) {
        const data = this.getData();
        data.pricing = { ...data.pricing, ...pricingData };
        this.saveData(data);
        return { success: true };
    },
    
    getDefaultPricing() {
        return {
            basic: {
                name: 'Basic',
                price: 0,
                period: 'forever',
                description: 'Perfect for small schools getting started',
                features: [
                    'Up to 100 students',
                    '5 staff accounts',
                    'Basic attendance',
                    'Score management',
                    'Student ID cards',
                    'Email support'
                ],
                cta: 'Get Started',
                highlighted: false
            },
            pro: {
                name: 'Pro',
                price: 49,
                period: '/month',
                description: 'Best for growing schools',
                features: [
                    'Up to 500 students',
                    '20 staff accounts',
                    'QR Attendance',
                    'Parent Portal',
                    'ID Card Generation',
                    'Reports & Analytics',
                    'Priority support'
                ],
                cta: 'Start Free Trial',
                highlighted: true
            },
            premium: {
                name: 'Premium',
                price: 149,
                period: '/month',
                description: 'For large institutions',
                features: [
                    'Unlimited students',
                    'Unlimited staff',
                    'All Pro features',
                    'SMS Notifications',
                    'Multi-branch support',
                    'Custom integrations',
                    'Dedicated support',
                    'White-label option'
                ],
                cta: 'Contact Sales',
                highlighted: false
            }
        };
    },
    
    // ==================== PAGES FUNCTIONS ====================
    
    getPage(pageName) {
        const data = this.getData();
        return data?.pages?.[pageName] || '';
    },
    
    updatePage(pageName, content) {
        const data = this.getData();
        if (!data.pages) data.pages = {};
        data.pages[pageName] = content;
        this.saveData(data);
        return { success: true };
    },
    
    getDefaultPrivacy() {
        return `<h1>Privacy Policy</h1>
<p>Last updated: ${new Date().toLocaleDateString()}</p>

<h2>1. Introduction</h2>
<p>Welcome to My School System. We are committed to protecting your privacy and ensuring the security of your personal information.</p>

<h2>2. Information We Collect</h2>
<p>We collect information that you provide directly to us, including:</p>
<ul>
<li>School information (name, address, contact details)</li>
<li>User account information (name, email, role)</li>
<li>Student information (for educational purposes)</li>
<li>Staff information</li>
</ul>

<h2>3. Cookies</h2>
<p>Our system uses cookies to enhance user experience. Cookies are small files stored on your device that help us:</p>
<ul>
<li>Keep you logged in</li>
<li>Remember your preferences</li>
<li>Analyze site traffic</li>
<li>Improve our services</li>
</ul>

<h2>4. Data Security</h2>
<p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

<h2>5. Third-Party Services</h2>
<p>We may use third-party services for analytics and payment processing. These services have their own privacy policies.</p>

<h2>6. Contact Us</h2>
<p>If you have any questions about this Privacy Policy, please contact us.</p>`;
    },
    
    getDefaultTerms() {
        return `<h1>Terms and Conditions</h1>
<p>Last updated: ${new Date().toLocaleDateString()}</p>

<h2>1. Acceptance of Terms</h2>
<p>By accessing and using My School System, you accept and agree to be bound by the terms and provisions of this agreement.</p>

<h2>2. Use License</h2>
<p>Permission is granted to use our system for educational management purposes only. This is the grant of a license, not a transfer of title.</p>

<h2>3. User Accounts</h2>
<p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>

<h2>4. Restrictions</h2>
<p>You may not:</p>
<ul>
<li>Use the system for any unlawful purpose</li>
<li>Attempt to gain unauthorized access to any part of the system</li>
<li>Copy, modify, or distribute system content</li>
<li>Transfer your account to another party</li>
</ul>

<h2>5. Limitation of Liability</h2>
<p>The system is provided "as is" without warranty of any kind. We shall not be liable for any damages arising from the use of our system.</p>

<h2>6. Termination</h2>
<p>We reserve the right to terminate your access to the system at any time without notice.</p>

<h2>7. Contact Information</h2>
<p>For questions about these Terms and Conditions, please contact us.</p>`;
    },
    
    // ==================== UTILITY FUNCTIONS ====================
    
    slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
    },
    
    generateExcerpt(content, length = 150) {
        const div = document.createElement('div');
        div.innerHTML = content;
        const text = div.textContent || div.innerText || '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    },
    
    guessFileType(url) {
        if (!url) return 'unknown';
        const ext = url.split('.').pop().toLowerCase();
        const types = {
            pdf: 'PDF Document',
            doc: 'Word Document',
            docx: 'Word Document',
            xls: 'Excel Spreadsheet',
            xlsx: 'Excel Spreadsheet',
            ppt: 'PowerPoint',
            pptx: 'PowerPoint',
            jpg: 'Image',
            jpeg: 'Image',
            png: 'Image',
            gif: 'Image',
            mp4: 'Video',
            webm: 'Video',
            mp3: 'Audio',
            wav: 'Audio',
            zip: 'Archive',
            rar: 'Archive'
        };
        return types[ext] || 'File';
    },
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    },
    
    timeAgo(dateString) {
        const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
        if (seconds < 2592000) return Math.floor(seconds / 86400) + ' days ago';
        
        return this.formatDate(dateString);
    },
    
    getCategories() {
        const posts = this.getBlogPosts();
        const categories = [...new Set(posts.map(p => p.category))];
        return categories.sort();
    },
    
    getResourceCategories() {
        return ['Documents', 'Videos', 'Audio', 'Images', 'Archives', 'Other'];
    },
    
    searchPosts(query) {
        const posts = this.getPublishedPosts();
        const q = query.toLowerCase();
        
        return posts.filter(p => 
            p.title.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
        );
    },
    
    searchResources(query) {
        const resources = this.getResources();
        const q = query.toLowerCase();
        
        return resources.filter(r => 
            r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            (r.tags && r.tags.some(t => t.toLowerCase().includes(q)))
        );
    }
};

// Initialize on load
PublicContent.init();

// Make globally available
window.PublicContent = PublicContent;
