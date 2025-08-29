// src/lib/AutomationRunner/AutomationRunner.ts
import { ColorPaletteAutomation } from '../ColorPaletteAutomation/ColorPaletteAutomation.js';

export class AutomationRunner {
    private automation: ColorPaletteAutomation;

    constructor() {
        this.automation = new ColorPaletteAutomation();
    }

    async generateFullPalette(brandColor?: string): Promise<void> {
        try {
            await this.automation.initialize();

            console.log('🎨 Generating base color palette...');
            const baseColors = this.automation.generateBaseColors(brandColor);
            console.log('Generated colors:', baseColors);

            console.log('🚀 Processing with color generation logic...');
            const fullPalette = await this.automation.generateRadixPalette(baseColors);

            console.log('✅ Generated CSS Variables:');
            console.log(fullPalette.css.variables);

            await this.saveToFile(fullPalette.css.variables);

        } catch (error) {
            console.error('❌ Error generating palette:', error);
        } finally {
            await this.automation.cleanup();
        }
    }

    private async saveToFile(css: string): Promise<void> {
        const fs = await import('fs/promises');
        const path = './generated-palette.css';

        await fs.writeFile(path, css);
        console.log(`💾 CSS saved to ${path}`);
    }
}
