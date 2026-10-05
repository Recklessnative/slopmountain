// Builds dist/: joins src/game/*.js (in file-name order) into one script, inlines the voice manifest, copies assets.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname, out = join(root, 'dist');
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });

const dir = join(root, 'src/game');
const parts = readdirSync(dir).filter(f => f.endsWith('.js')).sort()
  .map(f => `// ---- ${f} ----\n` + readFileSync(join(dir, f), 'utf8'));
const vo = JSON.stringify(JSON.parse(readFileSync(join(root, 'src/vo-manifest.json'), 'utf8')));
let game = `(() => {\n${parts.join('\n')}})();\n`;
if (!game.includes('/*VO*/{}/*VO*/')) throw new Error('voice manifest placeholder missing');
game = game.replace('/*VO*/{}/*VO*/', `/*VO*/${vo}/*VO*/`);

writeFileSync(join(out, 'game.js'), game);
cpSync(join(root, 'src/index.html'), join(out, 'index.html'));
cpSync(join(root, 'src/styles.css'), join(out, 'styles.css'));
cpSync(join(root, 'public'), out, { recursive: true });
console.log(`built dist/ from ${parts.length} source files`);
