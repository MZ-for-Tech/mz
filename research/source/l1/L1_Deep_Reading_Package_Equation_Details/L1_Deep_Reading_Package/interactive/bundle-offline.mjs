import fs from 'node:fs';
const file='dist/index.html';let html=fs.readFileSync(file,'utf8');
html=html.replace(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g,(_,src)=>'<script type="module">'+fs.readFileSync('dist/'+src.replace(/^\.\//,''),'utf8').replace(/<\/script/gi,'<\\/script')+'</script>');
html=html.replace(/<link[^>]*href="([^"]+\.css)"[^>]*>/g,(_,src)=>'<style>'+fs.readFileSync('dist/'+src.replace(/^\.\//,''),'utf8')+'</style>');
fs.writeFileSync('index-offline.html',html);
fs.writeFileSync('../L1_Interactive_Figures.html',html);
// Make relative Markdown links open the ready-to-use offline viewer.
fs.writeFileSync('dist/index.html',html);
console.log('Offline viewers written; dependencies and JSON data are embedded.');
