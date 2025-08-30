import {ColorPaletteAutomation} from '../ColorPaletteAutomation/ColorPaletteAutomation.js';
import {Scheme} from "@/types/types";
import {generateHTMLPreview} from "@/lib/utils/generateHTMLPreview";
import {saveToFile} from "@/lib/utils/saveToFile";
import {createColorSwatch} from "@/lib/utils/color/createColorSwatch";

export class AutomationRunner {
    private automation: ColorPaletteAutomation;

    constructor() {
        this.automation = new ColorPaletteAutomation();
    }


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

            await saveToFile(fullPalette.css.variables);
            await generateHTMLPreview(baseColors, fullPalette);

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
            const swatch = createColorSwatch(color);
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
                const swatch = createColorSwatch(color);
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

}
