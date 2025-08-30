import {RadixColorScale} from "@/types/types";

export function generateCSS(accent: RadixColorScale, gray: RadixColorScale): {
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