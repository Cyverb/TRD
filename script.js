    // Clearance levels and credentials
    const credentials = {
        'Master': { password: 'TRDMaster20252', clearance: 'MASTER' },
        'Level1': { password: 'TRDL1', clearance: 'L1' },
        'Level2': { password: 'TRDL2259', clearance: 'L2' },
        'Level3': { password: 'TRDL32945', clearance: 'L3' },
        'Level4': { password: 'TRDL49844', clearance: 'L4' },
        'Level5': { password: 'TRDL592855', clearance: 'L5' }
    };

    let currentClearance = 'L1';
    let currentUser = '';

    // Data storage (in a real app, this would be a database)
    let incidents = [];
    let reports = [];
    let operations = [];
    let personnel = [];
    let violations = [];
    let interrogations = [];
    let activities = [];

    // Dashboard stats
    let dashboardStats = {
        activePersonnel: 47,
        openCases: 12,
        violations: 8,
        siteStatus: 'SECURE'
    };

    // Authentication function
    function authenticate() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (credentials[username] && credentials[username].password === password) {
            currentClearance = credentials[username].clearance;
            currentUser = username;
            document.getElementById('currentClearance').textContent = currentClearance;
            
            // Hide login, show main content
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
            document.getElementById('logoutBtn').style.display = 'block';
            document.getElementById('refreshBtn').style.display = 'block';
            
            // Show/hide navigation buttons based on clearance
            updateNavigationVisibility();
            
            // Show dashboard by default
            showSection('dashboard');
            
            // Load data for current section
            loadSectionData();
            
            // Update dashboard stats
            updateDashboardStats();
            
            console.log(`Authenticated as ${username} with ${currentClearance} clearance`);
        } else {
            alert('Invalid credentials. Access denied.');
        }
    }

    // Logout function
    function logout() {
        currentClearance = 'L1';
        currentUser = '';
        
        // Show login, hide main content
        document.getElementById('loginSection').style.display = 'flex';
        document.getElementById('mainContent').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'none';
        document.getElementById('refreshBtn').style.display = 'none';
        
        // Clear form fields
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
        // Reset clearance badge
        document.getElementById('currentClearance').textContent = 'L1';
        
        console.log('Logged out successfully');
    }

    // Update navigation visibility based on clearance
    function updateNavigationVisibility() {
        const l2Buttons = document.querySelectorAll('.l2-only');
        const l3Buttons = document.querySelectorAll('.l3-only');
        const l4Buttons = document.querySelectorAll('.l4-only');
        const l5Buttons = document.querySelectorAll('.l5-only');
        const l1PlusElements = document.querySelectorAll('.l1-plus');
        const l4PlusElements = document.querySelectorAll('.l4-plus');
        
        // Show L1+ elements for all authenticated users
        l1PlusElements.forEach(el => el.style.display = 'block');
        
        // Show L4+ elements for L4+ clearance
        if (['L4', 'L5', 'MASTER'].includes(currentClearance)) {
            l4PlusElements.forEach(el => el.style.display = 'block');
        } else {
            l4PlusElements.forEach(el => el.style.display = 'none');
        }
        
        // Show L2 buttons for L2+ clearance
        if (['L2', 'L3', 'L4', 'L5', 'MASTER'].includes(currentClearance)) {
            l2Buttons.forEach(btn => btn.style.display = 'inline-block');
        }
        
        // Show L3 buttons for L3+ clearance
        if (['L3', 'L4', 'L5', 'MASTER'].includes(currentClearance)) {
            l3Buttons.forEach(btn => btn.style.display = 'inline-block');
        }
        
        // Show L4 buttons for L4+ clearance
        if (['L4', 'L5', 'MASTER'].includes(currentClearance)) {
            l4Buttons.forEach(btn => btn.style.display = 'inline-block');
        }
        
        // Show L5 buttons for L5+ clearance
        if (['L5', 'MASTER'].includes(currentClearance)) {
            l5Buttons.forEach(btn => btn.style.display = 'inline-block');
        }
    }

    // Show different sections
    function showSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active class from all nav buttons
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => btn.classList.remove('active'));
        
        // Show selected section
        const selectedSection = document.getElementById(sectionName);
        if (selectedSection) {
            selectedSection.classList.add('active');
        }
        
        // Add active class to clicked button
        const clickedButton = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
        if (clickedButton) {
            clickedButton.classList.add('active');
        }
        
        // Handle clearance-based access control
        const clearanceRequired = getClearanceRequired(sectionName);
        if (clearanceRequired && !hasClearance(clearanceRequired)) {
            alert(`Access denied. ${clearanceRequired} clearance required.`);
            showSection('dashboard');
            return;
        }
        
        // Load data for the section
        loadSectionData();
    }

    // Load data for the current section
    function loadSectionData() {
        const activeSection = document.querySelector('.content-section.active');
        if (!activeSection) return;
        
        const sectionId = activeSection.id;
        
        switch(sectionId) {
            case 'dashboard':
                renderActivities();
                break;
            case 'personnel':
                renderPersonnel();
                break;
            case 'codex':
                renderViolations();
                break;
            case 'interrogations':
                renderInterrogations();
                break;
            case 'incidents':
                renderIncidents();
                break;
            case 'reports':
                renderReports();
                break;
            case 'operations':
                renderOperations();
                break;
        }
    }

    // Get clearance level required for a section
    function getClearanceRequired(sectionName) {
        const clearanceMap = {
            'reports': 'L2',
            'operations': 'L3',
            'classified': 'L4',
            'directorate': 'L5'
        };
        return clearanceMap[sectionName];
    }

    // Check if user has required clearance
    function hasClearance(requiredClearance) {
        if (currentClearance === 'MASTER') return true;
        
        const clearanceLevels = ['L1', 'L2', 'L3', 'L4', 'L5'];
        const userLevel = clearanceLevels.indexOf(currentClearance);
        const requiredLevel = clearanceLevels.indexOf(requiredClearance);
        return userLevel >= requiredLevel;
    }

    // Form management functions
    function showAddForm(type) {
        const formId = type + 'Form';
        const form = document.getElementById(formId);
        if (form) {
            form.style.display = 'flex';
        }
    }

    function hideForm(type) {
        const formId = type + 'Form';
        const form = document.getElementById(formId);
        if (form) {
            form.style.display = 'none';
            // Reset form
            const formElement = form.querySelector('form');
            if (formElement) {
                formElement.reset();
            }
        }
    }

    // Dashboard management
    function updateDashboardStats() {
        document.getElementById('activePersonnelCount').textContent = dashboardStats.activePersonnel;
        document.getElementById('openCasesCount').textContent = dashboardStats.openCases;
        document.getElementById('violationsCount').textContent = dashboardStats.violations;
        document.getElementById('siteStatus').textContent = dashboardStats.siteStatus;
    }

    function editStat(statType) {
        if (!['L4', 'L5', 'MASTER'].includes(currentClearance)) return;
        
        const newValue = prompt(`Enter new value for ${statType}:`);
        if (newValue !== null && newValue !== '') {
            switch(statType) {
                case 'personnel':
                    dashboardStats.activePersonnel = parseInt(newValue) || 0;
                    break;
                case 'cases':
                    dashboardStats.openCases = parseInt(newValue) || 0;
                    break;
                case 'violations':
                    dashboardStats.violations = parseInt(newValue) || 0;
                    break;
                case 'status':
                    dashboardStats.siteStatus = newValue;
                    break;
            }
            updateDashboardStats();
            saveToCloud();
            addActivity(`Dashboard stat updated: ${statType} changed to ${newValue}`);
        }
    }

    // Activity management
    function renderActivities() {
        const container = document.getElementById('activityLog');
        if (!container) return;
        
        if (activities.length === 0) {
            container.innerHTML = '<p class="no-data">No recent activity.</p>';
            return;
        }
        
        let html = '';
        activities.slice(0, 10).forEach((activity, index) => {
            html += `
                <div class="activity-item" data-id="${index}">
                    <div class="activity-info">
                        <span class="timestamp">${activity.timestamp}</span>
                        <span class="activity">${activity.message}</span>
                    </div>
                    ${['L4', 'L5', 'MASTER'].includes(currentClearance) ? `
                        <div class="activity-actions">
                            <button class="delete-btn" onclick="deleteActivity(${index})">Delete</button>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        container.innerHTML = html;
    }

    function addActivity(message) {
        const timestamp = new Date().toLocaleString();
        activities.unshift({ timestamp, message });
        if (activities.length > 50) activities.pop(); // Keep only last 50 activities
        renderActivities();
        saveToCloud();
    }

    function deleteActivity(index) {
        if (!['L4', 'L5', 'MASTER'].includes(currentClearance)) return;
        if (confirm('Delete this activity?')) {
            activities.splice(index, 1);
            renderActivities();
            saveToCloud();
        }
    }

    function addActivityForm(event) {
        event.preventDefault();
        
        const message = document.getElementById('activityMessage').value;
        if (message.trim()) {
            addActivity(message);
            hideForm('activity');
        }
    }

    // Personnel management
    function renderPersonnel() {
        const container = document.getElementById('personnelGrid');
        if (!container) return;
        
        if (personnel.length === 0) {
            container.innerHTML = '<p class="no-data">No personnel records found.</p>';
            return;
        }
        
        let html = '';
        personnel.forEach((person, index) => {
            html += `
                <div class="personnel-card" data-id="${index}">
                    <h3>${person.name}</h3>
                    <p>Clearance: ${person.clearance}</p>
                    <p>Position: ${person.position}</p>
                    <p>Status: ${person.status}</p>
                    ${person.notes ? `<p>Notes: ${person.notes}</p>` : ''}
                    ${['L4', 'L5', 'MASTER'].includes(currentClearance) ? `
                        <div class="personnel-actions">
                            <button class="edit-btn" onclick="editPersonnel(${index})">Edit</button>
                            <button class="delete-btn" onclick="deletePersonnel(${index})">Delete</button>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        container.innerHTML = html;
    }

    function addPersonnel(event) {
        event.preventDefault();
        
        const person = {
            name: document.getElementById('personnelName').value,
            clearance: document.getElementById('personnelClearance').value,
            position: document.getElementById('personnelPosition').value,
            status: document.getElementById('personnelStatus').value,
            notes: document.getElementById('personnelNotes').value
        };
        
        personnel.push(person);
        hideForm('personnel');
        renderPersonnel();
        saveToCloud();
        addActivity(`New personnel added: ${person.name} (${person.clearance})`);
        updateDashboardStats();
    }

    function editPersonnel(index) {
        const person = personnel[index];
        if (!person) return;
        
        document.getElementById('personnelName').value = person.name;
        document.getElementById('personnelClearance').value = person.clearance;
        document.getElementById('personnelPosition').value = person.position;
        document.getElementById('personnelStatus').value = person.status;
        document.getElementById('personnelNotes').value = person.notes;
        
        showAddForm('personnel');
        
        const form = document.getElementById('addPersonnelForm');
        form.onsubmit = (e) => updatePersonnel(e, index);
    }

    function updatePersonnel(event, index) {
        event.preventDefault();
        
        personnel[index] = {
            name: document.getElementById('personnelName').value,
            clearance: document.getElementById('personnelClearance').value,
            position: document.getElementById('personnelPosition').value,
            status: document.getElementById('personnelStatus').value,
            notes: document.getElementById('personnelNotes').value
        };
        
        hideForm('personnel');
        renderPersonnel();
        saveToCloud();
        addActivity(`Personnel updated: ${personnel[index].name}`);
        
        document.getElementById('addPersonnelForm').onsubmit = addPersonnel;
    }

    function deletePersonnel(index) {
        if (confirm('Are you sure you want to delete this personnel record?')) {
            const personName = personnel[index].name;
            personnel.splice(index, 1);
            renderPersonnel();
            saveToCloud();
            addActivity(`Personnel removed: ${personName}`);
        }
    }

    // Violation management
    function renderViolations() {
        const container = document.getElementById('violationCases');
        if (!container) return;
        
        if (violations.length === 0) {
            container.innerHTML = '<p class="no-data">No violations recorded.</p>';
            return;
        }
        
        let html = '<h3>Recent Violations</h3>';
        violations.forEach((violation, index) => {
            const levelClass = violation.level.toLowerCase().replace(' ', '-');
            html += `
                <div class="case-item" data-id="${index}">
                    <div class="case-info">
                        <span class="case-id">${violation.id}</span>
                        <span class="case-level ${levelClass}">${violation.level}</span>
                        <span class="case-status">${violation.status}</span>
                    </div>
                    <div class="case-actions">
                        <button class="edit-btn" onclick="editViolation(${index})">Edit</button>
                        <button class="delete-btn" onclick="deleteViolation(${index})">Delete</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    function addViolation(event) {
        event.preventDefault();
        
        const violation = {
            id: document.getElementById('violationId').value,
            level: document.getElementById('violationLevel').value,
            status: document.getElementById('violationStatus').value,
            description: document.getElementById('violationDescription').value,
            subject: document.getElementById('violationSubject').value
        };
        
        violations.push(violation);
        hideForm('violation');
        renderViolations();
        saveToCloud();
        addActivity(`New violation recorded: ${violation.id} (${violation.level})`);
        updateDashboardStats();
    }

    function editViolation(index) {
        const violation = violations[index];
        if (!violation) return;
        
        document.getElementById('violationId').value = violation.id;
        document.getElementById('violationLevel').value = violation.level;
        document.getElementById('violationStatus').value = violation.status;
        document.getElementById('violationDescription').value = violation.description;
        document.getElementById('violationSubject').value = violation.subject;
        
        showAddForm('violation');
        
        const form = document.getElementById('addViolationForm');
        form.onsubmit = (e) => updateViolation(e, index);
    }

    function updateViolation(event, index) {
        event.preventDefault();
        
        violations[index] = {
            id: document.getElementById('violationId').value,
            level: document.getElementById('violationLevel').value,
            status: document.getElementById('violationStatus').value,
            description: document.getElementById('violationDescription').value,
            subject: document.getElementById('violationSubject').value
        };
        
        hideForm('violation');
        renderViolations();
        saveToCloud();
        addActivity(`Violation updated: ${violations[index].id}`);
        
        document.getElementById('addViolationForm').onsubmit = addViolation;
    }

    function deleteViolation(index) {
        if (confirm('Are you sure you want to delete this violation?')) {
            const violationId = violations[index].id;
            violations.splice(index, 1);
            renderViolations();
            saveToCloud();
            addActivity(`Violation deleted: ${violationId}`);
        }
    }

    // Interrogation management
    function renderInterrogations() {
        const container = document.getElementById('interrogationSchedule');
        if (!container) return;
        
        if (interrogations.length === 0) {
            container.innerHTML = '<p class="no-data">No interrogations scheduled.</p>';
            return;
        }
        
        let html = '<h3>Scheduled Interrogations</h3>';
        interrogations.forEach((interrogation, index) => {
            html += `
                <div class="interrogation-item" data-id="${index}">
                    <div class="interrogation-info">
                        <span class="subject">${interrogation.subject}</span>
                        <span class="time">${interrogation.time}</span>
                        <span class="interrogator">${interrogation.interrogator}</span>
                        <span class="status">${interrogation.status}</span>
                    </div>
                    <div class="interrogation-actions">
                        <button class="edit-btn" onclick="editInterrogation(${index})">Edit</button>
                        <button class="delete-btn" onclick="deleteInterrogation(${index})">Delete</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    function addInterrogation(event) {
        event.preventDefault();
        
        const interrogation = {
            subject: document.getElementById('interrogationSubject').value,
            time: document.getElementById('interrogationTime').value,
            interrogator: document.getElementById('interrogationInterrogator').value,
            status: document.getElementById('interrogationStatus').value,
            notes: document.getElementById('interrogationNotes').value
        };
        
        interrogations.push(interrogation);
        hideForm('interrogation');
        renderInterrogations();
        saveToCloud();
        addActivity(`New interrogation scheduled: ${interrogation.subject}`);
    }

    function editInterrogation(index) {
        const interrogation = interrogations[index];
        if (!interrogation) return;
        
        document.getElementById('interrogationSubject').value = interrogation.subject;
        document.getElementById('interrogationTime').value = interrogation.time;
        document.getElementById('interrogationInterrogator').value = interrogation.interrogator;
        document.getElementById('interrogationStatus').value = interrogation.status;
        document.getElementById('interrogationNotes').value = interrogation.notes;
        
        showAddForm('interrogation');
        
        const form = document.getElementById('addInterrogationForm');
        form.onsubmit = (e) => updateInterrogation(e, index);
    }

    function updateInterrogation(event, index) {
        event.preventDefault();
        
        interrogations[index] = {
            subject: document.getElementById('interrogationSubject').value,
            time: document.getElementById('interrogationTime').value,
            interrogator: document.getElementById('interrogationInterrogator').value,
            status: document.getElementById('interrogationStatus').value,
            notes: document.getElementById('interrogationNotes').value
        };
        
        hideForm('interrogation');
        renderInterrogations();
        saveToCloud();
        addActivity(`Interrogation updated: ${interrogations[index].subject}`);
        
        document.getElementById('addInterrogationForm').onsubmit = addInterrogation;
    }

    function deleteInterrogation(index) {
        if (confirm('Are you sure you want to delete this interrogation?')) {
            const subject = interrogations[index].subject;
            interrogations.splice(index, 1);
            renderInterrogations();
            saveToCloud();
            addActivity(`Interrogation cancelled: ${subject}`);
        }
    }

    // Incident management
    function renderIncidents() {
        const container = document.getElementById('incidentLog');
        if (!container) return;
        
        if (incidents.length === 0) {
            container.innerHTML = '<p class="no-data">No incidents recorded.</p>';
            return;
        }
        
        let html = '<h3>Incident Log</h3>';
        incidents.forEach((incident, index) => {
            html += `
                <div class="incident-item" data-id="${index}">
                    <div class="incident-info">
                        <span class="incident-date">${incident.date}</span>
                        <span class="incident-type">${incident.type}</span>
                        <span class="incident-status">${incident.status}</span>
                    </div>
                    <div class="incident-actions">
                        <button class="edit-btn" onclick="editIncident(${index})">Edit</button>
                        <button class="delete-btn" onclick="deleteIncident(${index})">Delete</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    function addIncident(event) {
        event.preventDefault();
        
        const incident = {
            date: document.getElementById('incidentDate').value,
            type: document.getElementById('incidentType').value,
            status: document.getElementById('incidentStatus').value,
            description: document.getElementById('incidentDescription').value
        };
        
        incidents.push(incident);
        hideForm('incident');
        renderIncidents();
        saveToCloud();
        addActivity(`New incident reported: ${incident.type}`);
    }

    function editIncident(index) {
        const incident = incidents[index];
        if (!incident) return;
        
        document.getElementById('incidentDate').value = incident.date;
        document.getElementById('incidentType').value = incident.type;
        document.getElementById('incidentStatus').value = incident.status;
        document.getElementById('incidentDescription').value = incident.description;
        
        showAddForm('incident');
        
        const form = document.getElementById('addIncidentForm');
        form.onsubmit = (e) => updateIncident(e, index);
    }

    function updateIncident(event, index) {
        event.preventDefault();
        
        incidents[index] = {
            date: document.getElementById('incidentDate').value,
            type: document.getElementById('incidentType').value,
            status: document.getElementById('incidentStatus').value,
            description: document.getElementById('incidentDescription').value
        };
        
        hideForm('incident');
        renderIncidents();
        saveToCloud();
        addActivity(`Incident updated: ${incidents[index].type}`);
        
        document.getElementById('addIncidentForm').onsubmit = addIncident;
    }

    function deleteIncident(index) {
        if (confirm('Are you sure you want to delete this incident?')) {
            const incidentType = incidents[index].type;
            incidents.splice(index, 1);
            renderIncidents();
            saveToCloud();
            addActivity(`Incident deleted: ${incidentType}`);
        }
    }

    // Report management
    function renderReports() {
        const container = document.getElementById('reportsSection');
        if (!container) return;
        
        if (reports.length === 0) {
            container.innerHTML = '<p class="no-data">No reports available.</p>';
            return;
        }
        
        let html = '<h3>Weekly Enforcement Reports</h3>';
        reports.forEach((report, index) => {
            html += `
                <div class="report-item" data-id="${index}">
                    <div class="report-info">
                        <span class="report-id">${report.id}</span>
                        <span class="report-title">${report.title}</span>
                        <span class="report-status">${report.status}</span>
                    </div>
                    ${['L4', 'L5', 'MASTER'].includes(currentClearance) ? `
                        <div class="report-actions">
                            <button class="edit-btn" onclick="editReport(${index})">Edit</button>
                            <button class="delete-btn" onclick="deleteReport(${index})">Delete</button>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        container.innerHTML = html;
    }

    function addReport(event) {
        event.preventDefault();
        
        const report = {
            id: document.getElementById('reportId').value,
            title: document.getElementById('reportTitle').value,
            status: document.getElementById('reportStatus').value,
            type: document.getElementById('reportType').value,
            content: document.getElementById('reportContent').value
        };
        
        reports.push(report);
        hideForm('report');
        renderReports();
        saveToCloud();
        addActivity(`New report created: ${report.id}`);
    }

    function editReport(index) {
        const report = reports[index];
        if (!report) return;
        
        document.getElementById('reportId').value = report.id;
        document.getElementById('reportTitle').value = report.title;
        document.getElementById('reportStatus').value = report.status;
        document.getElementById('reportType').value = report.type;
        document.getElementById('reportContent').value = report.content;
        
        showAddForm('report');
        
        const form = document.getElementById('addReportForm');
        form.onsubmit = (e) => updateReport(e, index);
    }

    function updateReport(event, index) {
        event.preventDefault();
        
        reports[index] = {
            id: document.getElementById('reportId').value,
            title: document.getElementById('reportTitle').value,
            status: document.getElementById('reportStatus').value,
            type: document.getElementById('reportType').value,
            content: document.getElementById('reportContent').value
        };
        
        hideForm('report');
        renderReports();
        saveToCloud();
        addActivity(`Report updated: ${reports[index].id}`);
        
        document.getElementById('addReportForm').onsubmit = addReport;
    }

    function deleteReport(index) {
        if (confirm('Are you sure you want to delete this report?')) {
            const reportId = reports[index].id;
            reports.splice(index, 1);
            renderReports();
            saveToCloud();
            addActivity(`Report deleted: ${reportId}`);
        }
    }

    // Operation management
    function renderOperations() {
        const container = document.getElementById('operationsSection');
        if (!container) return;
        
        if (operations.length === 0) {
            container.innerHTML = '<p class="no-data">No operations active.</p>';
            return;
        }
        
        let html = '<h3>Active Operations</h3>';
        operations.forEach((operation, index) => {
            html += `
                <div class="operation-item" data-id="${index}">
                    <div class="operation-info">
                        <span class="op-id">${operation.id}</span>
                        <span class="op-name">${operation.name}</span>
                        <span class="op-status">${operation.status}</span>
                    </div>
                    ${['L4', 'L5', 'MASTER'].includes(currentClearance) ? `
                        <div class="operation-actions">
                            <button class="edit-btn" onclick="editOperation(${index})">Edit</button>
                            <button class="delete-btn" onclick="deleteOperation(${index})">Delete</button>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        container.innerHTML = html;
    }

    function addOperation(event) {
        event.preventDefault();
        
        const operation = {
            id: document.getElementById('operationId').value,
            name: document.getElementById('operationName').value,
            status: document.getElementById('operationStatus').value,
            type: document.getElementById('operationType').value,
            description: document.getElementById('operationDescription').value
        };
        
        operations.push(operation);
        hideForm('operation');
        renderOperations();
        saveToCloud();
        addActivity(`New operation initiated: ${operation.id}`);
    }

    function editOperation(index) {
        const operation = operations[index];
        if (!operation) return;
        
        document.getElementById('operationId').value = operation.id;
        document.getElementById('operationName').value = operation.name;
        document.getElementById('operationStatus').value = operation.status;
        document.getElementById('operationType').value = operation.type;
        document.getElementById('operationDescription').value = operation.description;
        
        showAddForm('operation');
        
        const form = document.getElementById('addOperationForm');
        form.onsubmit = (e) => updateOperation(e, index);
    }

    function updateOperation(event, index) {
        event.preventDefault();
        
        operations[index] = {
            id: document.getElementById('operationId').value,
            name: document.getElementById('operationName').value,
            status: document.getElementById('operationStatus').value,
            type: document.getElementById('operationType').value,
            description: document.getElementById('operationDescription').value
        };
        
        hideForm('operation');
        renderOperations();
        saveToCloud();
        addActivity(`Operation updated: ${operations[index].id}`);
        
        document.getElementById('addOperationForm').onsubmit = addOperation;
    }

    function deleteOperation(index) {
        if (confirm('Are you sure you want to delete this operation?')) {
            const operationId = operations[index].id;
            operations.splice(index, 1);
            renderOperations();
            saveToCloud();
            addActivity(`Operation terminated: ${operationId}`);
        }
    }

    // Cloud storage configuration
    const CLOUD_STORAGE_URL = 'https://api.jsonbin.io/v3/b/68a19cb0d0ea881f405b55ea'; // You'll need to create a JSONBin account
    const CLOUD_API_KEY = '$2a$10$2NFvkwWjgQwUldqzvMlZn.bmcwyExb44qdq3U7Q8mG6AwU39pasom'; // Your JSONBin API key

    // Cloud storage functions
    async function saveToCloud() {
        const data = {
            incidents: incidents,
            reports: reports,
            operations: operations,
            personnel: personnel,
            violations: violations,
            interrogations: interrogations,
            activities: activities,
            dashboardStats: dashboardStats,
            lastUpdated: new Date().toISOString()
        };
        
        try {
            const response = await fetch(CLOUD_STORAGE_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': CLOUD_API_KEY
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                console.log('Data saved to cloud successfully');
                // Also save to local storage as backup
                saveToLocalStorage();
            } else {
                console.error('Failed to save to cloud, using local storage only');
                saveToLocalStorage();
            }
        } catch (error) {
            console.error('Cloud save failed, using local storage:', error);
            saveToLocalStorage();
        }
    }

    async function loadFromCloud() {
        try {
            // Add cache-busting parameter to prevent browser caching
            const timestamp = Date.now();
            const url = CLOUD_STORAGE_URL + '?t=' + timestamp + '&v=' + Math.random();
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-Master-Key': CLOUD_API_KEY,
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            if (response.ok) {
                const result = await response.json();
                const data = result.record;
                
                incidents = data.incidents || [];
                reports = data.reports || [];
                operations = data.operations || [];
                personnel = data.personnel || [];
                violations = data.violations || [];
                interrogations = data.interrogations || [];
                activities = data.activities || [];
                dashboardStats = data.dashboardStats || {
                    activePersonnel: 47,
                    openCases: 12,
                    violations: 8,
                    siteStatus: 'SECURE'
                };
                
                console.log('Data loaded from cloud successfully');
            } else {
                console.log('Cloud load failed, trying local storage');
                loadFromLocalStorage();
            }
        } catch (error) {
            console.error('Cloud load failed, using local storage:', error);
            loadFromLocalStorage();
        }
    }

    // Local storage functions (as backup)
    function saveToLocalStorage() {
        localStorage.setItem('trd_incidents', JSON.stringify(incidents));
        localStorage.setItem('trd_reports', JSON.stringify(reports));
        localStorage.setItem('trd_operations', JSON.stringify(operations));
        localStorage.setItem('trd_personnel', JSON.stringify(personnel));
        localStorage.setItem('trd_violations', JSON.stringify(violations));
        localStorage.setItem('trd_interrogations', JSON.stringify(interrogations));
        localStorage.setItem('trd_activities', JSON.stringify(activities));
        localStorage.setItem('trd_dashboard_stats', JSON.stringify(dashboardStats));
    }

    function loadFromLocalStorage() {
        const savedIncidents = localStorage.getItem('trd_incidents');
        const savedReports = localStorage.getItem('trd_reports');
        const savedOperations = localStorage.getItem('trd_operations');
        const savedPersonnel = localStorage.getItem('trd_personnel');
        const savedViolations = localStorage.getItem('trd_violations');
        const savedInterrogations = localStorage.getItem('trd_interrogations');
        const savedActivities = localStorage.getItem('trd_activities');
        const savedStats = localStorage.getItem('trd_dashboard_stats');
        
        if (savedIncidents) incidents = JSON.parse(savedIncidents);
        if (savedReports) reports = JSON.parse(savedReports);
        if (savedOperations) operations = JSON.parse(savedOperations);
        if (savedPersonnel) personnel = JSON.parse(savedPersonnel);
        if (savedViolations) violations = JSON.parse(savedViolations);
        if (savedInterrogations) interrogations = JSON.parse(savedInterrogations);
        if (savedActivities) activities = JSON.parse(savedActivities);
        if (savedStats) dashboardStats = JSON.parse(savedStats);
    }

    // Manual refresh function
    async function manualRefresh() {
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.textContent = '🔄 SYNCING...';
        refreshBtn.disabled = true;
        
        try {
            // Force clear any cached data
            localStorage.clear();
            
            // Load fresh data from cloud
            await loadFromCloud();
            
            if (currentUser) {
                loadSectionData();
                updateDashboardStats();
            }
            
            refreshBtn.textContent = '✅ SYNCED';
            setTimeout(() => {
                refreshBtn.textContent = '🔄 SYNC';
                refreshBtn.disabled = false;
            }, 2000);
            
            // Show success message
            console.log('Manual sync completed successfully');
            
        } catch (error) {
            console.error('Manual sync failed:', error);
            refreshBtn.textContent = '❌ ERROR';
            setTimeout(() => {
                refreshBtn.textContent = '🔄 SYNC';
                refreshBtn.disabled = false;
            }, 2000);
        }
    }

    // Auto-refresh function to sync data every 5 seconds
    function startAutoSync() {
        // Initial sync immediately
        loadFromCloud().then(() => {
            if (currentUser) {
                loadSectionData();
                updateDashboardStats();
            }
        });
        
        // Then sync every 5 seconds
        setInterval(async () => {
            await loadFromCloud();
            // Refresh current section if user is logged in
            if (currentUser) {
                loadSectionData();
                updateDashboardStats();
            }
        }, 5000); // 5 seconds
    }

    // Add enter key support for login
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('Page loaded, initializing...');
        
        // Load data from cloud (with local fallback)
        await loadFromCloud();
        
        // Start auto-sync for real-time updates
        startAutoSync();
        
        // Add page visibility change listener for mobile
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                console.log('Page became visible, refreshing data...');
                loadFromCloud().then(() => {
                    if (currentUser) {
                        loadSectionData();
                        updateDashboardStats();
                    }
                });
            }
        });
        
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    authenticate();
                }
            });
        }
        
        // Add form submit handlers
        const incidentForm = document.getElementById('addIncidentForm');
        const reportForm = document.getElementById('addReportForm');
        const operationForm = document.getElementById('addOperationForm');
        const personnelForm = document.getElementById('addPersonnelForm');
        const violationForm = document.getElementById('addViolationForm');
        const interrogationForm = document.getElementById('addInterrogationForm');
        
        if (incidentForm) incidentForm.addEventListener('submit', addIncident);
        if (reportForm) reportForm.addEventListener('submit', addReport);
        if (operationForm) operationForm.addEventListener('submit', addOperation);
        if (personnelForm) personnelForm.addEventListener('submit', addPersonnel);
        if (violationForm) violationForm.addEventListener('submit', addViolation);
        if (interrogationForm) interrogationForm.addEventListener('submit', addInterrogation);
        
        // Add some visual effects
        const logo = document.querySelector('.logo h1');
        if (logo) {
            logo.addEventListener('mouseover', function() {
                this.style.textShadow = '0 0 20px #00ff00';
            });
            
            logo.addEventListener('mouseout', function() {
                this.style.textShadow = '0 0 10px #00ff00';
            });
        }
        
        // Add clearance badge color coding
        updateClearanceBadge();
    });

    // Update clearance badge styling
    function updateClearanceBadge() {
        const badge = document.getElementById('currentClearance');
        if (badge) {
            const colors = {
                'L1': '#666666',
                'L2': '#00ff00',
                'L3': '#ffff00',
                'L4': '#ff6600',
                'L5': '#ff0000',
                'MASTER': '#ff00ff'
            };
            
            badge.style.backgroundColor = colors[currentClearance] || '#666666';
            badge.style.color = currentClearance === 'L2' ? '#000' : '#fff';
        }
    }

    // Add some SCP-style terminal effects
    function addTerminalEffect() {
        const elements = document.querySelectorAll('.content-section');
        elements.forEach(element => {
            element.style.animation = 'fadeIn 0.5s ease-in';
        });
    }

    // CSS animation for fade in effect
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .content-section {
            animation: fadeIn 0.5s ease-in;
        }
        
        .l2-content, .l3-content, .l4-content, .l5-content {
            display: none;
        }
        
        .l2-content.active, .l3-content.active, .l4-content.active, .l5-content.active {
            display: block;
        }
    `;
    document.head.appendChild(style); 

