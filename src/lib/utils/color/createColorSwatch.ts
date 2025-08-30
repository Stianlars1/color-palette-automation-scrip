import chalk from "chalk";

export function createColorSwatch(hexColor: string): string {
    if (!hexColor || hexColor === '#000000') return '██';

    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    return chalk.bgRgb(r, g, b)('  ');
}