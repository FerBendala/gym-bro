import { pipeline } from '@xenova/transformers';

export const embedTexts = async (texts: string[]): Promise<number[][]> => {
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const outputs: number[][] = [];
  for (const t of texts) {
    // @ts-expect-error xenova types
    const res = await embedder(t, { pooling: 'mean', normalize: true });
    outputs.push(Array.from(res.data));
  }
  return outputs;
};


