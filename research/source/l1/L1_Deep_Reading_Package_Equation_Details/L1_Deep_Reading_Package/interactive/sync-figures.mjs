import fs from 'node:fs';
const manifest=JSON.parse(fs.readFileSync('public/manifest.json','utf8'));
const figures=manifest.figures.map(f=>JSON.parse(fs.readFileSync('public/'+f.file,'utf8')));
fs.writeFileSync('src/figures.generated.json',JSON.stringify(figures));
console.log(`Synchronized ${figures.length} figure configurations.`);
