// src/lib/ColorPaletteAutomation/ColorPaletteAutomation.ts
import { chromium, Browser, Page } from 'playwright';

interface ColorPalette {
    accent: string;
    gray: string;
    lightBackground: string;
    darkBackground: string;
}

interface RadixColorScale {
    name: string;
    steps: string[];
    hslSteps: string[];
}

interface GeneratedPalette {
    accent: RadixColorScale;
    gray: RadixColorScale;
    css: {
        light: string;
        dark: string;
        variables: string;
    };
}

export class ColorPaletteAutomation {
    private browser: Browser | null = null;
    private page: Page | null = null;

    async initialize(): Promise<void> {
        this.browser = await chromium.launch({
            headless: false, // Set to true for production
        });
        this.page = await this.browser.newPage();
    }

    async cleanup(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
        }
    }

    generateBaseColors(brandColor?: string): ColorPalette {
        const baseHue = brandColor ? this.hexToHsl(brandColor).h : Math.floor(Math.random() * 360);

        const accent = this.hslToHex({
            h: baseHue,
            s: 85,
            l: 55
        });

        const grayHue = (baseHue + 180) % 360;
        const gray = this.hslToHex({
            h: grayHue,
            s: 8,
            l: 50
        });

        const lightBackground = this.hslToHex({
            h: baseHue,
            s: 20,
            l: 98
        });

        const darkBackground = this.hslToHex({
            h: baseHue,
            s: 15,
            l: 8
        });

        return {
            accent,
            gray,
            lightBackground,
            darkBackground
        };
    }

    async generateRadixPalette(colors: ColorPalette): Promise<GeneratedPalette> {
        if (!this.page) {
            throw new Error('Browser not initialized. Call initialize() first.');
        }

        console.log('📂 Navigating to Radix Colors...');
        await this.page.goto('https://www.radix-ui.com/colors/custom');
        await this.page.waitForLoadState('networkidle');

        // For now, we'll simulate the extraction since Radix UI structure might change
        // In a real implementation, you'd scrape the actual generated colors
        const accentScale = this.generateMockScale('accent', colors.accent);
        const grayScale = this.generateMockScale('gray', colors.gray);

        const css = this.generateCSS(accentScale, grayScale);

        return {
            accent: accentScale,
            gray: grayScale,
            css
        };
    }

    private generateMockScale(name: string, baseColor: string): RadixColorScale {
        const baseHsl = this.hexToHsl(baseColor);
        const steps: string[] = [];
        const hslSteps: string[] = [];

        // Generate 12 steps based on base color
        for (let i = 1; i <= 12; i++) {
            let lightness: number;
            if (i <= 2) {
                lightness = 98 - i; // Very light backgrounds
            } else if (i <= 5) {
                lightness = 95 - (i - 2) * 5; // Light interactive
            } else if (i <= 8) {
                lightness = 80 - (i - 5) * 8; // Borders
            } else {
                lightness = 60 - (i - 8) * 15; // Text colors
            }

            const stepHsl = {
                h: baseHsl.h,
                s: name === 'gray' ? Math.max(5, baseHsl.s - 70) : Math.max(20, baseHsl.s - (12 - i) * 5),
                l: Math.max(5, Math.min(98, lightness))
            };

            steps.push(this.hslToHex(stepHsl));
            hslSteps.push(`${stepHsl.h} ${stepHsl.s}% ${stepHsl.l}%`);
        }

        return { name, steps, hslSteps };
    }

    generateCSS(accent: RadixColorScale, gray: RadixColorScale): {
        light: string;
        dark: string;
        variables: string;
    } {
        const lightModeCSS = `
:root {
  --background: ${gray.hslSteps[0]};
  --foreground: ${gray.hslSteps[11]};
  --foreground-subtle: ${gray.hslSteps[10]};
  --card: ${gray.hslSteps[1]};
  --card-foreground: ${gray.hslSteps[11]};
  --popover: ${gray.hslSteps[0]};
  --popover-foreground: ${gray.hslSteps[11]};
  --primary: ${accent.hslSteps[8]};
  --primary-foreground: ${accent.hslSteps[0]};
  --secondary: ${accent.hslSteps[2]};
  --secondary-foreground: ${accent.hslSteps[11]};
  --muted: ${gray.hslSteps[2]};
  --muted-foreground: ${gray.hslSteps[10]};
  --accent: ${accent.hslSteps[3]};
  --accent-foreground: ${accent.hslSteps[10]};
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 100%;
  --border: ${gray.hslSteps[6]};
  --input: ${gray.hslSteps[6]};
  --ring: ${accent.hslSteps[8]};

  /* Accent Colors */
${accent.hslSteps.map((hsl, i) => `  --accent-${i + 1}: ${hsl};`).join('\n')}
  --accent-contrast: ${accent.hslSteps[0]};

  /* Gray Colors */
${gray.hslSteps.map((hsl, i) => `  --gray-${i + 1}: ${hsl};`).join('\n')}
  --gray-contrast: ${gray.hslSteps[11]};
}`;

        const darkModeCSS = `
@media (prefers-color-scheme: dark) {
  :root {
    --background: ${gray.hslSteps[0]};
    --foreground: ${gray.hslSteps[11]};
    --foreground-subtle: ${gray.hslSteps[9]};
    --card: ${gray.hslSteps[1]};
    --card-foreground: ${gray.hslSteps[11]};
    --popover: ${gray.hslSteps[2]};
    --popover-foreground: ${gray.hslSteps[11]};
    --primary: ${accent.hslSteps[8]};
    --primary-foreground: ${accent.hslSteps[0]};
    --secondary: ${accent.hslSteps[2]};
    --secondary-foreground: ${gray.hslSteps[11]};
    --muted: ${gray.hslSteps[2]};
    --muted-foreground: ${gray.hslSteps[10]};
    --accent: ${accent.hslSteps[4]};
    --accent-foreground: ${accent.hslSteps[10]};
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 100%;
    --border: ${gray.hslSteps[5]};
    --input: ${gray.hslSteps[5]};
    --ring: ${accent.hslSteps[7]};

    /* Accent Colors - Dark Mode */
${accent.hslSteps.map((hsl, i) => `    --accent-${i + 1}: ${hsl};`).join('\n')}
    --accent-contrast: ${accent.hslSteps[11]};

    /* Gray Colors - Dark Mode */
${gray.hslSteps.map((hsl, i) => `    --gray-${i + 1}: ${hsl};`).join('\n')}
    --gray-contrast: ${gray.hslSteps[0]};
  }
}`;

        return {
            light: lightModeCSS,
            dark: darkModeCSS,
            variables: lightModeCSS + '\n\n' + darkModeCSS
        };
    }

    private hexToHsl(hex: string): { h: number; s: number; l: number } {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    private hslToHex(hsl: { h: number; s: number; l: number }): string {
        const { h, s, l } = hsl;
        const sNorm = s / 100;
        const lNorm = l / 100;

        const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = lNorm - c / 2;
        let r = 0;
        let g = 0;
        let b = 0;

        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}
