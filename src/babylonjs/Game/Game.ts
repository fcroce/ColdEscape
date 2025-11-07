import { Engine } from '@babylonjs/core/Engines';
import { Scene } from '@babylonjs/core/scene';
import {Color3, Vector3} from '@babylonjs/core/Maths';
import { HemisphericLight } from '@babylonjs/core/Lights';
import '@babylonjs/core/Collisions/collisionCoordinator.js';
import { registerBuiltInLoaders } from '@babylonjs/loaders/dynamic';
import AbstractScene from '../AbstractScene.ts';
import CreatePlayer from './Player/CreatePlayer.ts';
import EnablePhysics from '../Utils/EnablePhysics.ts';
import { createWorldBox } from './WorldBox.ts';
import { createGround } from './Ground.ts';
import keyboardManager from './Keyboard.ts';
import { createStructures } from './Structures.ts';

export default class Game extends AbstractScene {
    private _inputMap: { [key: string]: boolean } = {};
    private readonly _onOpenMainMenuCallback?: () => void;
    private readonly _worldSize = 5000;
    private readonly _worldAvailable = 5000;

    constructor({
        canvas,
        engine,
        onPointerDownCallback,
        onRenderingCallback,
        onRenderingLoopCallback,
        onOpenMainMenuCallback,
    }: {
        canvas: HTMLCanvasElement,
        engine: Engine,
        onPointerDownCallback?: () => Promise<void>,
        onRenderingCallback?: () => void,
        onRenderingLoopCallback?: () => void,
        onOpenMainMenuCallback?: () => void,
    }) {
        super({
            canvas, engine, onPointerDownCallback, onRenderingCallback, onRenderingLoopCallback
        });

        registerBuiltInLoaders();

        this._onOpenMainMenuCallback = onOpenMainMenuCallback;
    }

    async createGame(): Promise<void> {
        this._scene = super.createScene();

        this._scene.fogMode = Scene.FOGMODE_LINEAR;
        this._scene.fogStart = 0;
        this._scene.fogEnd = this._worldSize;
        this._scene.fogColor = Color3.FromHexString('#cae2f6');
        this._scene.fogDensity = 0.1;

        await EnablePhysics(this._scene);

        const light1 = new HemisphericLight('light1', new Vector3(0,1,0), this._scene);
        light1.intensity = 0.8;

        const world = createWorldBox(this._scene, this._worldSize);

        const {
            ground,
            walls,
            ice,
            changeSnowEmitterPosition,
        } = await createGround(this._scene, this._worldSize, this._worldAvailable, { world });

        const { structures } = await createStructures(ground);

        const {
            player,
            onPlayerCamera,
            mapPlayerMovements,
            mapPlayerStopMovements,
            onSwitchCameras,
        } = await CreatePlayer(this._scene, ground, walls, ice, structures);

        keyboardManager(
            this._inputMap,
            this._scene,
            () => {
                onSwitchCameras(this._inputMap);
            },
            () => {
                mapPlayerStopMovements(this._scene as Scene);
            }
        );

        this._scene.onBeforeRenderObservable.add(async () => {
            mapPlayerMovements(this._inputMap);

            onPlayerCamera();

            changeSnowEmitterPosition(player.position);

            if (this._inputMap['Tab'] && this._onOpenMainMenuCallback) {
                this._inputMap['Tab'] = false;
                this._engine.stopRenderLoop();
                await Engine?.audioEngine?.audioContext?.suspend();
                this._onOpenMainMenuCallback();
            }
        });
    }

    protected async onPointerDown(): Promise<void> {
        await super.onPointerDown();
    }

    public async doRender(): Promise<void> {
        super.doRender();

        await Engine?.audioEngine?.audioContext?.resume();

        this._engine.runRenderLoop(() => {
            if (this._onRenderingLoopCallback) {
                this._onRenderingLoopCallback();
            }

            this._scene?.render();
        });
    }
}