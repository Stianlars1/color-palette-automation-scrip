import {getContrastColor} from "../../lib/utils/color/getContrastColor";

export async function generateHTMLPreview(baseColors: any, fullPalette: any): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Color Palette (Light + Dark Mode)</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 32px;
            font-size: 2.5em;
            font-weight: 300;
        }
        h2 {
            color: #555;
            margin: 32px 0 16px 0;
            font-size: 1.5em;
            font-weight: 500;
        }
        .mode-toggle {
            text-align: center;
            margin: 20px 0;
        }
        .toggle-btn {
            background: #007acc;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
        }
        .base-colors {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
        }
        .base-color {
            text-align: center;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .color-scale {
            margin: 32px 0;
        }
        .mode-label {
            font-weight: 600;
            margin: 16px 0 8px 0;
            color: #666;
        }
        .scale-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 8px;
            margin: 8px 0 24px 0;
        }
        .color-step {
            aspect-ratio: 1;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            font-size: 0.9em;
            position: relative;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        .color-step:hover {
            transform: scale(1.1);
            z-index: 10;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }
        .color-info {
            position: absolute;
            bottom: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.7em;
            opacity: 0;
            transition: opacity 0.2s ease;
            white-space: nowrap;
        }
        .color-step:hover .color-info {
            opacity: 1;
        }
        .css-variables {
            background: #1a1a1a;
            color: #f0f0f0;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Generated Color Palette</h1>
        
        <h2>Base Colors</h2>
        <div class="base-colors">
            <div class="base-color" style="background: ${baseColors.accent}; color: ${getContrastColor(baseColors.accent)};">
                <h3>Accent</h3>
                <p>${baseColors.accent.toUpperCase()}</p>
                <small>Primary brand color</small>
            </div>
            <div class="base-color" style="background: ${baseColors.gray}; color: ${getContrastColor(baseColors.gray)};">
                <h3>Gray</h3>
                <p>${baseColors.gray.toUpperCase()}</p>
                <small>Neutral color</small>
            </div>
            <div class="base-color" style="background: ${baseColors.lightBackground}; color: ${getContrastColor(baseColors.lightBackground)};">
                <h3>Light Background</h3>
                <p>${baseColors.lightBackground.toUpperCase()}</p>
                <small>Light mode background</small>
            </div>
            <div class="base-color" style="background: ${baseColors.darkBackground}; color: ${getContrastColor(baseColors.darkBackground)};">
                <h3>Dark Background</h3>
                <p>${baseColors.darkBackground.toUpperCase()}</p>
                <small>Dark mode background</small>
            </div>
        </div>

        <div class="color-scale">
            <h2>Accent Scale (12 Steps)</h2>
            
            <div class="mode-label">☀️ Light Mode</div>
            <div class="scale-grid">
                ${(fullPalette.accent.lightSteps || fullPalette.accent.steps).map((color: string, i: number) => `
                    <div class="color-step" style="background: ${color}; color: ${getContrastColor(color)};">
                        ${i + 1}
                        <div class="color-info">${color.toUpperCase()}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="mode-label">🌙 Dark Mode</div>
            <div class="scale-grid">
                ${(fullPalette.accent.darkSteps || fullPalette.accent.steps).map((color: string, i: number) => `
                    <div class="color-step" style="background: ${color}; color: ${getContrastColor(color)};">
                        ${i + 1}
                        <div class="color-info">${color.toUpperCase()}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="color-scale">
            <h2>Gray Scale (12 Steps)</h2>
            
            <div class="mode-label">☀️ Light Mode</div>
            <div class="scale-grid">
                ${(fullPalette.gray.lightSteps || fullPalette.gray.steps).map((color: string, i: number) => `
                    <div class="color-step" style="background: ${color}; color: ${getContrastColor(color)};">
                        ${i + 1}
                        <div class="color-info">${color.toUpperCase()}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="mode-label">🌙 Dark Mode</div>
            <div class="scale-grid">
                ${(fullPalette.gray.darkSteps || fullPalette.gray.steps).map((color: string, i: number) => `
                    <div class="color-step" style="background: ${color}; color: ${getContrastColor(color)};">
                        ${i + 1}
                        <div class="color-info">${color.toUpperCase()}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="css-variables">
            <h3>Generated CSS Variables (Light + Dark Mode)</h3>
            <pre>${fullPalette.css.variables.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>
    </div>
</body>
</html>`;

    const fs = await import('fs/promises');
    await fs.writeFile('./color-palette-preview.html', html);
    console.log('🌐 HTML preview saved to color-palette-preview.html');
}
