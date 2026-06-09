export const commonUtils = {
  async delay(min = 1000, max = 3000) {
    const delay = min + Math.random() * (max - min);
    await new Promise((r) => setTimeout(r, delay));
  },
};
