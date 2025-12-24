// build.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building System Monitor Desktop...');

// Clean dist folder
if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
}

// Build based on platform
const platform = process.platform;
let buildCommand = 'npm run build';

if (platform === 'win32') {
    buildCommand = 'npm run build:win';
} else if (platform === 'darwin') {
    buildCommand = 'npm run build:mac';
} else {
    buildCommand = 'npm run build:linux';
}

exec(buildCommand, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Build error: ${error}`);
        return;
    }
    
    console.log(`✅ Build completed for ${platform}`);
    console.log(stdout);
    
    if (stderr) {
        console.error(stderr);
    }
    
    // Show output location
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
        const files = fs.readdirSync(distPath);
        console.log('\n📦 Output files:');
        files.forEach(file => {
            console.log(`   ${file}`);
        });
    }
});
