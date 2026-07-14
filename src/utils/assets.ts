export const getAssetUrl = (path: string) => {
  const normalizedPath = path.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${normalizedPath}`;
};
