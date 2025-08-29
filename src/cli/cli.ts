#!/usr/bin/env node
// src/cli/cli.ts
import { AutomationRunner } from '../lib/AutomationRunner/AutomationRunner.js';
import { AdvancedColorTheory } from '../lib/ColorTheory.js';

async function main() {
    const args = process.argv.slice(2);
    const brandColor = args[0];
    const scheme = args[1] as any || 'analogous';

    console.log('🎨 Starting Color Palette Automation...\n');

    if (brandColor && brandColor !== 'random') {
        console.log(`Using brand color: ${brandColor}`);
        console.log(`Using color scheme: ${scheme}\n`);
    } else {
        console.log('Generating random harmonious palette...\n');
    }

    const runner = new AutomationRunner();

    // Use advanced color theory if scheme is specified
    if (scheme !== 'basic') {
        const colors = AdvancedColorTheory.generateHarmoniousPalette(
            brandColor || '#3B82F6',
            scheme
        );
        console.log('Generated theoretical colors:', colors);
    }

    await runner.generateFullPalette(brandColor);
}

main().catch(console.error);
