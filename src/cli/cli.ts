#!/usr/bin/env node
// src/cli/cli.ts
import { AutomationRunner } from '../lib/AutomationRunner/AutomationRunner.js';
import { AdvancedColorTheory } from '../lib/ColorTheory.js';
import chalk from 'chalk';

async function main() {
    const args = process.argv.slice(2);
    const brandColor = args[0];
    const scheme = args[1] as any || 'analogous';
    const debugMode = args[2] === 'debug';

    console.log('🎨 Starting Color Palette Automation...\n');

    if (brandColor && brandColor !== 'random') {
        console.log(`Using brand color: ${brandColor}`);
        console.log(`Using color scheme: ${scheme}\n`);
    } else {
        console.log('Generating random harmonious palette...\n');
    }

    const runner = new AutomationRunner();

    runner.setDebugMode(debugMode); // Add this method to AutomationRunner

    // Use advanced color theory if scheme is specified
    if (scheme !== 'basic') {
        const colors = AdvancedColorTheory.generateHarmoniousPalette(
            brandColor || '#3B82F6',
            scheme
        );
        console.log('🔬 Color Theory Analysis:');
        printColorTheorySwatches(colors, scheme);
    }

    await runner.generateFullPalette(brandColor);
}

function printColorTheorySwatches(colors: any, scheme: string): void {
    console.log('┌─────────────────────────────────────────────────────────────────┐');
    console.log(`│ Color Harmony: ${scheme.toUpperCase().padEnd(20)} │`);
    console.log('├─────────────────────────────────────────────────────────────────┤');
    
    Object.entries(colors).forEach(([name, color]) => {
        const hexColor = color as string;
        const swatch = createColorSwatch(hexColor);
        const colorName = name.charAt(0).toUpperCase() + name.slice(1);
        console.log(`│ ${swatch} ${colorName.padEnd(10)} ${hexColor.toUpperCase().padEnd(8)} ${getColorDescription(name).padEnd(25)} │`);
    });
    
    console.log('└─────────────────────────────────────────────────────────────────┘\n');
}

function createColorSwatch(hexColor: string): string {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    return chalk.bgRgb(r, g, b)('  ');
}

function getColorDescription(name: string): string {
    const descriptions: { [key: string]: string } = {
        'accent': 'Primary brand color',
        'gray': 'Neutral base',
        'lightBg': 'Light theme background',
        'darkBg': 'Dark theme background'
    };
    return descriptions[name] || 'Color';
}

main().catch(console.error);
