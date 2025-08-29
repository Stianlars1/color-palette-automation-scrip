// src/lib/ColorTheory.ts
export class AdvancedColorTheory {
    /**
     * Generates perfectly harmonious colors using advanced color theory
     */
    static generateHarmoniousPalette(
        baseColor: string,
        scheme: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' = 'analogous'
    ): {
        accent: string;
        gray: string;
        lightBg: string;
        darkBg: string;
    } {
        const hsl = this.hexToHSL(baseColor);

        switch (scheme) {
            case 'analogous':
                return this.generateAnalogous(hsl);
            case 'complementary':
                return this.generateComplementary(hsl);
            case 'triadic':
                return this.generateTriadic(hsl);
            default:
                return this.generateMonochromatic(hsl);
        }
    }

    private static generateAnalogous(baseHSL: { h: number; s: number; l: number }) {
        const accent = this.hslToHex({
            h: baseHSL.h,
            s: Math.max(70, baseHSL.s),
            l: 55
        });

        const gray = this.hslToHex({
            h: (baseHSL.h + 30) % 360,
            s: 8,
            l: 50
        });

        const lightBg = this.hslToHex({
            h: (baseHSL.h + 15) % 360,
            s: 20,
            l: 98
        });

        const darkBg = this.hslToHex({
            h: (baseHSL.h + 15) % 360,
            s: 15,
            l: 8
        });

        return { accent, gray, lightBg, darkBg };
    }

    private static generateComplementary(baseHSL: { h: number; s: number; l: number }) {
        const accent = this.hslToHex({
            h: baseHSL.h,
            s: Math.max(80, baseHSL.s),
            l: 55
        });

        const gray = this.hslToHex({
            h: (baseHSL.h + 180) % 360,
            s: 6,
            l: 50
        });

        const lightBg = this.hslToHex({
            h: baseHSL.h,
            s: 25,
            l: 98
        });

        const darkBg = this.hslToHex({
            h: (baseHSL.h + 180) % 360,
            s: 20,
            l: 8
        });

        return { accent, gray, lightBg, darkBg };
    }

    private static generateTriadic(baseHSL: { h: number; s: number; l: number }) {
        const accent = this.hslToHex({
            h: baseHSL.h,
            s: Math.max(75, baseHSL.s),
            l: 55
        });

        const gray = this.hslToHex({
            h: (baseHSL.h + 120) % 360,
            s: 10,
            l: 50
        });

        const lightBg = this.hslToHex({
            h: (baseHSL.h + 240) % 360,
            s: 15,
            l: 98
        });

        const darkBg = this.hslToHex({
            h: (baseHSL.h + 240) % 360,
            s: 12,
            l: 8
        });

        return { accent, gray, lightBg, darkBg };
    }

    private static generateMonochromatic(baseHSL: { h: number; s: number; l: number }) {
        const accent = this.hslToHex({
            h: baseHSL.h,
            s: Math.max(85, baseHSL.s),
            l: 55
        });

        const gray = this.hslToHex({
            h: baseHSL.h,
            s: 5,
            l: 50
        });

        const lightBg = this.hslToHex({
            h: baseHSL.h,
            s: 20,
            l: 98
        });

        const darkBg = this.hslToHex({
            h: baseHSL.h,
            s: 15,
            l: 8
        });

        return { accent, gray, lightBg, darkBg };
    }

    private static hexToHSL(hex: string): { h: number; s: number; l: number } {
        const cleanHex = hex.replace('#', '');
        const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
        const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
        const b = parseInt(cleanHex.slice(4, 6), 16) / 255;

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

    private static hslToHex(hsl: { h: number; s: number; l: number }): string {
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

    static generateRandomHarmoniousColor(): string {
        const hue = Math.floor(Math.random() * 360);
        return this.hslToHex({
            h: hue,
            s: 70 + Math.floor(Math.random() * 20),
            l: 45 + Math.floor(Math.random() * 20)
        });
    }
}
