// src/lib/AutomationRunner/AutomationRunner.ts
import { ColorPaletteAutomation } from '../ColorPaletteAutomation/ColorPaletteAutomation.js';
import chalk from 'chalk';
export type Scheme = 'monochromatic' | 'analogous' | 'complementary' | 'triadic';

export class AutomationRunner {
    private automation: ColorPaletteAutomation;

    constructor() {
        this.automation = new ColorPaletteAutomation();
    }

    // set debug mode
    public setDebugMode(enabled: boolean): void {
        this.automation.setDebugMode(enabled);
    }


    async generateFullPalette(brandColor?: string, scheme: Scheme = 'analogous'): Promise<void> {

        try {
            await this.automation.initialize();

            console.log('🎨 Generating base color palette...');
            const baseColors = this.automation.generateBaseColors(brandColor, scheme);


            this.printBaseColorSwatches(baseColors);

            console.log('\n🚀 Processing with Radix UI (Light + Dark modes)...');
            const fullPalette = await this.automation.generateRadixPalette(baseColors);

            console.log('\n📊 Generated Color Scales:');
            this.printDualColorScale('Accent Scale', fullPalette.accent);
            this.printDualColorScale('Gray Scale', fullPalette.gray);

            console.log('\n✅ Generated CSS Variables:');
            console.log(fullPalette.css.variables);

            await this.saveToFile(fullPalette.css.variables);
            await this.generateHTMLPreview(baseColors, fullPalette);

        } catch (error) {
            console.error('❌ Error generating palette:', error);
        } finally {
            await this.automation.cleanup();
        }
    }

    private printBaseColorSwatches(colors: any): void {
        console.log('\n🎯 Base Color Palette:');
        console.log('┌─────────────────────────────────────────┐');
        
        const colorData = [
            { name: 'Accent', color: colors.accent, desc: 'Primary brand color' },
            { name: 'Gray', color: colors.gray, desc: 'Neutral color' },
            { name: 'Light BG', color: colors.lightBackground, desc: 'Light mode background' },
            { name: 'Dark BG', color: colors.darkBackground, desc: 'Dark mode background' }
        ];

        colorData.forEach(({ name, color, desc }) => {
            const swatch = this.createColorSwatch(color);
            const hex = color.toUpperCase();
            console.log(`│ ${swatch} ${name.padEnd(8)} ${hex.padEnd(8)} ${desc.padEnd(20)} │`);
        });
        
        console.log('└─────────────────────────────────────────┘');
    }

    private printDualColorScale(title: string, scale: any): void {
        console.log(`\n${title}:`);
        console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
        console.log('│ LIGHT MODE                                                                  │');
        console.log('├─────────────────────────────────────────────────────────────────────────────┤');
        
        this.printScaleRow(scale.lightSteps || scale.steps, '│', 0, 6);
        this.printScaleRow(scale.lightSteps || scale.steps, '│', 6, 12);
        
        console.log('├─────────────────────────────────────────────────────────────────────────────┤');
        console.log('│ DARK MODE                                                                   │');
        console.log('├─────────────────────────────────────────────────────────────────────────────┤');
        
        this.printScaleRow(scale.darkSteps || scale.steps, '│', 0, 6);
        this.printScaleRow(scale.darkSteps || scale.steps, '│', 6, 12);
        
        console.log('└─────────────────────────────────────────────────────────────────────────────┘');
    }

    private printScaleRow(colors: string[], prefix: string, start: number, end: number): void {
        if (!colors || colors.length === 0) return;
        
        let line1 = prefix + ' ';
        let line2 = prefix + ' ';
        
        for (let i = start; i < Math.min(end, colors.length); i++) {
            const color = colors[i];
            if (color) {
                const swatch = this.createColorSwatch(color);
                const step = (i + 1).toString().padEnd(2);
                line1 += `${swatch} ${step} `;
                line2 += `${color} `;
            }
        }
        line1 += '│';
        line2 += '│';
        
        console.log(line1);
        console.log(line2);
    }

    private createColorSwatch(hexColor: string): string {
        if (!hexColor || hexColor === '#000000') return '██';
        
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        return chalk.bgRgb(r, g, b)('  ');
    }

