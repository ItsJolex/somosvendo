const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true });
  
  // Desktop
  const desktopPage = await browser.newPage();
  await desktopPage.setViewportSize({ width: 1280, height: 800 });
  await desktopPage.goto('http://localhost:8085/index.html', { waitUntil: 'networkidle', timeout: 30000 });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({ path: 'screenshot-desktop-full.png', fullPage: true });
  console.log('✅ Desktop screenshot saved');
  
  // Mobile
  const mobilePage = await browser.newPage();
  await mobilePage.setViewportSize({ width: 375, height: 812 });
  await mobilePage.goto('http://localhost:8085/index.html', { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: 'screenshot-mobile-full.png', fullPage: true });
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
}

takeScreenshots().catch(console.error);