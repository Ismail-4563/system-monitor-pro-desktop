#!/usr/bin/env node
// system-monitor.js - Core Monitoring Logic for Desktop App

const si = require('systeminformation');
const os = require('os');
const fs = require('fs');
const path = require('path');

// ==================== CONFIGURATION ====================
const CONFIG = {
    updateInterval: 3000,
    logToFile: true,
    logPath: path.join(os.homedir(), '.system-monitor-pro', 'logs'),
    dataExportPath: path.join(os.homedir(), '.system-monitor-pro', 'exports')
};

// ==================== SYSTEM MONITORING ====================
class SystemMonitor {
    constructor(config = {}) {
        this.config = { ...CONFIG, ...config };
        this.data = null;
        this.startTime = Date.now();
        this.updateCount = 0;
        this.isRunning = false;
        this.updateInterval = null;
        this.listeners = [];
        
        console.log('🚀 System Monitor Pro Desktop Initializing...');
        
        // Setup directories
        this.setupDirectories();
    }
    
    setupDirectories() {
        // Create necessary directories
        const dirs = [
            this.config.logPath,
            this.config.dataExportPath
        ];
        
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Created directory: ${dir}`);
            }
        });
    }
    
    async start() {
        if (this.isRunning) {
            console.log('⚠️  Monitor is already running');
            return;
        }
        
        this.isRunning = true;
        console.log('▶️  Starting system monitoring...');
        
        // Initial data collection
        await this.collectData();
        
        // Start interval
        this.updateInterval = setInterval(async () => {
            await this.collectData();
        }, this.config.updateInterval);
        
        console.log(`✅ Monitoring started (interval: ${this.config.updateInterval}ms)`);
    }
    
    stop() {
        if (!this.isRunning) {
            console.log('⚠️  Monitor is not running');
            return;
        }
        
        this.isRunning = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log('⏹️  Monitoring stopped');
    }
    
    async collectData() {
        try {
            console.log(`📊 Collecting system data (${this.updateCount + 1})...`);
            
            // Collect all system data
            const [cpu, mem, temp, processes, network, disk, osInfo, battery, time] = await Promise.all([
                si.currentLoad(),
                si.mem(),
                si.cpuTemperature(),
                si.processes(),
                si.networkStats(),
                si.fsSize(),
                si.osInfo(),
                si.battery().catch(() => ({ hasBattery: false, percent: 0 })),
                si.time()
            ]);
            
            const rootDisk = disk.find(d => d.mount === '/') || disk.find(d => d.mount === 'C:\\') || disk[0] || {};
            const networkInterface = network[0] || {};
            
            this.data = {
                timestamp: new Date().toISOString(),
                timeLocal: new Date().toLocaleTimeString(),
                unixTime: time.current,
                
                // CPU Information
                cpu: {
                    load: cpu.currentLoad.toFixed(1),
                    user: cpu.currentLoadUser.toFixed(1),
                    system: cpu.currentLoadSystem.toFixed(1),
                    cores: cpu.cpus.length,
                    temperature: temp.main ? temp.main.toFixed(1) : 'N/A',
                    perCoreLoad: cpu.cpus.map((core, i) => ({
                        id: i + 1,
                        load: core.load.toFixed(1),
                        user: core.loadUser.toFixed(1),
                        system: core.loadSystem.toFixed(1)
                    }))
                },
                
                // Memory Information
                memory: {
                    total: (mem.total / 1024 / 1024 / 1024).toFixed(2),
                    used: (mem.used / 1024 / 1024 / 1024).toFixed(2),
                    free: (mem.free / 1024 / 1024 / 1024).toFixed(2),
                    usage: ((mem.used / mem.total) * 100).toFixed(1),
                    available: (mem.available / 1024 / 1024 / 1024).toFixed(2),
                    active: (mem.active / 1024 / 1024 / 1024).toFixed(2),
                    buffers: (mem.buffers / 1024 / 1024 / 1024).toFixed(2),
                    cached: (mem.cached / 1024 / 1024 / 1024).toFixed(2)
                },
                
                // Disk Information
                disk: {
                    total: (rootDisk.size / 1024 / 1024 / 1024).toFixed(2),
                    used: (rootDisk.used / 1024 / 1024 / 1024).toFixed(2),
                    free: (rootDisk.available / 1024 / 1024 / 1024).toFixed(2),
                    usage: rootDisk.use || '0.0',
                    mount: rootDisk.mount || '/',
                    type: rootDisk.type || 'Unknown',
                    filesystem: rootDisk.fs || 'Unknown'
                },
                
                // Network Information
                network: {
                    interface: networkInterface.iface || 'N/A',
                    rx_bytes: networkInterface.rx_bytes || 0,
                    tx_bytes: networkInterface.tx_bytes || 0,
                    rx_speed: networkInterface.rx_sec ? (networkInterface.rx_sec / 1024 / 1024).toFixed(2) : 0,
                    tx_speed: networkInterface.tx_sec ? (networkInterface.tx_sec / 1024 / 1024).toFixed(2) : 0,
                    rx_errors: networkInterface.rx_errors || 0,
                    tx_errors: networkInterface.tx_errors || 0,
                    operational: networkInterface.operstate || 'unknown'
                },
                
                // Processes Information
                processes: {
                    total: processes.all,
                    running: processes.running,
                    sleeping: processes.sleeping,
                    stopped: processes.stopped,
                    zombie: processes.zombie,
                    list: processes.list.slice(0, 10).map(p => ({
                        pid: p.pid,
                        name: p.name,
                        cpu: p.cpu,
                        mem: p.mem,
                        state: p.state
                    }))
                },
                
                // Battery Information
                battery: {
                    hasBattery: battery.hasBattery,
                    percent: battery.percent,
                    isCharging: battery.isCharging,
                    timeRemaining: battery.timeRemaining
                },
                
                // System Information
                system: {
                    hostname: osInfo.hostname,
                    platform: osInfo.platform,
                    distro: osInfo.distro,
                    release: osInfo.release,
                    arch: osInfo.arch,
                    kernel: osInfo.kernel,
                    uptime: Math.floor(os.uptime() / 3600) + 'h ' + 
                            Math.floor((os.uptime() % 3600) / 60) + 'm',
                    loggedInUsers: osInfo.loggedIn || 1
                },
                
                // Performance metrics
                performance: {
                    cpuLoadStatus: this.getLoadStatus(cpu.currentLoad),
                    memoryStatus: this.getMemoryStatus(mem.used / mem.total * 100),
                    diskStatus: this.getDiskStatus(parseFloat(rootDisk.use || 0)),
                    networkStatus: this.getNetworkStatus(networkInterface)
                },
                
                // Application metrics
                application: {
                    updateCount: this.updateCount,
                    monitorUptime: this.getUptime(),
                    isRunning: this.isRunning,
                    lastUpdate: Date.now()
                }
            };
            
            // Log to file if enabled
            if (this.config.logToFile) {
                this.logToFile();
            }
            
            // Notify listeners
            this.notifyListeners();
            
            this.updateCount++;
            console.log(`✅ Data collected successfully`);
            return this.data;
            
        } catch (error) {
            console.error('❌ Error collecting data:', error.message);
            return this.getFallbackData();
        }
    }
    
    getLoadStatus(load) {
        if (load > 85) return { level: 'critical', color: '#ef233c', label: 'Critical' };
        if (load > 70) return { level: 'high', color: '#f72585', label: 'High' };
        if (load > 50) return { level: 'medium', color: '#ffe66d', label: 'Medium' };
        return { level: 'normal', color: '#4cc9f0', label: 'Normal' };
    }
    
    getMemoryStatus(usage) {
        if (usage > 90) return { level: 'critical', color: '#ef233c', label: 'Critical' };
        if (usage > 80) return { level: 'high', color: '#f72585', label: 'High' };
        if (usage > 70) return { level: 'medium', color: '#ffe66d', label: 'Medium' };
        return { level: 'normal', color: '#4cc9f0', label: 'Normal' };
    }
    
    getDiskStatus(usage) {
        if (usage > 95) return { level: 'critical', color: '#ef233c', label: 'Critical' };
        if (usage > 85) return { level: 'high', color: '#f72585', label: 'High' };
        if (usage > 75) return { level: 'medium', color: '#ffe66d', label: 'Medium' };
        return { level: 'normal', color: '#4cc9f0', label: 'Normal' };
    }
    
    getNetworkStatus(network) {
        if (network.rx_errors > 0 || network.tx_errors > 0) {
            return { level: 'error', color: '#ef233c', label: 'Errors' };
        }
        if (network.operstate === 'up') {
            return { level: 'normal', color: '#4cc9f0', label: 'Active' };
        }
        return { level: 'down', color: '#adb5bd', label: 'Inactive' };
    }
    
    getFallbackData() {
        const cpus = os.cpus();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        
        return {
            timestamp: new Date().toISOString(),
            timeLocal: new Date().toLocaleTimeString(),
            
            cpu: {
                load: '0.0',
                user: '0.0',
                system: '0.0',
                cores: cpus.length,
                temperature: 'N/A',
                perCoreLoad: cpus.map((core, i) => ({
                    id: i + 1,
                    load: '0.0',
                    user: '0.0',
                    system: '0.0'
                }))
            },
            
            memory: {
                total: (totalMem / 1024 / 1024 / 1024).toFixed(2),
                used: (usedMem / 1024 / 1024 / 1024).toFixed(2),
                free: (freeMem / 1024 / 1024 / 1024).toFixed(2),
                usage: ((usedMem / totalMem) * 100).toFixed(1),
                available: (freeMem / 1024 / 1024 / 1024).toFixed(2)
            },
            
            disk: {
                total: '0.00',
                used: '0.00',
                free: '0.00',
                usage: '0.0',
                mount: '/',
                type: 'Unknown'
            },
            
            network: {
                interface: 'N/A',
                rx_bytes: 0,
                tx_bytes: 0,
                rx_speed: 0,
                tx_speed: 0
            },
            
            processes: {
                total: 0,
                running: 0,
                sleeping: 0
            },
            
            battery: {
                hasBattery: false,
                percent: 0,
                isCharging: false
            },
            
            system: {
                hostname: os.hostname(),
                platform: os.platform(),
                distro: 'Unknown',
                release: os.release(),
                arch: os.arch(),
                kernel: 'Unknown',
                uptime: '0h 0m'
            },
            
            application: {
                updateCount: this.updateCount,
                monitorUptime: this.getUptime(),
                isRunning: this.isRunning,
                lastUpdate: Date.now()
            }
        };
    }
    
    getUptime() {
        const uptime = Date.now() - this.startTime;
        const hours = Math.floor(uptime / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    
    logToFile() {
        try {
            const logFile = path.join(
                this.config.logPath, 
                `monitor-${new Date().toISOString().split('T')[0]}.log`
            );
            
            const logEntry = {
                timestamp: new Date().toISOString(),
                data: this.data
            };
            
            fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
        } catch (error) {
            console.error('Error writing log:', error.message);
        }
    }
    
    exportData(format = 'json') {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const exportFile = path.join(
                this.config.dataExportPath,
                `export-${timestamp}.${format}`
            );
            
            let dataToExport;
            if (format === 'json') {
                dataToExport = JSON.stringify(this.data, null, 2);
            } else if (format === 'csv') {
                dataToExport = this.convertToCSV();
            } else {
                dataToExport = JSON.stringify(this.data);
            }
            
            fs.writeFileSync(exportFile, dataToExport);
            console.log(`✅ Data exported to: ${exportFile}`);
            return exportFile;
        } catch (error) {
            console.error('Error exporting data:', error.message);
            return null;
        }
    }
    
    convertToCSV() {
        if (!this.data) return '';
        
        const data = this.data;
        const headers = ['Metric', 'Value', 'Unit'];
        const rows = [];
        
        // CPU
        rows.push(['CPU Load', data.cpu.load, '%']);
        rows.push(['CPU User', data.cpu.user, '%']);
        rows.push(['CPU System', data.cpu.system, '%']);
        rows.push(['CPU Cores', data.cpu.cores, 'cores']);
        rows.push(['CPU Temperature', data.cpu.temperature, '°C']);
        
        // Memory
        rows.push(['Memory Total', data.memory.total, 'GB']);
        rows.push(['Memory Used', data.memory.used, 'GB']);
        rows.push(['Memory Free', data.memory.free, 'GB']);
        rows.push(['Memory Usage', data.memory.usage, '%']);
        
        // Disk
        rows.push(['Disk Total', data.disk.total, 'GB']);
        rows.push(['Disk Used', data.disk.used, 'GB']);
        rows.push(['Disk Free', data.disk.free, 'GB']);
        rows.push(['Disk Usage', data.disk.usage, '%']);
        
        // Network
        rows.push(['Network Download Speed', data.network.rx_speed, 'MB/s']);
        rows.push(['Network Upload Speed', data.network.tx_speed, 'MB/s']);
        
        // Processes
        rows.push(['Total Processes', data.processes.total, '']);
        rows.push(['Running Processes', data.processes.running, '']);
        
        // Convert to CSV
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        return csvContent;
    }
    
    // Event listener pattern
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }
    
    notifyListeners() {
        this.listeners.forEach(listener => {
            try {
                listener(this.data);
            } catch (error) {
                console.error('Error in listener:', error);
            }
        });
    }
    
    getStatus() {
        return {
            isRunning: this.isRunning,
            updateCount: this.updateCount,
            uptime: this.getUptime(),
            lastUpdate: this.data ? this.data.timestamp : null,
            nextUpdateIn: this.isRunning ? this.config.updateInterval : 0
        };
    }
}

// ==================== EXPORT ====================
// Hanya export SystemMonitor class
module.exports = SystemMonitor;

// HAPUS semua kode di bawah ini jika ada:
// - WebDashboard class
// - main() function
// - pemanggilan if (require.main === module)
