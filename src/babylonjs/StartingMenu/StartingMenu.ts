import { Engine } from '@babylonjs/core/Engines';
import { Vector3 } from "@babylonjs/core/Maths";
import { ArcRotateCamera } from "@babylonjs/core/Cameras";
import { AdvancedDynamicTexture, Button, Control, StackPanel } from "@babylonjs/gui";
import AbstractScene from '../AbstractScene.ts';
// import { Client } from 'colyseus.js';

// const ROOM_NAME = 'my_room';
// const ENDPOINT = 'ws://localhost:2567';

export default class StartingMenu extends AbstractScene {
    private _onCreateGameCallback: (() => void) | undefined;
    private _onExitCallback: (() => void) | undefined;
    private _camera: ArcRotateCamera | null = null;
    private _advancedTexture: AdvancedDynamicTexture | null = null;
    private _buttonsDefaultColor = '#c0c0c0';
    // private _colyseus: Client = new Client(ENDPOINT);

    constructor({
        canvas,
        engine,
        onRenderingLoopCallback,
        onCreateGameCallback,
        onExitCallback
    }: {
        canvas: HTMLCanvasElement,
        engine: Engine,
        onRenderingLoopCallback?: () => void,
        onCreateGameCallback?: () => void
        onExitCallback?: () => void
    }) {
        super({
            canvas, engine, onRenderingLoopCallback
        });
        this._onCreateGameCallback = onCreateGameCallback;
        this._onExitCallback = onExitCallback;
    }

    async createMenu(): Promise<void> {
        this._scene = super.createScene();

        this._camera = new ArcRotateCamera('camera', Math.PI / 2, 1.0, 110, Vector3.Zero(), this._scene);
        this._camera.useAutoRotationBehavior = true;
        this._camera.setTarget(Vector3.Zero());

        this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');

        const stackPanel = new StackPanel();
        stackPanel.isVertical = true;
        stackPanel.height = '60%';
        stackPanel.spacing = 20;
        stackPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        stackPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

        const createGameButton = this.createMenuButton('createGame', 'CREATE GAME');
        createGameButton.color = '#a6ff73';
        createGameButton.pointerEnterAnimation = () => {
            createGameButton.color = '#c1ff98';
        }

        createGameButton.pointerOutAnimation = () => {
            createGameButton.color = '#a6ff73';
        }
        createGameButton.onPointerClickObservable.add(async () => {
            if (this._onCreateGameCallback) {
                this._onCreateGameCallback();
            }
        });
        stackPanel.addControl(createGameButton);

        const exitGameButton = this.createMenuButton('exitGame', 'EXIT GAME');
        exitGameButton.pointerEnterAnimation = () => {
            exitGameButton.color = '#fd4e4e';
        }

        exitGameButton.pointerOutAnimation = () => {
            exitGameButton.color = this._buttonsDefaultColor;
        }
        exitGameButton.onPointerClickObservable.add(async () => {
            this.dispose();

            if (this._onExitCallback) {
                this._onExitCallback();
            }
        });
        stackPanel.addControl(exitGameButton);

        this._advancedTexture.addControl(stackPanel);

        this.doRender();
    }

    private createMenuButton(name: string, text: string): Button {
        const button = Button.CreateSimpleButton(name, text);
        button.width = '20%';
        button.height = '55px';
        button.fontFamily = 'Roboto';
        button.fontSize = '6%';
        button.thickness = 1;
        button.paddingTop = '10px'
        button.hoverCursor = 'pointer';
        button.color = this._buttonsDefaultColor;
        return button;
    }

    protected async onPointerDown(): Promise<void> {
        await super.onPointerDown();
    }

    protected doRender(): void {
        super.doRender();

        this._engine.runRenderLoop(() => {
            if (this._onRenderingLoopCallback) {
                this._onRenderingLoopCallback();
            }

            this._scene?.render();
        });
    }
}