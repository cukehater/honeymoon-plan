export const toBullets = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
