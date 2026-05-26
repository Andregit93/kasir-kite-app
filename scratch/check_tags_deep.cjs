
const fs = require('fs');
const content = fs.readFileSync('resources/js/Pages/Admin/AdminDashboard.jsx', 'utf8');

let stack = [];
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let regex = /<div[ >]|<\/div>/g;
    let match;
    
    while ((match = regex.exec(line)) !== null) {
        let tag = match[0];
        if (tag.startsWith('<div')) {
            let restOfLine = line.substring(match.index);
            let endOfTag = restOfLine.indexOf('>');
            let tagContent = restOfLine.substring(0, endOfTag + 1);
            if (tagContent.endsWith('/>')) continue;
            
            stack.push({ line: i + 1, tag: tagContent });
        } else {
            if (stack.length === 0) {
                console.log(`EXTRA CLOSE at line ${i + 1}`);
            } else {
                stack.pop();
            }
        }
    }
}

console.log("\nFINAL STACK:");
stack.forEach(s => console.log(`[Line ${s.line}] ${s.tag}`));
