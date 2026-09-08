// Data structure
const checklistData = {
    locations: [
        // Template location structure - Add your locations here
        // {
        //     id: 'limgrave',
        //     name: 'Limgrave',
        //     bosses: [
        //         { id: 'godrick', name: 'Godrick the Grafted', completed: false }
        //     ],
        //     treasures: [],
        //     items: [],
        //     npcs: []
        // }
    ]
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderLocations();
    setupEventListeners();
    updateOverallProgress();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('resetBtn').addEventListener('click', resetAllData);
    document.getElementById('exportBtn').addEventListener('click', exportData);

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });
}

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem('eldenRingChecklist');
    if (saved) {
        checklistData.locations = JSON.parse(saved);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('eldenRingChecklist', JSON.stringify(checklistData.locations));
    updateOverallProgress();
}

// Render all locations
function renderLocations() {
    const container = document.getElementById('locationsContainer');
    container.innerHTML = '';

    if (checklistData.locations.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">No locations added yet. Add locations to app.js to get started!</div>';
        return;
    }

    checklistData.locations.forEach(location => {
        const card = createLocationCard(location);
        container.appendChild(card);
    });
}

// Create location card
function createLocationCard(location) {
    const card = document.createElement('div');
    card.className = 'location-card';
    card.onclick = () => openLocationModal(location);

    const totalItems = getTotalItems(location);
    const completedItems = getCompletedItems(location);
    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    card.innerHTML = `
        <div class="location-header">
            <span class="location-name">${location.name}</span>
            <span class="location-badge">${percentage}%</span>
        </div>
        <div class="location-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
        </div>
        <div class="location-stats">
            <div class="stat-item">
                <div class="stat-item-label">Bosses</div>
                <div class="stat-item-value">${getCompletedByType(location, 'bosses')}/${location.bosses.length}</div>
            </div>
            <div class="stat-item">
                <div class="stat-item-label">Treasures</div>
                <div class="stat-item-value">${getCompletedByType(location, 'treasures')}/${location.treasures.length}</div>
            </div>
            <div class="stat-item">
                <div class="stat-item-label">Items</div>
                <div class="stat-item-value">${getCompletedByType(location, 'items')}/${location.items.length}</div>
            </div>
            <div class="stat-item">
                <div class="stat-item-label">NPCs</div>
                <div class="stat-item-value">${getCompletedByType(location, 'npcs')}/${location.npcs.length}</div>
            </div>
        </div>
    `;

    return card;
}

// Get total items for a location
function getTotalItems(location) {
    return location.bosses.length + location.treasures.length + location.items.length + location.npcs.length;
}

// Get completed items count
function getCompletedItems(location) {
    return (
        location.bosses.filter(b => b.completed).length +
        location.treasures.filter(t => t.completed).length +
        location.items.filter(i => i.completed).length +
        location.npcs.filter(n => n.completed).length
    );
}

// Get completed items by type
function getCompletedByType(location, type) {
    return location[type].filter(item => item.completed).length;
}

// Open location modal
function openLocationModal(location) {
    const modal = document.getElementById('locationModal');
    document.getElementById('modalTitle').textContent = location.name;

    renderModalTabs(location);

    modal.classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('locationModal').classList.remove('active');
}

// Render modal tabs content
function renderModalTabs(location) {
    renderItemsList(location.bosses, 'bossesList', location.id);
    renderItemsList(location.treasures, 'treasuresList', location.id);
    renderItemsList(location.items, 'itemsList', location.id);
    renderItemsList(location.npcs, 'npcsList', location.id);
}

// Render items list
function renderItemsList(items, containerId, locationId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No items yet</p>';
        return;
    }

    items.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = `item ${item.completed ? 'completed' : ''}`;

        itemEl.innerHTML = `
            <input type="checkbox" class="item-checkbox" ${item.completed ? 'checked' : ''} 
                   onchange="toggleItem(this, '${locationId}')">
            <label class="item-label">${item.name}</label>
        `;

        itemEl.querySelector('input').dataset.itemId = item.id;

        container.appendChild(itemEl);
    });
}

// Toggle item completion
function toggleItem(checkbox, locationId) {
    const itemId = checkbox.dataset.itemId;

    const location = checklistData.locations.find(l => l.id === locationId);
    if (!location) return;

    // Find and update the item
    ['bosses', 'treasures', 'items', 'npcs'].forEach(type => {
        const item = location[type].find(i => i.id === itemId);
        if (item) {
            item.completed = checkbox.checked;
        }
    });

    saveData();
    renderLocations();
}

// Switch tabs
function switchTab(tabName) {
    // Remove active from all tabs and contents
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active to selected
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// Update overall progress
function updateOverallProgress() {
    let totalItems = 0;
    let completedItems = 0;

    checklistData.locations.forEach(location => {
        totalItems += getTotalItems(location);
        completedItems += getCompletedItems(location);
    });

    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    const progressFill = document.getElementById('overallProgress');
    const percentageText = document.getElementById('overallPercentage');

    if (progressFill && percentageText) {
        progressFill.style.width = percentage + '%';
        percentageText.textContent = percentage + '%';
    }
}

// Reset all data
function resetAllData() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
        checklistData.locations.forEach(location => {
            ['bosses', 'treasures', 'items', 'npcs'].forEach(type => {
                location[type].forEach(item => {
                    item.completed = false;
                });
            });
        });
        saveData();
        renderLocations();
        closeModal();
    }
}

// Export data as JSON
function exportData() {
    const dataStr = JSON.stringify(checklistData.locations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `elden-ring-checklist-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('locationModal');
    if (e.target === modal) {
        closeModal();
    }
});
