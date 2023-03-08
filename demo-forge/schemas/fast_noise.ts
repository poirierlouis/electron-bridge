import {Schema} from '@lpfreelance/electron-bridge-cli';
import * as fastnoise from 'fastnoisejs';
import {Noise} from 'fastnoisejs';

@Schema(false)
export class FastNoise {
    private noise: Noise;

    constructor() {
        this.noise = fastnoise.Create();
        this.noise.SetNoiseType(fastnoise.Simplex);
    }

    /**
     * Generate a height map of size (width * height), with an optional seed. Set normalize to return values within the
     * range [0, 1] (default [-1, 1]).
     */
    public async generateHeightMap(
        width: number,
        height: number,
        seed?: number,
        normalize?: boolean
    ): Promise<number[][]> {
        const terrain: number[][] = [];

        if (seed) {
            this.noise.SetSeed(seed);
        }
        for (let y = 0; y < height; y++) {
            const row: number[] = [];

            for (let x = 0; x < width; x++) {
                let value: number = this.noise.GetNoise(x, y);

                if (normalize) {
                    value = value / 2.0 + 0.5;
                }
                row.push(value);
            }
            terrain.push(row);
        }
        return terrain;
    }
}
