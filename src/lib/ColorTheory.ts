// src/lib/ColorTheory.ts
import {hexToHSL, hslToHex} from "@/lib/colorConverters";

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
        const hsl = hexToHSL(baseColor);

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
        const accent = hslToHex({
            h: baseHSL.h,
            s: Math.max(70, baseHSL.s),
            l: 55
        });

        const gray = hslToHex({
            h: (baseHSL.h + 30) % 360,
            s: 8,
            l: 50
        });

        const lightBg = hslToHex({
            h: (baseHSL.h + 15) % 360,
            s: 20,
            l: 98
        });

        const darkBg = hslToHex({
            h: (baseHSL.h + 15) % 360,
            s: 15,
            l: 8
        });

        return { accent, gray, lightBg, darkBg };
    }

    private static generateComplementary(baseHSL: { h: number; s: number; l: number }) {
        const accent = hslToHex({
            h: baseHSL.h,
            s: Math.max(80, baseHSL.s),
            l: 55
        });

        const gray = hslToHex({
            h: (baseHSL.h + 180) % 360,
            s: 6,
            l: 50
        });

        const lightBg = hslToHex({
            h: baseHSL.h,
            s: 25,
            l: 98
        });

        const darkBg = hslToHex({
            h: (baseHSL.h + 180) % 360,
            s: 20,
            l: 8
        });

        return { accent, gray, lightBg, darkBg };
    }

    private static generateTriadic(baseHSL: { h: number; s: number; l: number }) {
        const accent = hslToHex({
            h: baseHSL.h,
            s: Math.max(75, baseHSL.s),
            l: 55
        });

        const gray = hslToHex({
            h: (baseHSL.h + 120) % 360,
            s: 10,
            l: 50
        });

        const lightBg = hslToHex({
            h: (baseHSL.h + 240) % 360,
            s: 15,
            l: 98
        });

        const darkBg = hslToHex({
            h: (baseHSL.h + 240) % 360,
            s: 12,
            l: 8
        });

        return { accent, gray, lightBg, darkBg };
    }

    private static generateMonochromatic(baseHSL: { h: number; s: number; l: number }) {
        const accent = hslToHex({
            h: baseHSL.h,
            s: Math.max(85, baseHSL.s),
            l: 55
        });

        const gray = hslToHex({
            h: baseHSL.h,
            s: 5,
            l: 50
        });

        const lightBg = hslToHex({
            h: baseHSL.h,
            s: 20,
            l: 98
        });

        const darkBg = hslToHex({
            h: baseHSL.h,
            s: 15,
            l: 8
        });

        return { accent, gray, lightBg, darkBg };
    }

    static generateRandomHarmoniousColor(): string {
        const hue = Math.floor(Math.random() * 360);
        return hslToHex({
            h: hue,
            s: 70 + Math.floor(Math.random() * 20),
            l: 45 + Math.floor(Math.random() * 20)
        });
    }
}
