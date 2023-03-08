declare module 'fastnoisejs' {
    export const Simplex: any;

    export function Create(seed?: number): Noise;

    export interface Noise {
        SetSeed(seed: number): void;
        SetNoiseType(type: any): void;
        GetNoise(x: number, y: number): number;
    }
}
