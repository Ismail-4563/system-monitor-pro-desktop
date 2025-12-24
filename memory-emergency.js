// memory-emergency.js
const si = require('systeminformation');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class MemoryEmergency {
    constructor() {
        this.threshold = 85; // Percentage
        this.checkInterval = 10000; // 10 seconds
        this.logFile = path.join(os.homedir(), '.system-monitor-pro', 'memory-alerts.log');
    }
    
    async startMonitoring() {
        console.log('🚨 Starting emergency memory monitor...');
        
        setInterval(async () => {
            await this.checkMemory();
        }, this.checkInterval);
    }
    
    async checkMemory() {
        try {
            const mem = await si.mem();
            const usage = (mem.used / mem.total) * 100;
            
            console.log(`📊 Memory Usage: ${usage.toFixed(1)}%`);
            
            if (usage > this.threshold) {
                await this.handleEmergency(usage, mem);
            }
            
        } catch (error) {
            console.error('Error checking memory:', error);
        }
    }
    
    async handleEmergency(usage, mem) {
        const timestamp = new Date().toISOString();
        const freeGB = (mem.free / 1024 / 1024 / 1024).toFixed(2);
        
        const alertMessage = `[${timestamp}] ⚠️ MEMORY CRITICAL: ${usage.toFixed(1)}% used, only ${freeGB}GB free`;
        
        console.log(alertMessage);
        this.logAlert(alertMessage);
        
        // Take emergency actions based on severity
        if (usage > 90) {
            await this.criticalActions();
        } else if (usage > 85) {
            await this.warningActions();
        }
    }
    
    async criticalActions() {
        console.log('🚨 Taking CRITICAL memory recovery actions...');
        
        // 1. Clear system cache (Linux)
        if (process.platform === 'linux') {
            exec('sudo sync && echo 3 | sudo tee /proc/sys/vm/drop_caches', (err) => {
                if (!err) console.log('✅ System cache cleared');
            });
        }
        
        // 2. Kill known memory-hog processes
        const hogs = ['chrome', 'firefox', 'code', 'slack', 'discord'];
        hogs.forEach(app => {
            exec(`pkill -f ${app}`, () => {
                console.log(`⚠️  Attempted to kill ${app}`);
            });
        });
        
        // 3. Restart memory-intensive services
        const services = ['docker', 'mysql', 'postgresql', 'mongod'];
        services.forEach(service => {
            exec(`systemctl is-active --quiet ${service} && sudo systemctl restart ${service}`, () => {
                console.log(`⚠️  Attempted to restart ${service}`);
            });
        });
    }
    
    async warningActions() {
        console.log('⚠️  Taking WARNING memory recovery actions...');
        
        // Show notification
        if (process.platform === 'linux') {
            exec('notify-send "Memory Warning" "Memory usage is high. Consider closing some applications." --urgency=critical');
        }
        
        // Log top memory processes
        exec('ps aux --sort=-%mem | head -6', (err, stdout) => {
            if (!err) {
                console.log('📋 Top memory-consuming processes:');
                console.log(stdout);
                this.logAlert('Top processes:\n' + stdout);
            }
        });
    }
    
    logAlert(message) {
        fs.appendFileSync(this.logFile, message + '\n');
    }
    
    getMemoryTips() {
        return [
            '1. Close unnecessary browser tabs',
            '2. Restart memory-intensive applications',
            '3. Check for memory leaks in applications',
            '4. Consider adding more RAM',
            '5. Reduce system visual effects',
            '6. Disable unnecessary startup programs',
            '7. Use lighter applications alternatives',
            '8. Monitor with: `htop` or `gnome-system-monitor`'
        ];
    }
}

// Export and run if direct
module.exports = MemoryEmergency;

if (require.main === module) {
    const monitor = new MemoryEmergency();
    monitor.startMonitoring();
}
