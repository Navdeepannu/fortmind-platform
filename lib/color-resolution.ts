import type {
  ColorEntry,
  ColorInventory,
  ColorMode,
  ColorScope,
} from "./color-inventory";

export interface ResolvedColor {
  hex: string;
  alpha: number;
  css: string;
  rgb: [number, number, number];
}
export type ResolvedColors = Record<ColorMode, Record<string, ResolvedColor>>;
export const colorKey = (scope: ColorScope, name: string) => `${scope}:${name}`;

export function splitColorAlpha(css: string): {
  opaque: string;
  alpha: number;
} {
  const slash = css.match(/\s*\/\s*([\d.]+)(%)?\s*\)$/);
  if (slash)
    return {
      opaque: css.replace(/\s*\/\s*[\d.]+%?\s*\)$/, ")"),
      alpha: Math.max(0, Math.min(1, Number(slash[1]) / (slash[2] ? 100 : 1))),
    };
  const legacy = css.match(/^rgba\((.*),\s*([\d.]+)\)$/);
  if (legacy) return { opaque: `rgb(${legacy[1]})`, alpha: Number(legacy[2]) };
  return { opaque: css, alpha: 1 };
}
export function rgbaHex(rgb: number[], alpha: number) {
  const byte = (value: number) =>
    Math.round(Math.max(0, Math.min(255, value)))
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `#${rgb.slice(0, 3).map(byte).join("")}${alpha < 1 ? byte(alpha * 255) : ""}`;
}
export function resolveInventoryColors(
  inventory: ColorInventory,
  additional: ColorEntry[] = [],
): ResolvedColors {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d", {
    willReadFrequently: true,
    colorSpace: "srgb",
  });
  if (!context)
    throw new Error("This browser cannot resolve sRGB colors with Canvas 2D.");
  const result: ResolvedColors = { light: {}, dark: {} };
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText =
    "position:fixed;visibility:hidden;pointer-events:none;width:0;height:0;overflow:hidden;contain:strict";
  document.body.append(host);
  try {
    for (const mode of ["light", "dark"] as const)
      for (const scope of ["global", "dashboard"] as const) {
        const probe = document.createElement("span");
        for (const [name, value] of Object.entries(
          inventory.variables[mode][scope],
        ))
          probe.style.setProperty(name, value);
        host.append(probe);
        const entries = [...inventory.entries, ...additional].filter(
          (entry) => entry.scope === scope,
        );
        for (const entry of entries) {
          probe.style.color = "";
          probe.style.color = entry.token ? `var(${entry.name})` : entry[mode];
          const css = getComputedStyle(probe).color;
          const { opaque, alpha } = splitColorAlpha(css);
          // Paint opaque RGB separately: unpremultiplying a 3.5% pixel would distort its channels.
          context.clearRect(0, 0, 1, 1);
          context.fillStyle = opaque;
          context.fillRect(0, 0, 1, 1);
          const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
          result[mode][entry.id] = {
            hex: rgbaHex([r, g, b], alpha),
            alpha,
            css,
            rgb: [r, g, b],
          };
        }
        probe.remove();
      }
  } finally {
    host.remove();
  }
  return result;
}
export function contrastRatio(ink: ResolvedColor, surface: ResolvedColor) {
  const luminance = (rgb: number[]) =>
    rgb
      .map((v) => {
        v /= 255;
        return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      })
      .reduce((sum, v, index) => sum + v * [0.2126, 0.7152, 0.0722][index], 0);
  const composited = ink.rgb.map(
    (channel, index) =>
      channel * ink.alpha + surface.rgb[index] * (1 - ink.alpha),
  );
  const a = luminance(composited),
    b = luminance(surface.rgb);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
