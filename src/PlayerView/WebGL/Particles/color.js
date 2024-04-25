export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }
  
  export function rgbaToObject(rgba, multiplyAlpha = false) {
    if (!rgba) return { r: 0, g: 0, b: 0, a: 0 };
    const parts = rgba.match(/\d+\.?\d*/g).map((part) => parseFloat(part));
    const a = !multiplyAlpha ? parts[3] : parts[3] * 100;
    return { r: parts[0], g: parts[1], b: parts[2], a: a };
  }
  
  export const decimalToHex = (alpha) =>
    alpha === 0 ? "00" : Math.round(255 * alpha).toString(16);
  
  // export function rgbaToHex(rgba) {
  //   const { r, g, b, a } = rgbaToObject(rgba, true);
  //   return `#${r.toString(16).padStart(2, "0")}${g
  //     .toString(16)
  //     .padStart(2, "0")}${b.toString(16).padStart(2, "0")}${decimalToHex(a)}`;
  // }
  
  export function rgbaToHex(rgba) {
    // Split the RGBA string into an array of its components
    const parts = rgba.match(/\d+\.?\d*/g).map((part) => parseFloat(part));
  
    // Convert the RGB values
    const r = parts[0].toString(16).padStart(2, "0");
    const g = parts[1].toString(16).padStart(2, "0");
    const b = parts[2].toString(16).padStart(2, "0");
  
    // Convert the alpha value
    const a = Math.round(parts[3] * 255)
      .toString(16)
      .padStart(2, "0");
  
    return `#${r}${g}${b}${a}`;
  }
  
  function getLightnessOfRGB(rgbString) {
    // First convert to an array of integers by removing the whitespace, taking the 3rd char to the 2nd last then splitting by ','
    const rgbIntArray = rgbString
      .replace(/ /g, "")
      .slice(4, -1)
      .split(",")
      .map((e) => parseInt(e));
  
    // Get the highest and lowest out of red green and blue
    const highest = Math.max(...rgbIntArray);
    const lowest = Math.min(...rgbIntArray);
    // Return the average divided by 255
    return (highest + lowest) / 2 / 255;
  }
  
  function getLowestMiddleHighest(rgbIntArray) {
    let highest = { val: 0, index: -1 };
    let lowest = { val: Infinity, index: -1 };
  
    rgbIntArray.map((val, index) => {
      if (val > highest.val) {
        highest = { val: val, index: index };
      }
      if (val < lowest.val) {
        lowest = { val: val, index: index };
      }
    });
  
    let middle = { index: 3 - highest.index - lowest.index };
    middle.val = rgbIntArray[middle.index];
    return [lowest, middle, highest];
  }
  
  export function saturateByTenth({ r, g, b }) {
    const rgbIntArray = [r, g, b];
    const greyVal = getLightnessOfRGB(`rgb(${r}, ${g}, ${b})`) * 255;
    const [lowest, middle, highest] = getLowestMiddleHighest(rgbIntArray);
  
    if (lowest.val === highest.val) {
      return { r, g, b };
    }
  
    const saturationRange = Math.round(Math.min(255 - greyVal, greyVal));
  
    const maxChange = Math.min(255 - 50, lowest.val);
  
    const changeAmount = Math.min(saturationRange / 10, maxChange);
  
    const middleValueRatio = (greyVal - middle.val) / (greyVal - highest.val);
  
    const returnArray = [];
    returnArray[highest.index] = Math.round(highest.val + changeAmount);
    returnArray[lowest.index] = Math.round(lowest.val - changeAmount);
    returnArray[middle.index] = Math.round(
      greyVal + (returnArray[highest.index] - greyVal) * middleValueRatio
    );
  
    return { r: returnArray[0], g: returnArray[1], b: returnArray[2] };
  }
  
  export function generateRandomColor() {
    // Hue: any value from 0 to 360 (colors all around the color wheel)
    // Saturation: keep it moderate, say 40% to 60% for vibrancy without being too bright
    // Lightness: keep it balanced, around 50% to 70% to avoid being too dark or too light
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 20) + 40; // 40% to 60%
    const lightness = Math.floor(Math.random() * 20) + 50; // 50% to 70%
  
    return {
      hsl: { h: hue, s: saturation, l: lightness },
      rgb: hslToRgb(hue, saturation, lightness),
    };
  }
  
  export function hslToRgb(h, s, l) {
    // Convert h from [0, 1] to [0, 360] range
    h = h * 360;
  
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
  
    let rPrime, gPrime, bPrime;
  
    if (h >= 0 && h < 60) {
      rPrime = c;
      gPrime = x;
      bPrime = 0;
    } else if (h >= 60 && h < 120) {
      rPrime = x;
      gPrime = c;
      bPrime = 0;
    } else if (h >= 120 && h < 180) {
      rPrime = 0;
      gPrime = c;
      bPrime = x;
    } else if (h >= 180 && h < 240) {
      rPrime = 0;
      gPrime = x;
      bPrime = c;
    } else if (h >= 240 && h < 300) {
      rPrime = x;
      gPrime = 0;
      bPrime = c;
    } else {
      rPrime = c;
      gPrime = 0;
      bPrime = x;
    }
  
    const r = Math.round((rPrime + m) * 255);
    const g = Math.round((gPrime + m) * 255);
    const b = Math.round((bPrime + m) * 255);
  
    return { r, g, b };
  }
  
  