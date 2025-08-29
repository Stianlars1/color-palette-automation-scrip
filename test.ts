import { AdvancedColorTheory } from './src/lib/ColorTheory.js';

console.log('Testing Color Theory...');
const colors = AdvancedColorTheory.generateHarmoniousPalette('#3B82F6', 'analogous');
console.log('Generated palette:', colors);

const randomColor = AdvancedColorTheory.generateRandomHarmoniousColor();
console.log('Random color:', randomColor);
