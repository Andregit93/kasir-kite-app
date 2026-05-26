
const fs = require('fs');
const content = fs.readFileSync('resources/js/Pages/Admin/AdminDashboard.jsx', 'utf8');

let depth = 0;
let stack = [];
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Simple regex to find <div or </div>
    // We ignore <div ... /> (self-closing)
    let regex = /<div[ >]|<\/div>/g;
    let match;
    
    while ((match = regex.exec(line)) !== null) {
        let tag = match[0];
        if (tag.startsWith('<div')) {
            // Check if this specific tag is self-closing
            // We look at the substring starting from the match
            let restOfLine = line.substring(match.index);
            let endOfTag = restOfLine.indexOf('>');
            let tagContent = restOfLine.substring(0, endOfTag + 1);
            if (tagContent.endsWith('/>')) {
                // Self-closing div, ignore
                continue;
            }
            depth++;
            stack.push({ line: i + 1, content: tagContent });
        } else {
            depth--;
            if (depth < 0) {
                console.log(`[Line ${i + 1}] EXTRA CLOSING TAG: ${line.trim()}`);
                depth = 0; // Reset depth to continue
            } else {
                stack.pop();
            }
        }
    }
}

if (stack.length > 0) {
    console.log("\nUNCLOSED TAGS:");
    stack.forEach(s => console.log(`[Line ${s.line}] Open tag: ${s.content}`));
} else {
    console.log("\nSUCCESS: All tags are balanced.");
}
