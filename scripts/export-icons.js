#!/usr/bin/env node

/**
 * Export Central Icons as SVG files for use in Mintlify docs.
 * 
 * Usage: CENTRAL_LICENSE_KEY=your-key node scripts/export-icons.js
 * 
 * Icons exported with:
 * - Style: round
 * - Fill: outlined
 * - Radius: 3 (as specified in design requirements)
 * - Stroke: 1.5 (as specified in design requirements)
 */

const fs = require('fs');
const path = require('path');

// Icons to export based on the Figma design mapping
const ICONS_TO_EXPORT = [
  // Overview section
  'IconSquareInfo',        // What is Grid?
  'IconBlocks',            // Capabilities
  'IconLightBulb',         // Use cases
  'IconBubbleQuestion',    // FAQ (using BubbleQuestion instead of CircleQuestionmark)
  
  // Quickstart section  
  'IconPaperPlaneTopRight', // Send a payout
  'IconArrowInbox',         // On-ramp to crypto
  'IconGift1',              // Send Bitcoin rewards
  'IconAt',                 // Send to UMA address
  
  // Core concepts section
  'IconAgent',              // Entities & Relationships
  'IconReceiptCheck',       // Quote System
  'IconWallet1',            // Account Model
  'IconArrowsRepeatCircle', // Transaction Lifecycle
  'IconCoins',              // Currencies & Payment Rails
  'IconSettingsGear2',      // Configuration
  
  // What you can build section
  'IconCarFrontView',       // Gig worker payments
  'IconStore4',             // Marketplace payouts
  'IconShipping',           // Supplier payments
  'IconMultiMedia',         // Creator earnings
  
  // Resources section
  'IconGithub',             // GitHub
  'IconHammer',             // Tools
  'IconBubbleAnnotation5',  // Contact support
  'IconKey2',               // Request sandbox access
  'IconCalendar2',          // Talk to sales
  'IconGlobe',              // Network/Global
  'IconLinkedin',           // LinkedIn
  
  // Additional icons for other tabs
  'IconFileText',           // Documentation
  'IconCode',               // Code/API
  'IconShield',             // Security
  'IconCreditCard1',        // Payments
  'IconBanknote1',          // Money/Fiat
  'IconPeople',             // Users/Customers
  'IconCheckmark1',         // Success/Check
  'IconRepeat',             // Repeat/Loop
  'IconLock',               // Security/Lock
  'IconLightning',          // Fast/Instant
  'IconBank',               // Bank
  
  // API Reference sidebar icons
  'IconSandbox',            // Sandbox
  'IconPeopleAdd',          // Invitations
  'IconArrowExpandHor',     // Same-Currency Transfers
  'IconArrowLeftRight',     // Cross-Currency Transfers
  'IconBell',               // Webhooks
  
  // Use case icons (homepage ProductTiles)
  'IconSuitcaseWork',       // Payroll & contractors
  'IconBitcoin',            // Buy BTC
  'IconMoneyHand',          // Sell BTC
  'IconCryptoWallet',       // Wallet funding
];

// Icon style configuration (matching design requirements)
const ICON_STYLE = 'round-outlined-radius-3-stroke-1.5';
const ICON_SIZE = 20;

async function exportIcons() {
  const { centralIcons } = require('@central-icons-react/all/icons');
  
  const outputDir = path.join(__dirname, '..', 'mintlify', 'images', 'icons');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  let exported = 0;
  let failed = 0;
  
  for (const iconName of ICONS_TO_EXPORT) {
    const iconKey = `${ICON_STYLE}/${iconName}`;
    const iconPath = centralIcons[iconKey];
    
    if (!iconPath) {
      console.warn(`⚠ Warning: Icon ${iconName} not found with key ${iconKey}`);
      // Try to find similar keys
      const similarKeys = Object.keys(centralIcons).filter(k => k.includes(iconName)).slice(0, 3);
      if (similarKeys.length > 0) {
        console.warn(`  Similar keys found: ${similarKeys.join(', ')}`);
      }
      failed++;
      continue;
    }
    
    try {
      // Wrap the path in a full SVG element
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
${iconPath}
</svg>`;
      
      // Convert icon name from PascalCase to kebab-case for filename
      const filename = iconName
        .replace(/^Icon/, '')
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .toLowerCase() + '.svg';
      
      const filepath = path.join(outputDir, filename);
      
      // Write the SVG file
      fs.writeFileSync(filepath, svgString);
      console.log(`✓ Exported ${iconName} -> ${filename}`);
      exported++;
    } catch (error) {
      console.error(`✗ Failed to export ${iconName}: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\nDone! Exported ${exported} icons, ${failed} failed.`);
  console.log(`Output directory: ${outputDir}`);
}

exportIcons().catch(console.error);
