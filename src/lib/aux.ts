function hexToHSL(hex: string) {
  // Convert hex to RGB
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  // Convert RGB to HSL
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function HSLToHex(h: number, s: number, l: number) {
  // Convert HSL to RGB
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const red = Math.round((r + m) * 255)
    .toString(16)
    .padStart(2, "0");
  const green = Math.round((g + m) * 255)
    .toString(16)
    .padStart(2, "0");
  const blue = Math.round((b + m) * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${red}${green}${blue}`;
}

export function getShadesOfAccent(hex: string, lightnessAdjust = 35) {
  const hsl = hexToHSL(hex);

  // Light shade (increase lightness)
  const lightShade = HSLToHex(
    hsl.h,
    hsl.s,
    Math.min(hsl.l + lightnessAdjust, 100)
  );

  // Dark shade (decrease lightness)
  const darkShade = HSLToHex(hsl.h, hsl.s, hsl.l);

  return { lightShade, darkShade };
}

function getComplementaryColor(hex: string) {
  const hsl = hexToHSL(hex);

  // Calculate the complementary hue
  const complementaryHue = (hsl.h + 180) % 360;

  // Convert the complementary HSL back to hex
  return HSLToHex(complementaryHue, hsl.s, hsl.l);
}

function getAnalogousColors(hex, shift = 30) {
  const hsl = hexToHSL(hex);

  // Calculate analogous hues
  const hue1 = (hsl.h + shift) % 360;
  const hue2 = (hsl.h - shift + 360) % 360;

  // Convert the analogous HSL back to hex
  const color1 = HSLToHex(hue1, hsl.s, hsl.l);
  const color2 = HSLToHex(hue2, hsl.s, hsl.l);

  return { color1, color2 };
}

// Example usage
// const accentColor = "#3498db"; // Your accent color
// const { lightShade, darkShade } = getShadesOfAccent(accentColor);

// console.log("Light Shade:", lightShade); // Example: #67b4e7
// console.log("Dark Shade:", darkShade); // Example: #2276b1
