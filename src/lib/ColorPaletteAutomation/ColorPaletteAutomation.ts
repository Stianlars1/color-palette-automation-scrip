// src/lib/ColorPaletteAutomation/ColorPaletteAutomation.ts
import {Browser, chromium, Page} from 'playwright';

interface ColorPalette {
    accent: string;
    gray: string;
    lightBackground: string;
    darkBackground: string;
}

interface RadixColorScale {
    name: string;
    lightSteps: string[];
    darkSteps: string[];
    lightHslSteps: string[];
    darkHslSteps: string[];
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
    private debugMode: boolean = true;
    private storedColors: ColorPalette | null = null; // Add this line


    public setDebugMode(enabled: boolean): void {
        this.debugMode = enabled;
    }

    async initialize(): Promise<void> {
        this.browser = await chromium.launch({
            headless: false,
            slowMo: this.debugMode ? 200 : 0,
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
        await this.page.waitForTimeout(200);

        console.log('🎨 Filling color inputs...');
        await this.fillColorInputs(colors, false); // isDark = false

        // Store colors for later refilling
        this.storedColors = colors;

        console.log('☀️ Ensuring Light mode is selected...');
        await this.ensureLightMode();

        console.log('☀️ Extracting light mode colors...');
        const lightModeColors = await this.extractColorsFromSwatches('light');

        console.log('🌙 Switching to dark mode...');
        await this.switchToDarkMode();

        console.log('🌙 Extracting dark mode colors...');
        const darkModeColors = await this.extractColorsFromSwatches('dark');


        // Combine results
        const accentScale: RadixColorScale = {
            name: 'accent',
            lightSteps: lightModeColors.accent,
            darkSteps: darkModeColors.accent,
            lightHslSteps: lightModeColors.accent.map(hex => this.hexToHslString(hex)),
            darkHslSteps: darkModeColors.accent.map(hex => this.hexToHslString(hex))
        };

        const grayScale: RadixColorScale = {
            name: 'gray',
            lightSteps: lightModeColors.gray,
            darkSteps: darkModeColors.gray,
            lightHslSteps: lightModeColors.gray.map(hex => this.hexToHslString(hex)),
            darkHslSteps: darkModeColors.gray.map(hex => this.hexToHslString(hex))
        };

        const css = this.generateCSS(accentScale, grayScale);

        return {
            accent: accentScale,
            gray: grayScale,
            css
        };
    }

    private async fillColorInputs(colors: ColorPalette, isDark = false): Promise<void> {
        if (!this.page) return;

        try {
            console.log(`🎨 Setting accent color: ${colors.accent}`);
            await this.page.fill('#accent', colors.accent.replace('#', ''));
            await this.page.waitForTimeout(200);

            console.log(`🎨 Setting gray color: ${colors.gray}`);
            await this.page.fill('#gray', colors.gray.replace('#', ''));
            await this.page.waitForTimeout(200);

            console.log(`🎨 Setting background color: ${colors.lightBackground}`);
            await this.page.fill('#bg', isDark ? colors.darkBackground.replace('#', '') : colors.lightBackground.replace('#', ''));
            await this.page.waitForTimeout(200);

            console.log('✅ Color inputs filled successfully');

        } catch (error) {
            console.error('❌ Error filling color inputs:', error);
            throw error;
        }
    }

    private async ensureLightMode(): Promise<void> {
        if (!this.page) return;

        try {
            // Look for the Light button in the segmented control and ensure it's selected
            const lightButton = await this.page.$('button[data-state="off"]:has-text("Light")');
            if (lightButton) {
                console.log('☀️ Clicking Light mode button');
                await lightButton.click();
                await this.page.waitForTimeout(200);
            } else {
                console.log('☀️ Light mode already selected');
            }
        } catch (error) {
            console.log('⚠️ Could not ensure light mode, proceeding anyway');
        }
    }


    private async switchToDarkMode(): Promise<void> {
        if (!this.page) return;

        try {
            // Look for the Dark button in the segmented control
            const darkButton = await this.page.$('button[data-state="off"]:has-text("Dark")');
            if (darkButton) {
                console.log('🌙 Clicking Dark mode button');
                await darkButton.click();
                await this.page.waitForTimeout(2000); // Wait for dark mode to load

                // Refill inputs after mode switch since they get cleared
                if (this.storedColors) {
                    console.log('🎨 Refilling inputs after dark mode switch...');
                    await this.fillColorInputs(this.storedColors, true); // isDark = true
                }

                console.log('✅ Switched to dark mode and refilled inputs');
            } else {
                console.log('⚠️ Could not find dark mode button');
            }
        } catch (error) {
            console.error('❌ Error switching to dark mode:', error);
        }
    }


    private async extractColorsFromSwatches(mode: 'light' | 'dark'): Promise<{
        accent: string[];
        gray: string[];
    }> {
        if (!this.page) throw new Error('Page not initialized');

        console.log(`🎨 Extracting ${mode} colors from individual swatches...`);

        const accentColors: string[] = [];
        const grayColors: string[] = [];

        try {
            // Find all color swatch buttons using the specific class from your HTML
            const swatchButtons = await this.page.$$('button.rt-reset.CustomSwatch_CustomSwatchTrigger__jlBrx');
            console.log(`Found ${swatchButtons.length} color swatches`);

            if (swatchButtons.length < 24) {
                console.warn(`Expected 24 swatches but found ${swatchButtons.length}`);
            }

            // Extract colors from first 12 swatches (accent colors)
            for (let i = 0; i < Math.min(12, swatchButtons.length); i++) {
                try {
                    console.log(`Extracting accent color ${i + 1}...`);
                    const color = await this.extractColorFromSwatch(swatchButtons[i]);
                    if (color) {
                        accentColors.push(color);
                        console.log(`  Accent ${i + 1}: ${color}`);
                    }
                } catch (error) {
                    console.warn(`Failed to extract accent color ${i + 1}:`, error);
                }
            }

            // Extract colors from next 12 swatches (gray colors)
            for (let i = 12; i < Math.min(24, swatchButtons.length); i++) {
                try {
                    console.log(`Extracting gray color ${i - 11}...`);
                    const color = await this.extractColorFromSwatch(swatchButtons[i]);
                    if (color) {
                        grayColors.push(color);
                        console.log(`  Gray ${i - 11}: ${color}`);
                    }
                } catch (error) {
                    console.warn(`Failed to extract gray color ${i - 11}:`, error);
                }
            }

            console.log(`✅ Extracted ${accentColors.length} accent colors and ${grayColors.length} gray colors`);

            return {
                accent: accentColors,
                gray: grayColors
            };

        } catch (error) {
            console.error(`❌ Error extracting ${mode} colors:`, error);
            return {
                accent: this.generateFallbackAccentColors(),
                gray: this.generateFallbackGrayColors()
            };
        }
    }

    private async extractColorFromSwatch(swatchButton: any): Promise<string | null> {
        if (!this.page) return null;

        try {
            // Click the swatch button to open the modal
            await swatchButton.click();
            await this.page.waitForTimeout(50);

            // Look for the hex copy button in the modal
            // Based on your HTML: <button ...>#F9F6F5</button>
            const copyButton = await this.page.$('button.rt-reset.rt-BaseButton.rt-r-size-2.rt-variant-ghost.rt-high-contrast.rt-Button');

            if (copyButton) {
                const hexText = await copyButton.textContent();

                if (hexText && hexText.startsWith('#') && hexText.length === 7) {
                    // Close the modal by clicking outside or pressing Escape
                    await this.page.keyboard.press('Escape');
                    await this.page.waitForTimeout(50);

                    return hexText.trim();
                }
            }

            // Alternative: look for any button containing a hex color
            const allButtons = await this.page.$$('button');
            for (const button of allButtons) {
                const text = await button.textContent();
                if (text && /^#[0-9A-Fa-f]{6}$/.test(text.trim())) {
                    await this.page.keyboard.press('Escape');
                    await this.page.waitForTimeout(50);
                    return text.trim();
                }
            }

            // Close modal if still open
            await this.page.keyboard.press('Escape');
            await this.page.waitForTimeout(50);

        } catch (error) {
            console.warn('Error extracting color from swatch:', error);
            // Try to close any open modal
            await this.page.keyboard.press('Escape');
            await this.page.waitForTimeout(50);
        }

        return null;
    }

    private generateFallbackAccentColors(): string[] {
        const colors: string[] = [];
        for (let i = 1; i <= 12; i++) {
            const lightness = 95 - (i - 1) * 7;
            const color = this.hslToHex({
                h: 15,
                s: Math.max(10, 90 - (i - 1) * 5),
                l: Math.max(5, lightness)
            });
            colors.push(color);
        }
        return colors;
    }

    private generateFallbackGrayColors(): string[] {
        const colors: string[] = [];
        for (let i = 1; i <= 12; i++) {
            const lightness = 95 - (i - 1) * 7;
            const color = this.hslToHex({
                h: 220,
                s: 5,
                l: Math.max(5, lightness)
            });
            colors.push(color);
        }
        return colors;
    }

    private hexToHslString(hex: string): string {
        const hsl = this.hexToHsl(hex);
        return `${hsl.h} ${hsl.s}% ${hsl.l}%`;
    }

    generateCSS(accent: RadixColorScale, gray: RadixColorScale): {
        light: string;
        dark: string;
        variables: string;
    } {
        const lightModeCSS = `
:root {
  --background: ${gray.lightHslSteps[0]};
  --foreground: ${gray.lightHslSteps[11]};
  --foreground-subtle: ${gray.lightHslSteps[10]};
  --card: ${gray.lightHslSteps[1]};
  --card-foreground: ${gray.lightHslSteps[11]};
  --popover: ${gray.lightHslSteps[0]};
  --popover-foreground: ${gray.lightHslSteps[11]};
  --primary: ${accent.lightHslSteps[8]};
  --primary-foreground: ${accent.lightHslSteps[0]};
  --secondary: ${accent.lightHslSteps[2]};
  --secondary-foreground: ${accent.lightHslSteps[11]};
  --muted: ${gray.lightHslSteps[2]};
  --muted-foreground: ${gray.lightHslSteps[10]};
  --accent: ${accent.lightHslSteps[3]};
  --accent-foreground: ${accent.lightHslSteps[10]};
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 100%;
  --border: ${gray.lightHslSteps[6]};
  --input: ${gray.lightHslSteps[6]};
  --ring: ${accent.lightHslSteps[8]};

  /* Accent Colors - Light Mode */
${accent.lightHslSteps.map((hsl, i) => `  --accent-${i + 1}: ${hsl};`).join('\n')}
  --accent-contrast: ${accent.lightHslSteps[0]};

  /* Gray Colors - Light Mode */
${gray.lightHslSteps.map((hsl, i) => `  --gray-${i + 1}: ${hsl};`).join('\n')}
  --gray-contrast: ${gray.lightHslSteps[11]};
}`;

        const darkModeCSS = `
@media (prefers-color-scheme: dark) {
  :root {
    --background: ${gray.darkHslSteps[0]};
    --foreground: ${gray.darkHslSteps[11]};
    --foreground-subtle: ${gray.darkHslSteps[9]};
    --card: ${gray.darkHslSteps[1]};
    --card-foreground: ${gray.darkHslSteps[11]};
    --popover: ${gray.darkHslSteps[2]};
    --popover-foreground: ${gray.darkHslSteps[11]};
    --primary: ${accent.darkHslSteps[8]};
    --primary-foreground: ${accent.darkHslSteps[0]};
    --secondary: ${accent.darkHslSteps[2]};
    --secondary-foreground: ${gray.darkHslSteps[11]};
    --muted: ${gray.darkHslSteps[2]};
    --muted-foreground: ${gray.darkHslSteps[10]};
    --accent: ${accent.darkHslSteps[4]};
    --accent-foreground: ${accent.darkHslSteps[10]};
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 100%;
    --border: ${gray.darkHslSteps[5]};
    --input: ${gray.darkHslSteps[5]};
    --ring: ${accent.darkHslSteps[7]};

    /* Accent Colors - Dark Mode */
${accent.darkHslSteps.map((hsl, i) => `    --accent-${i + 1}: ${hsl};`).join('\n')}
    --accent-contrast: ${accent.darkHslSteps[11]};

    /* Gray Colors - Dark Mode */
${gray.darkHslSteps.map((hsl, i) => `    --gray-${i + 1}: ${hsl};`).join('\n')}
    --gray-contrast: ${gray.darkHslSteps[0]};
  }
}`;

        return {
            light: lightModeCSS,
            dark: darkModeCSS,
            variables: lightModeCSS + '\n\n' + darkModeCSS
        };
    }

    // Utility methods remain the same...
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