    private async generateHTMLPreview(baseColors: any, fullPalette: any): Promise<void> {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Color Palette (Light + Dark Mode)</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 32px;
            font-size: 2.5em;
            font-weight: 300;
        }
        h2 {
            color: #555;
            margin: 32px 0 16px 0;
            font-size: 1.5em;
            font-weight: 500;
        }
        .mode-toggle {
            text-align: center;
            margin: 20px 0;
        }
        .toggle-btn {
            background: #007acc;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
        }
        .base-colors {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
        }
        .base-color {
            text-align: center;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .color-scale {
            margin: 32px 0;
        }
        .mode-label {
            font-weight: 600;
            margin: 16px 0 8px 0;
            color: #666;
        }
        .scale-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 8px;
            margin: 8px 0 24px 0;
        }
        .color-step {
            aspect-ratio: 1;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            font-size: 0.9em;
            position: relative;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        .color-step:hover {
            transform: scale(1.1);
            z-index: 10;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }
        .color-info {
            position: absolute;
            bottom: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.7em;
            opacity: 0;
            transition: opacity 0.2s ease;
            white-space: nowrap;
        }
        .color-step:hover .color-info {
            opacity: 1;
        }
        .css-variables {
            background: #1a1a1a;
            color: #f0f0f0;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Generated Color Palette</h1>
        
        <h2>Base Colors</h2>
        <div class="base-colors">
            <div class="base-color" style="background: ${baseColors.accent}; color: ${this.getContrastColor(baseColors.accent)};">
                <h3>Accent</h3>
                <p>${baseColors.accent.toUpperCase()}</p>
                <small>Primary brand color</small>
            </div>
            <div class="base-color" style="background: ${baseColors.gray}; color: ${this.getContrastColor(baseColors.gray)};">
                <h3>Gray</h3>
                <p>${baseColors.gray.toUpperCase()}</p>
                <small>Neutral color</small>
            </div>
            <div class="base-color" style="background: ${baseColors.lightBackground}; color: ${this.getContrastColor(baseColors.lightBackground)};">
                <h3>Light Background</h3>
                <p>${baseColors.lightBackground.toUpperCase()}</p>
                <small>Light mode background</small>
            </div>
            <div class="base-color" style="background: ${baseColors.darkBackground}; color: ${this.getContrastColor(baseColors.darkBackground)};">
                <h3>Dark Background</h3>
                <p>${baseColors.darkBackground.toUpperCase()}</p>
                <small>Dark mode background</small>
            </div>
        </div>

        <div class="color-scale">
            <h2>Accent Scale (12 Steps)</h2>
            
            <div class="mode-label">☀️ Light Mode</div>
            <div class="scale-grid">
                ${(fullPalette.accent.lightSteps || fullPalette.accent.steps).map((color: string, i: number) => `
                    <div class="color-step" style="background: ${color}; color: ${this.getContrastColor(color)};">
                        ${i + 1}
                        <div class="color-info">${color.toUpperCase()}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="mode-label">🌙 Dark Mode</div>
            <div class="scale-grid">
                ${(fullPalette.accent.darkSteps || fullPalette.accent.steps).map((color: string, i: number) => `
                    <div class="color-step" style="background: ${color}; color: ${this.getContrastColor(color)};">
                        ${i + 1}
                        <div class="color-info">${color.toUpperCase()}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="color-scale">
            <h2>Gray Scale (12 Steps)</h2>
            
            <div class="mode-label">☀️ Light Mode</div>
            <div class="scale-grid">
                ${(fullPalette.gray.lightSteps || fullPalette.gray.steps).map((color: string, i: number) => `
                    <div class="color-step" style="background: ${color}; color: ${this.getContrastColor(color)};">
                        ${i + 1}
                        <div class="color-info">${color.toUpperCase()}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="mode-label">🌙 Dark Mode</div>
            <div class="scale-grid">
                ${(fullPalette.gray.darkSteps || fullPalette.gray.steps).map((color: string, i: number) => `
                    <div class="color-step" style="background: ${color}; color: ${this.getContrastColor(color)};">
                        ${i + 1}
                        <div class="color-info">${color.toUpperCase()}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="css-variables">
            <h3>Generated CSS Variables (Light + Dark Mode)</h3>
            <pre>${fullPalette.css.variables.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>
    </div>
</body>
</html>`;

        const fs = await import('fs/promises');
        await fs.writeFile('./color-palette-preview.html', html);
        console.log('🌐 HTML preview saved to color-palette-preview.html');
    }

    private getContrastColor(hexColor: string): string {
        if (!hexColor) return '#000000';
        
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(4, 6), 16);
        
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    private async saveToFile(css: string): Promise<void> {
        const fs = await import('fs/promises');
        const path = './generated-palette.css';

        await fs.writeFile(path, css);
        console.log(`💾 CSS saved to ${path}`);
    }
}
