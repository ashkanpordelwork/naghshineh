// Icons exported from Figma as SVG (colours baked in, as designed).
const files = import.meta.glob('../../assets/icons/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export const icon = (name: string): string => {
  const hit = Object.entries(files).find(([p]) => p.endsWith(`/${name}.svg`));
  if (!hit) throw new Error(`missing icon ${name}`);
  return hit[1];
};
