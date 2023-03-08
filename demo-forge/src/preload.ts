import {PreloadService} from '@lpfreelance/electron-bridge/preload';
import {ClipboardModule} from './bridge/preload/clipboard.module';
import {FastNoiseModule} from './bridge/preload/fast_noise.module';

const preloadService = new PreloadService();

preloadService
    .add(ClipboardModule)
    .add(FastNoiseModule)
    .expose();
