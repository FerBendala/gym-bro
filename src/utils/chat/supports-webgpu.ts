export const supportsWebGPU = (): boolean => typeof navigator !== 'undefined' && 'gpu' in navigator;


