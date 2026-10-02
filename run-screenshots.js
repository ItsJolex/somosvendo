const { spawn } = require('child_process');
const { chromium } = require('playwright');
const path = require('path');

// Start HTTP server
const server = spawn('python3', ['-m', 'http.server', '8085', '--bind', '0.0.0.0', '--directory', '/home/joel/Proyectos/Vendo'], {
  cwd: '/home/joel/Proyectos/Vendo',
  stdio: ['ignore', 'pipe', 'pipe']
});

server.stdout.on('data', (data) => {
  console.log('[Server]', data.toString().trim());
});

server.stderr.on('data', (data) => {
  console.error('[Server Error]', data.toString().trim());
});

// Wait for server to start
setTimeout(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    
    // Desktop
    const desktopPage = await browser.newPage();
    await desktopPage.setViewportSize({ width: 1280, height: 800 });
    await desktopPage.goto('http://localhost:8085/index.html', { waitUntil: 'networkidle', timeout: 30000 });
    await desktopPage.waitForTimeout(1000);
    await desktopPage.screenshot({ path: path.join(__dirname, 'screenshot-desktop-full.png'), fullPage: true });
    console.log('✅ Desktop screenshot saved');
    
    // Mobile
    const mobilePage = await browser.newPage();
    await mobilePage.setViewportSize({ width: 375, height: 812 });
    await mobilePage.goto('http://localhost:8085/index.html', { waitUntil: 'networkidle', timeout: 30000 });
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({ path: path.join(__dirname, 'screenshot-mobile-full.png'), fullPage: true });
    console.log('✅ Mobile screenshot saved');
    
    // Check for console errors on desktop
    const errors = [];
    desktopPage.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    desktopPage.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await desktopPage.reload({ waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(500);
    
    if (errors.length > 0) {
      console.log('⚠️ Console errors found:');
      errors.forEach(e => console.log('  -', e));
    } else {
      console.log('✅ No console errors');
    }
    
    // Check favicon loads
    const favicon = await desktopPage.$('link[rel="icon"][sizes="32x32"]');
    if (favicon) {
      const href = await favicon.getAttribute('href');
      console.log('✅ Favicon link found:', href);
    }
    
    await browser.close();
    console.log('✅ All screenshots completed');
    
    server.kill();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    server.kill();
    process.exit(1);
  }
}, 3000);