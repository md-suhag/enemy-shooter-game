const fs = require('fs');
const path = require('path');

const srcPlayer = 'C:/Users/suhag/.gemini/antigravity/brain/919d0145-a741-4c1a-84da-7dbdefba183a/player_ship_asset_1774778256124.png';
const srcEnemy = 'C:/Users/suhag/.gemini/antigravity/brain/919d0145-a741-4c1a-84da-7dbdefba183a/enemy_ship_asset_1774778340111.png';
const srcBg = 'C:/Users/suhag/.gemini/antigravity/brain/919d0145-a741-4c1a-84da-7dbdefba183a/space_background_1774778392046.png';

try {
  fs.copyFileSync(srcPlayer, 'public/player.png');
  fs.copyFileSync(srcEnemy, 'public/enemy.png');
  fs.copyFileSync(srcBg, 'public/background.png');
  console.log('Successfully copied premium game assets to public directory!');
} catch (e) {
  console.error('Error copying assets:', e);
}
