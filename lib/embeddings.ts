export function getMockEmbedding(text: string): number[] {
  const dim = 1536;
  const vec = new Array(dim).fill(0);
  for (let i = 0; i < text.length; i++) {
    vec[i % dim] += text.charCodeAt(i) / 255;
}
  return vec;
}

export function getEmbedding(text: string): number[] {
  return getMockEmbedding(text);
}