const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'errors_v2.txt');
const buffer = fs.readFileSync(filePath);
let content = '';

try {
    content = buffer.toString('utf16le');
} catch (e) {
    content = buffer.toString('utf8');
}

// If content doesn't look like UTF16, it might be UTF8 (powershell 7+)
if (!content.includes('src/') && buffer.toString('utf8').includes('src/')) {
    content = buffer.toString('utf8');
}

const lines = content.split('\n');
const uniqueFiles = new Set();

lines.forEach(line => {
    const match = line.match(/^([^(]+\.tsx?)/);
    if (match && match[1].startsWith('src/')) {
        uniqueFiles.add(match[1]);
    }
});

uniqueFiles.forEach(file => {
    console.log('FILE:' + file);
});
console.log('COUNT:' + uniqueFiles.size);
