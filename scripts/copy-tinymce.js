import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Recreate __dirname since it's not available in ESM by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Define source and destination paths
// Adjust '../' if you place this script in the root folder instead of a 'scripts' subfolder
const src = path.join(__dirname, '../node_modules/tinymce');
const dest = path.join(__dirname, '../public/assets/libs/tinymce');

try {
  console.log('⏳ Copying TinyMCE assets...');

  // 3. Use fs.cpSync (Available in Node 16.7+) for one-line recursive copy
  fs.cpSync(src, dest, { recursive: true, force: true });
  
  console.log('✅ TinyMCE assets copied successfully!');
} catch (err) {
  console.error('❌ Error copying TinyMCE assets:', err);
  process.exit(1); // Exit with error code so build pipelines fail if this fails
}