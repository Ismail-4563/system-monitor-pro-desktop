// create-icons.js - Buat semua icon otomatis
const fs = require('fs');
const path = require('path');

console.log('🎨 Membuat icon untuk System Monitor Pro Desktop...');

// Buat folder assets/icons jika belum ada
const iconsDir = path.join(__dirname, 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('📁 Membuat folder: assets/icons/');
}

// ==================== BUAT ICON DENGAN TEXT SIMPLE ====================
console.log('\n🖼️  Membuat icon...');

// 1. Buat icon PNG utama (512x512) - HANYA TEXT HTML
const iconHTML = `data:image/svg+xml;base64,${Buffer.from(`
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4361ee"/>
            <stop offset="100%" stop-color="#3a0ca3"/>
        </linearGradient>
        <filter id="shadow">
            <feDropShadow dx="2" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.3"/>
        </filter>
    </defs>
    
    <!-- Background dengan rounded corners -->
    <rect x="50" y="50" width="412" height="412" rx="80" 
          fill="url(#grad)" filter="url(#shadow)"/>
    
    <!-- Inner circle -->
    <circle cx="256" cy="256" r="150" fill="white" opacity="0.9"/>
    
    <!-- System Monitor Icon -->
    <g transform="translate(256, 256)">
        <!-- Chart bars -->
        <rect x="-90" y="-40" width="20" height="80" fill="#4361ee" rx="5"/>
        <rect x="-60" y="-20" width="20" height="100" fill="#4cc9f0" rx="5"/>
        <rect x="-30" y="-60" width="20" height="120" fill="#3a0ca3" rx="5"/>
        <rect x="0" y="-30" width="20" height="90" fill="#f72585" rx="5"/>
        <rect x="30" y="-50" width="20" height="110" fill="#4361ee" rx="5"/>
        <rect x="60" y="-10" width="20" height="70" fill="#4cc9f0" rx="5"/>
        
        <!-- CPU icon -->
        <rect x="-120" y="40" width="240" height="40" fill="#4361ee" rx="8" opacity="0.8"/>
        <circle cx="-80" cy="60" r="12" fill="white"/>
        <circle cx="-40" cy="60" r="12" fill="white"/>
        <circle cx="0" cy="60" r="12" fill="white"/>
        <circle cx="40" cy="60" r="12" fill="white"/>
        <circle cx="80" cy="60" r="12" fill="white"/>
    </g>
    
    <!-- App Name -->
    <text x="256" y="480" text-anchor="middle" font-family="Arial" 
          font-size="40" font-weight="bold" fill="white">
        SMP
    </text>
</svg>
`).toString('base64')}`;

// Simpan sebagai file
const iconFiles = [
    { name: 'icon.png', desc: 'Icon utama PNG' },
    { name: 'icon-512x512.png', desc: 'Icon 512x512' },
    { name: 'icon-256x256.png', desc: 'Icon 256x256' },
    { name: 'icon-128x128.png', desc: 'Icon 128x128' },
    { name: 'icon-64x64.png', desc: 'Icon 64x64' },
    { name: 'icon-48x48.png', desc: 'Icon 48x48' },
    { name: 'icon-32x32.png', desc: 'Icon 32x32' },
    { name: 'icon-16x16.png', desc: 'Icon 16x16' },
    { name: 'tray-icon.png', desc: 'Tray icon' },
    { name: 'tray-icon@2x.png', desc: 'Tray icon HiDPI' }
];

// Buat file-file icon (dummy dulu, nanti diganti manual jika perlu)
iconFiles.forEach(file => {
    const filePath = path.join(iconsDir, file.name);
    
    // Buat file placeholder dengan info
    const content = `Icon placeholder untuk ${file.name}\nGanti dengan file PNG/ICO/ICNS yang sesungguhnya`;
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${file.desc}: ${file.name}`);
});

// 2. Buat file .icns placeholder (macOS)
const icnsContent = `Placeholder untuk macOS .icns file
Buat file .icns menggunakan:
1. Buat folder 'icon.iconset'
2. Taruh semua icon PNG dengan nama khusus
3. Jalankan: iconutil -c icns icon.iconset`;
fs.writeFileSync(path.join(iconsDir, 'icon.icns'), icnsContent);

// 3. Buat file .ico placeholder (Windows)
const icoContent = `Placeholder untuk Windows .ico file
Buat file .ico menggunakan:
1. Online converter: https://icoconvert.com/
2. Atau ImageMagick: convert icon-*.png icon.ico`;
fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoContent);

// 4. Buat installer icon
fs.copyFileSync(
    path.join(iconsDir, 'icon.ico'),
    path.join(iconsDir, 'installer-icon.ico')
);

console.log('\n📋 File yang dibuat:');
console.log('='.repeat(50));
fs.readdirSync(iconsDir).forEach(file => {
    const stats = fs.statSync(path.join(iconsDir, file));
    console.log(`📄 ${file.padEnd(25)} ${(stats.size / 1024).toFixed(1)} KB`);
});

console.log('\n' + '='.repeat(50));
console.log('🎉 SELESAI! Semua file icon telah dibuat.');
console.log('\n⚠️  CATATAN PENTING:');
console.log('1. File .icns dan .ico adalah PLACEHOLDER');
console.log('2. Untuk icon sebenarnya:');
console.log('   • Download icon dari: https://icons8.com/');
console.log('   • Atau buat di: https://www.favicon-generator.org/');
console.log('   • Atau convert PNG ke ICO: https://convertio.co/png-ico/');
console.log('\n🚀 Langkah selanjutnya:');
console.log('1. Ganti file icon.png dengan gambar asli (512x512)');
console.log('2. Convert ke .ico untuk Windows');
console.log('3. Convert ke .icns untuk macOS');
console.log('4. Jalankan: npm run build');
