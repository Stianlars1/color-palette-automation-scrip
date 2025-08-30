#!/usr/bin/env node
// src/cli/cli.ts
import {AutomationRunner} from '../lib/AutomationRunner/AutomationRunner.js';
import {AdvancedColorTheory} from '../lib/ColorTheory.js';
import chalk from 'chalk';
import {Scheme} from "@/types/types";

// Normalizes many hex formats to "#RRGGBB". Returns undefined if invalid.
const normalizeHex = (raw?: string): string | undefined => {
    if (!raw) return undefined;

    const cleaned = raw.trim().replace(/^#/, '').toUpperCase();

    // #RRGGBB
    if (/^[0-9A-F]{6}$/.test(cleaned)) return `#${cleaned}`;

    // #RGB  -> expand to #RRGGBB
    if (/^[0-9A-F]{3}$/.test(cleaned)) {
        const [r, g, b] = cleaned.split('');
        return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }

    return undefined; // invalid → let caller decide fallback
};


async function main() {
    const args = process.argv.slice(2);
    const brandArgRaw = args[0];                           // "ffc8dd" | "#ffc8dd" | "random" | undefined
    const scheme = ((args[1] || 'analogous').toLowerCase() as Scheme);
    const debugMode = args[2] === 'debug';

    console.log('🎨 Starting Color Palette Automation....\n');
    console.log("brandArgRaw", brandArgRaw)
    console.log("Scheme", scheme)
    console.log("Args..", args)

    // Decide a single seed and reuse it for both preview and generation
    const seed = brandArgRaw && brandArgRaw.toLowerCase() !== 'random'
        ? normalizeHex(brandArgRaw)
        : undefined;

    console.log("seed", seed)

    if (seed) {
        console.log(`Using brand color: ${seed}`);
    } else if (brandArgRaw?.toLowerCase() === 'random') {
        console.log('Using random brand color');
    }

    console.log(`Using color scheme: ${scheme}\n`);

    // Preview (uses the SAME seed)
    const theorySeed = seed ?? '#3B82F6'; // fallback seed for preview if none provided
    const theory = AdvancedColorTheory.generateHarmoniousPalette(theorySeed, scheme);
    printColorTheorySwatches(theory, scheme);

    // Run automation using the SAME seed and the scheme
    const runner = new AutomationRunner();
    runner.setDebugMode(debugMode);
    await runner.generateFullPalette(theorySeed, scheme);
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
