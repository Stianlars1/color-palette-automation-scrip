export type Scheme = 'monochromatic' | 'analogous' | 'complementary' | 'triadic';


export interface ColorPalette {
    accent: string;
    gray: string;
    lightBackground: string;
    darkBackground: string;
}

export interface RadixColorScale {
    name: string;
    lightSteps: string[];
    darkSteps: string[];
    lightHslSteps: string[];
    darkHslSteps: string[];
}

export interface GeneratedPalette {
    accent: RadixColorScale;
    gray: RadixColorScale;
    css: {
        light: string;
        dark: string;
        variables: string;
    };
}