// renderer.js - Renderer Process
const { ipcRenderer } = require('electron');

// Listen for manual refresh
ipcRenderer.on('manual-refresh', () => {
    if (window.refreshData) {
        window.refreshData();
    }
});

// Listen for export data
ipcRenderer.on('export-data', () => {
    alert('Export feature coming soon!');
});

// Request system data
function requestSystemData() {
    ipcRenderer.send('get-system-data');
}

ipcRenderer.on('system-data-response', (event, data) => {
    console.log('Received system data:', data);
    // Update UI with data
});

// Keyboard shortcuts for Electron
document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + S untuk save/export
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        ipcRenderer.send('export-data');
    }
});
