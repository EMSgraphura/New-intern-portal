import fs from 'fs';
import path from 'path';

const files = [
  'src/pages/HR/ManagePlanner.jsx',
  'src/pages/HR/HrDashboard.jsx',
  'src/pages/HR/InterviewHistory.jsx'
];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const tags = new Set();
  const regex = /<([A-Z][a-zA-Z0-9]*)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    tags.add(match[1]);
  }
  
  // extract imports from lucide-react
  const importRegex = /import\s+{([^}]+)}\s+from\s+["']lucide-react["']/g;
  const importMatch = importRegex.exec(content);
  if (importMatch) {
    const imported = importMatch[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0]); // handle "Link as LinkIcon"
    const importedSet = new Set(imported);
    
    for (const tag of tags) {
      if (tag !== 'React' && tag !== 'Fragment' && !importedSet.has(tag) && !content.includes(`import ${tag}`)) {
        // it might be defined in the file
        if (!content.includes(`const ${tag}`) && !content.includes(`function ${tag}`) && !content.includes(`class ${tag}`)) {
           console.log(`Missing in ${file}: ${tag}`);
        }
      }
    }
  }
}
console.log("Done checking other files.");
