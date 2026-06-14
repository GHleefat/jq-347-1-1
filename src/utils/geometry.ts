export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

export const randomRange = (min: number, max: number): number => {
  return min + Math.random() * (max - min);
};

export const randomColor = (): string => {
  const colors = [
    '#ff2d95', '#00f0ff', '#b967ff', '#ffd700', '#39ff14',
    '#ff6b35', '#ff006e', '#8338ec', '#3a86ff', '#fb5607',
    '#ffbe0b', '#06ffa5',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 1, g: 1, b: 1 };
};

export const getMirrorPositions = (
  count: number,
  radius: number,
  angleOffset: number = 0
): Array<{ position: [number, number, number]; rotation: [number, number, number] }> => {
  const mirrors = [];
  const angleStep = (Math.PI * 2) / count;

  for (let i = 0; i < count; i++) {
    const angle = angleOffset + i * angleStep;
    const nextAngle = angleOffset + (i + 1) * angleStep;

    const x1 = Math.cos(angle) * radius;
    const y1 = Math.sin(angle) * radius;
    const x2 = Math.cos(nextAngle) * radius;
    const y2 = Math.sin(nextAngle) * radius;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    const mirrorAngle = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;

    mirrors.push({
      position: [midX, midY, 0],
      rotation: [0, 0, mirrorAngle],
    });
  }

  return mirrors;
};

export const generateSymmetricCopies = (
  position: [number, number, number],
  count: number,
  angleOffset: number = 0
): Array<[number, number, number]> => {
  const copies: Array<[number, number, number]> = [];
  const angleStep = (Math.PI * 2) / count;

  for (let i = 0; i < count; i++) {
    const angle = angleOffset + i * angleStep;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = position[0] * cos - position[1] * sin;
    const y = position[0] * sin + position[1] * cos;
    copies.push([x, y, position[2]]);
  }

  return copies;
};
