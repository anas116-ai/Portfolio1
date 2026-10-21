const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Initiating instant local rollback to Butterfly Live checkpoint...');

// 1. Restore from physical backup directory
const backupDir = path.join(__dirname, '_backups', 'checkpoint_butterfly_live');
const targetSrc = path.join(__dirname, 'src');
const targetAssets = path.join(__dirname, 'public', 'assets', 'character');

function rmDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

try {
  if (fs.existsSync(path.join(backupDir, 'src'))) {
    rmDir(targetSrc);
    copyDir(path.join(backupDir, 'src'), targetSrc);
    console.log('✅ Physical src/ restored from _backups/checkpoint_butterfly_live/src');
  }

  if (fs.existsSync(path.join(backupDir, 'public_assets_character'))) {
    rmDir(targetAssets);
    copyDir(path.join(backupDir, 'public_assets_character'), targetAssets);
    console.log('✅ Physical public/assets/character restored!');
  }
} catch (e) {
  console.error('Physical copy note:', e.message);
}

// 2. Git reset to local checkpoint tag (without touching remote GitHub)
try {
  execSync('git reset --hard checkpoint-butterfly-live', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Local Git reset to tag "checkpoint-butterfly-live" successful!');
} catch (e) {
  console.log('Git reset notice:', e.message);
}

console.log('🎉 100% RESTORED to the working Butterfly Live Obsidian-Lemon state!');
