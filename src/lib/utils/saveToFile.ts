export async function saveToFile(css: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = './generated-palette.css';

    await fs.writeFile(path, css);
    console.log(`💾 CSS saved to ${path}`);
}