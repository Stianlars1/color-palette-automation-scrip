// src/lib/ColorPaletteAutomation/ColorPaletteAutomation.ts
import {Browser, chromium, Page} from 'playwright';
import {hexToHSLString, hslToHex} from "@/lib/colorConverters";
import {Scheme} from "@/lib/AutomationRunner/AutomationRunner";
import {AdvancedColorTheory} from "@/lib/ColorTheory";

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

    generateBaseColors(brandColor?: string, scheme: Scheme = 'analogous'): {

        accent: string;
        gray: string;
        lightBackground: string;
        darkBackground: string;
    } {
        const normalize = (raw?: string): string | undefined => {
            if (!raw) return undefined;
            const cleaned = raw.trim().replace(/^#/, '').toUpperCase();
            if (/^[0-9A-F]{6}$/.test(cleaned)) return `#${cleaned}`;
            if (/^[0-9A-F]{3}$/.test(cleaned)) {
                const [r, g, b] = cleaned.split('');
                return `#${r}${r}${g}${g}${b}${b}`;
            }
            return undefined;
        };

        const normalized = normalize(brandColor);


        const seed = normalize(brandColor) ?? '#3B82F6'; // fallback if none provided

        // Use color theory to derive supportive colors *for this scheme*
        const theory = AdvancedColorTheory.generateHarmoniousPalette(seed, scheme);

        const accent = seed;
        const gray = theory.gray;
        const lightBackground = theory.lightBg;
        const darkBackground = theory.darkBg;

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
        await this.page.waitForTimeout(50);

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
            lightHslSteps: lightModeColors.accent.map(hex => hexToHSLString(hex)),
            darkHslSteps: darkModeColors.accent.map(hex => hexToHSLString(hex))
        };

        const grayScale: RadixColorScale = {
            name: 'gray',
            lightSteps: lightModeColors.gray,
            darkSteps: darkModeColors.gray,
            lightHslSteps: lightModeColors.gray.map(hex => hexToHSLString(hex)),
            darkHslSteps: darkModeColors.gray.map(hex => hexToHSLString(hex))
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
            await this.page.waitForTimeout(10);

            console.log(`🎨 Setting gray color: ${colors.gray}`);
            await this.page.fill('#gray', colors.gray.replace('#', ''));
            await this.page.waitForTimeout(10);

            console.log(`🎨 Setting background color: ${colors.lightBackground}`);
            await this.page.fill('#bg', isDark ? colors.darkBackground.replace('#', '') : colors.lightBackground.replace('#', ''));
            await this.page.waitForTimeout(10);

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
                await this.page.waitForTimeout(25);
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
                await this.page.waitForTimeout(25); // Wait for dark mode to load

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
                        await this.ensureNoDialogOpen();           // ← new
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
                    await this.ensureNoDialogOpen();           // ← new
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

        const dialogOverlay = this.page.locator('.rt-DialogOverlay'); // Radix Themes overlay

        // Open
        await swatchButton.click();
        await dialogOverlay.first().waitFor({state: 'visible'});

        // Grab the hex from the dialog (adjust the locator if your DOM differs)
        const hexButton = this.page.getByRole('button', {name: /^#[0-9A-F]{6}$/i}).first();
        await hexButton.waitFor({state: 'visible'});
        const text = (await hexButton.textContent())?.trim() ?? null;

        // Close
        await this.page.keyboard.press('Escape');
        await dialogOverlay.first().waitFor({state: 'detached'}); // ← key fix: wait until overlay is gone

        return text;
    }


    private async ensureNoDialogOpen() {
        if (!this.page) return null;
        const dialogOverlay = this.page.locator('.rt-DialogOverlay');
        if (await dialogOverlay.count()) {
            await this.page.keyboard.press('Escape');
            await dialogOverlay.first().waitFor({state: 'detached'});
        }
    }



    private generateFallbackAccentColors(): string[] {
        const colors: string[] = [];
        for (let i = 1; i <= 12; i++) {
            const lightness = 95 - (i - 1) * 7;
            const color = hslToHex({
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
            const color = hslToHex({
                h: 220,
                s: 5,
                l: Math.max(5, lightness)
            });
            colors.push(color);
        }
        return colors;
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

}