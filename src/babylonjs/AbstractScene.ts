import { Scene } from '@babylonjs/core/scene';
import { Engine } from '@babylonjs/core/Engines';

export default class AbstractScene {
    protected _scene: Scene | null = null;
    protected _canvas: HTMLCanvasElement;
    protected _engine: Engine;
    protected _onPointerDownCallback: (() => Promise<void>) | undefined;
    protected _onRenderingCallback: (() => void) | undefined;
    protected _onRenderingLoopCallback: (() => void) | undefined;

    constructor({
        canvas,
        engine,
        onPointerDownCallback,
        onRenderingCallback,
        onRenderingLoopCallback
    }: {
        canvas: HTMLCanvasElement,
        engine: Engine,
        onPointerDownCallback?: () => Promise<void>,
        onRenderingCallback?: () => void,
        onRenderingLoopCallback?: () => void
    }) {
        this._canvas = canvas;
        this._engine = engine;
        this._onPointerDownCallback = onPointerDownCallback;
        this._onRenderingCallback = onRenderingCallback;
        this._onRenderingLoopCallback = onRenderingLoopCallback;
    }

    public dispose(): void {
        this._scene?.dispose();
    }

    protected createScene() {
        const scene = new Scene(this._engine);

        scene.onPointerDown = async () => {
            await this.onPointerDown();
        };

        return scene;
    }

    protected async onPointerDown(): Promise<void> {
        if (this._onPointerDownCallback) {
            await this._onPointerDownCallback();
        }
    }

    protected doRender(): void {
        if (this._onRenderingCallback) {
            this._onRenderingCallback();
        }

        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }
}