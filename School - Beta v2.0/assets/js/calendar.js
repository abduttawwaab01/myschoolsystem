const Calendar = {
    currentDate: new Date(),
    currentView: 'month',
    selectedDate: null,
    
    init(schoolId = null) {
        this.schoolId = schoolId;
        this.render();
        this.loadEvents();
    },
    
    getSchoolId() {
        if (this.schoolId) return this.schoolId;
        if (typeof Auth !== 'undefined' && Auth.getCurrentSchoolId) {
            return Auth.getCurrentSchoolId();
        }
        if (typeof StudentAuth !== 'undefined' && StudentAuth.getCurrentSchoolId) {
            return StudentAuth.getCurrentSchoolId();
        }
        return null;
    },
    
    render() {
        const container = document.getElementById('calendarWidget');
        if (!container) return;
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        
        let html = `
            <div class="calendar-header">
                <button class="calendar-nav-btn" onclick="Calendar.prevMonth()">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <h3 class="calendar-month-title">${monthNames[month]} ${year}</h3>
                <button class="calendar-nav-btn" onclick="Calendar.nextMonth()">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-day-header">Sun</div>
                <div class="calendar-day-header">Mon</div>
                <div class="calendar-day-header">Tue</div>
                <div class="calendar-day-header">Wed</div>
                <div class="calendar-day-header">Thu</div>
                <div class="calendar-day-header">Fri</div>
                <div class="calendar-day-header">Sat</div>
        `;
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        
        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
            const hasEvents = this.hasEventsOnDate(dateStr);
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}" 
                     onclick="Calendar.selectDate('${dateStr}')">
                    <span class="calendar-day-number">${day}</span>
                    ${hasEvents ? '<span class="calendar-event-dot"></span>' : ''}
                </div>
            `;
        }
        
        html += '</div>';
        
        // Upcoming events section
        html += this.renderUpcomingEvents();
        
        container.innerHTML = html;
    },
    
    renderUpcomingEvents() {
        const events = this.getUpcomingEvents();
        if (!events.length) return '';
        
        let html = '<div class="calendar-upcoming"><h4>Upcoming Events</h4>';
        events.slice(0, 3).forEach(event => {
            const eventDate = new Date(event.date);
            const dateStr = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            html += `
                <div class="calendar-event-item" onclick="Calendar.showEventDetails('${event.id}')">
                    <span class="calendar-event-date">${dateStr}</span>
                    <span class="calendar-event-title">${event.title}</span>
                </div>
            `;
        });
        html += '</div>';
        return html;
    },
    
    hasEventsOnDate(dateStr) {
        const events = Storage.getData('calendarEvents') || [];
        const schoolId = this.getSchoolId();
        return events.some(e => 
            e.date === dateStr && 
            (e.schoolId === schoolId || e.schoolId === null)
        );
    },
    
    getUpcomingEvents() {
        const events = Storage.getData('calendarEvents') || [];
        const schoolId = this.getSchoolId();
        const today = new Date().toISOString().split('T')[0];
        
        return events
            .filter(e => (e.schoolId === schoolId || e.schoolId === null) && e.date >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    
    loadEvents() {
        // Events are loaded via render
    },
    
    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
    },
    
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
    },
    
    selectDate(dateStr) {
        this.selectedDate = dateStr;
        this.showAddEventModal(dateStr);
    },
    
    showAddEventModal(dateStr = null) {
        const defaultDate = dateStr || new Date().toISOString().split('T')[0];
        const schoolId = this.getSchoolId();
        
        const html = `
            <form id="addEventForm">
                <div class="form-group">
                    <label class="form-label">Event Title *</label>
                    <input type="text" id="eventTitle" class="form-control" required placeholder="Enter event title">
                </div>
                <div class="form-group">
                    <label class="form-label">Date *</label>
                    <input type="date" id="eventDate" class="form-control" value="${defaultDate}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Time</label>
                    <input type="time" id="eventTime" class="form-control" value="09:00">
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea id="eventDescription" class="form-control" rows="2" placeholder="Event description"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Color</label>
                    <input type="color" id="eventColor" class="form-control" value="#16a34a">
                </div>
                <div class="form-group">
                    <label class="form-label">Visibility</label>
                    <select id="eventVisibility" class="form-control">
                        <option value="all">All Users</option>
                        <option value="staff">Staff Only</option>
                        <option value="admin">Admin Only</option>
                    </select>
                </div>
                <input type="hidden" id="eventSchoolId" value="${schoolId || ''}">
            </form>
        `;
        
        const modalContent = `
            <div class="modal" style="max-width: 450px;">
                <div class="modal-header">
                    <h3 class="modal-title">Add Event</h3>
                    <button class="modal-close" onclick="Calendar.closeEventModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">${html}</div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="Calendar.closeEventModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="Calendar.saveEvent()">Save Event</button>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('calendarEventModal');
        if (existingModal) existingModal.remove();
        
        // Create new modal
        const modalDiv = document.createElement('div');
        modalDiv.id = 'calendarEventModal';
        modalDiv.className = 'modal-overlay active';
        modalDiv.innerHTML = modalContent;
        document.body.appendChild(modalDiv);
    },
    
    closeEventModal() {
        const modal = document.getElementById('calendarEventModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    },
    
    saveEvent() {
        const title = document.getElementById('eventTitle').value.trim();
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        const description = document.getElementById('eventDescription').value.trim();
        const color = document.getElementById('eventColor').value;
        const visibility = document.getElementById('eventVisibility').value;
        const schoolId = document.getElementById('eventSchoolId').value;
        
        if (!title || !date) {
            Toast.error('Please fill in required fields');
            return;
        }
        
        const event = {
            id: Storage.generateId(),
            schoolId: schoolId || null,
            title: title,
            date: date,
            time: time,
            description: description,
            color: color,
            visibility: visibility,
            createdBy: typeof Auth !== 'undefined' ? Auth.getCurrentUser()?.id : null,
            createdAt: new Date().toISOString()
        };
        
        Storage.addItem('calendarEvents', event);
        Toast.success('Event added successfully!');
        this.closeEventModal();
        this.render();
    },
    
    showEventDetails(eventId) {
        const events = Storage.getData('calendarEvents') || [];
        const event = events.find(e => e.id === eventId);
        
        if (!event) return;
        
        const html = `
            <div style="text-align: center;">
                <div style="width: 50px; height: 50px; background: ${event.color}; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white;">
                    <i class="fas fa-calendar"></i>
                </div>
                <h3>${event.title}</h3>
                <p class="text-muted">${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                ${event.time ? '<p><i class="fas fa-clock"></i> ' + event.time + '</p>' : ''}
                ${event.description ? '<p>' + event.description + '</p>' : ''}
                <div style="margin-top: 20px;">
                    <button class="btn btn-danger btn-sm" onclick="Calendar.deleteEvent('${event.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        
        const modalContent = `
            <div class="modal" style="max-width: 400px;">
                <div class="modal-header">
                    <h3 class="modal-title">Event Details</h3>
                    <button class="modal-close" onclick="Calendar.closeDetailsModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">${html}</div>
            </div>
        `;
        
        const existingModal = document.getElementById('eventDetailsModal');
        if (existingModal) existingModal.remove();
        
        const modalDiv = document.createElement('div');
        modalDiv.id = 'eventDetailsModal';
        modalDiv.className = 'modal-overlay active';
        modalDiv.innerHTML = modalContent;
        document.body.appendChild(modalDiv);
    },
    
    closeDetailsModal() {
        const modal = document.getElementById('eventDetailsModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    },
    
    deleteEvent(eventId) {
        Modal.confirm({
            title: 'Delete Event',
            message: 'Are you sure you want to delete this event?',
            onConfirm: function() {
                Storage.deleteItem('calendarEvents', eventId);
                Toast.success('Event deleted');
                Calendar.closeDetailsModal();
                Calendar.render();
            }
        });
    },
    
    showFullCalendar() {
        const html = `
            <div class="modal" style="max-width: 90%; max-height: 90vh;">
                <div class="modal-header">
                    <h3 class="modal-title">School Calendar</h3>
                    <button class="modal-close" onclick="Calendar.closeFullCalendarModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" style="overflow-y: auto;">
                    <div id="fullCalendarWidget"></div>
                </div>
            </div>
        `;
        
        const existingModal = document.getElementById('fullCalendarModal');
        if (existingModal) existingModal.remove();
        
        const modalDiv = document.createElement('div');
        modalDiv.id = 'fullCalendarModal';
        modalDiv.className = 'modal-overlay active';
        modalDiv.innerHTML = html;
        document.body.appendChild(modalDiv);
        
        // Render full calendar in modal
        const originalContainer = this.savedContainer;
        document.getElementById('fullCalendarWidget').innerHTML = document.getElementById('calendarWidget').innerHTML;
    },
    
    closeFullCalendarModal() {
        const modal = document.getElementById('fullCalendarModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }
};

// Make Calendar globally available
window.Calendar = Calendar;
