import { Engine } from '@babylonjs/core/Engines';

const Init = (canvasElementId: string, fpsMeterElementId?: string): {
    canvasElement: HTMLCanvasElement,
    fpsMeterElement: HTMLCanvasElement | null,
    gameEngine: Engine
} => {
    const canvasElement = document.getElementById(canvasElementId) as HTMLCanvasElement;
    const fpsMeterElement = fpsMeterElementId ? document.getElementById(fpsMeterElementId) as HTMLCanvasElement : null;
    const gameEngine = new Engine(canvasElement, true);

    return { canvasElement, fpsMeterElement, gameEngine };
};

export default Init;
