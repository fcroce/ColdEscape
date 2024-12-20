import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths';
import {
    PhysicsAggregate,
    PhysicsMotionType,
    PhysicsShapeType,
} from '@babylonjs/core/Physics';
import '@babylonjs/core/Loading/Plugins/babylonFileLoader';
import { SceneLoader } from '@babylonjs/core/Loading';
import { Mesh, GroundMesh, AbstractMesh } from '@babylonjs/core/Meshes';
import { Ray } from '@babylonjs/core/Culling';
import createCameras, { mapPlayerCamera, switchCameras } from './Cameras.ts';
import { PickingInfo } from '@babylonjs/core/Collisions';
import PlayerSounds from "./Sounds.ts";
import PlayerAnimations from './Animations.ts';

export interface PlayerMesh extends AbstractMesh {
    playerPhysics: PhysicsAggregate;
    isMoving: boolean;
    isMovingSoundOn: boolean;
    walkingOnMeshName: string;
    interactingWithMeshName: string | null;
    onMoving: ({ direction } : { direction?: string }) => void;
}

const CreatePlayer = async (
    scene: Scene,
    ground: GroundMesh,
    walls: Mesh,
    ice: GroundMesh,
    structures: { [key: string]: Mesh }
): Promise<{
    player: PlayerMesh,
    onPlayerCamera: () => void,
    mapPlayerMovements: (inputMap: { [key: string]: boolean }) => void,
    mapPlayerStopMovements: (scene: Scene) => void,
    onSwitchCameras: (inputMap: { [key: string]: boolean }) => void,
}> => {
    const {
        meshes,
        skeletons,
    } = await SceneLoader.ImportMeshAsync('', '/', 'Low_Poly_Male.babylon', scene);
    const playerMeshes: { [key: string]: AbstractMesh | null } = {
        player: null,
        playerHair: null,
    };

    meshes.forEach((mesh: AbstractMesh) => {
        if (mesh.id === 'Player') {
            playerMeshes.player = mesh as PlayerMesh;
        }

        if (mesh.id === 'Hair') {
            playerMeshes.playerHair = mesh;
        }
    });

    if (!playerMeshes.player) {
        throw new Error('Player Mesh not found');
    }

    if (playerMeshes.playerHair) {
        playerMeshes.player.addChild(playerMeshes.playerHair);
    }

    const player =  playerMeshes.player as PlayerMesh;

    const sounds = PlayerSounds(scene);

    const groundHeightAtPlayerPosition = ground.getHeightAtCoordinates(player.position.x, player.position.z) + 10;
    player.position.set(0, groundHeightAtPlayerPosition, 0);

    player.playerPhysics = new PhysicsAggregate(player, PhysicsShapeType.CAPSULE, { mass: 1, restitution: 0, friction: 1 }, scene);
    player.playerPhysics.body.disablePreStep = false;
    player.playerPhysics.body.setMotionType(PhysicsMotionType.DYNAMIC);
    player.playerPhysics.body.setCollisionCallbackEnabled(true)
    player.playerPhysics.body.setMassProperties({ mass: 40, inertia: Vector3.ZeroReadOnly });
    player.playerPhysics.body.setGravityFactor(20);

    const playerSkeleton = skeletons[0];
    const animations = PlayerAnimations(playerSkeleton);

    player.isMoving = false;
    player.isMovingSoundOn = false;
    player.walkingOnMeshName = ground.name;

    player.onMoving = (): void => {};

    const pickFloorType = (): PickingInfo | null => {
        const ray = new Ray(
            player.position,
            new Vector3(0, -1, 0),
            8
        );
        const predicate = (mesh: AbstractMesh) => {
            return [
                ice.name,
                structures.mainHall.name
            ].includes(mesh.name);
        };

        const pick = scene.pickWithRay(ray, predicate, true);

        if (pick?.hit) {
            player.walkingOnMeshName = pick?.pickedMesh?.name || ground.name;
        } else {
            player.walkingOnMeshName = ground.name;
        }

        return pick;
    };

    const pickObjectInteraction = (): PickingInfo | null => {
        const ray = new Ray(
            player.position,
            new Vector3(0, 0, -1),
            5
        );
        const predicate = (mesh: AbstractMesh) => {
            return ![
                player.name,
                ground.name,
                ice.name,
                structures.mainHall.name
            ].includes(mesh.name);
        };

        const pick = scene.pickWithRay(ray, predicate, true);

        if (pick?.hit) {
            player.interactingWithMeshName = pick?.pickedMesh?.name || null;

            console.log('asd', player.interactingWithMeshName)
        } else {
            player.interactingWithMeshName = null;
        }

        return pick;
    };

    const animatePlayerIdle = () => {
        player.isMoving = false;
        player.isMovingSoundOn = false;

        sounds.walkingOnSnow.stop();
        sounds.walkingOnIce.stop();
        sounds.walkingOnTiles.stop();
        sounds.fallingOnSnow.stop();
        sounds.fallingOnIce.stop();

        if (!animations.idle) {
            return;
        }

        scene.beginAnimation(
            playerSkeleton,
            (animations.idle).from,
            (animations.idle).to,
            true,
            1.0
        );
    };

    const animatePlayerWalking = () => {
        player.isMoving = true;

        if (!animations.walkingForward) {
            return;
        }

        scene.beginAnimation(
            playerSkeleton,
            (animations.walkingForward).from + 1,
            (animations.walkingForward).to,
            false,
            1.0,
            () => {
                animatePlayerIdle();
            },
        );

        pickFloorType();
        pickObjectInteraction();
    };
    const addSoundToPlayerWalking = () => {
        player.isMovingSoundOn = true;

        if (player.walkingOnMeshName === ice.name) {
            sounds.walkingOnIce.play();
        } else if (player.walkingOnMeshName === structures.mainHall.name) {
            sounds.walkingOnTiles.play();
        } else {
            sounds.walkingOnSnow.play();
        }
    };

    const animatePlayerJumping = () => {
        player.isMoving = true;

        if (!animations.jumping) {
            return;
        }

        scene.stopAllAnimations();
        scene.beginAnimation(
            playerSkeleton,
            (animations.jumping).from + 1,
            (animations.jumping).to,
            false,
            1.0,
            () => {
                animatePlayerIdle();
            }
        );

        pickFloorType();
    };
    const addSoundToPlayerFalling = () => {
        player.isMovingSoundOn = true;

        if (player.walkingOnMeshName === ice.name) {
            sounds.fallingOnIce.play();
        } else if (player.walkingOnMeshName === structures.mainHall.name) {
            sounds.walkingOnTiles.play();
        } else {
            sounds.fallingOnSnow.play();
        }
    };

    animatePlayerIdle();

    const { firstViewCamera, thirdViewCamera } = createCameras(scene, player);

    const onPlayerCamera = () => {
        mapPlayerCamera(scene, player, firstViewCamera, thirdViewCamera);
    };

    const playerMovements = {
        runningMultiplier: 3,
        forwardSpeed: 0.5,
        backwardSpeed: 0.3,
        strafeSpeed: 0.3,
        jumpSpeed: 2,
    };

    const mapPlayerMovements = (inputMap: { [key: string]: boolean }) => {
        let currentPlayerForwardSpeed = playerMovements.forwardSpeed;
        let currentPlayerStrafeSpeed = playerMovements.strafeSpeed;

        const groundHeightAtPlayerPosition = ground.getHeightAtCoordinates(player.position.x, player.position.z) + 4.8;

        if (player.position.y < groundHeightAtPlayerPosition) {
            player.position.y = groundHeightAtPlayerPosition;
        }

        const currentPlayerPositionBeforeWalls = player.position;

        if (inputMap['Shift']) {
            currentPlayerForwardSpeed = playerMovements.forwardSpeed * playerMovements.runningMultiplier;
            currentPlayerStrafeSpeed = playerMovements.forwardSpeed * playerMovements.runningMultiplier;
        }

        if (inputMap['w'] || inputMap['W']) {
            player.moveWithCollisions(player.forward.scaleInPlace(-currentPlayerForwardSpeed));
            player.onMoving({ direction: 'forward' });

            if (!player.isMoving) {
                animatePlayerWalking();
            }

            if (!player.isMovingSoundOn) {
                addSoundToPlayerWalking();
            }
        }

        if (inputMap['s'] || inputMap['S']) {
            player.moveWithCollisions(player.forward.scaleInPlace(playerMovements.backwardSpeed));
            player.onMoving({ direction: 'backward' });

            if (!player.isMoving) {
                animatePlayerWalking();
            }

            if (!player.isMovingSoundOn) {
                addSoundToPlayerWalking();
            }
        }

        if (inputMap['d'] || inputMap['D']) {
            player.moveWithCollisions(player.right.scaleInPlace(-currentPlayerStrafeSpeed));
            player.onMoving({ direction: 'right' });

            if (!player.isMoving) {
                animatePlayerWalking();
            }

            if (!player.isMovingSoundOn) {
                addSoundToPlayerWalking();
            }
        }

        if (inputMap['a'] || inputMap['A']) {
            player.moveWithCollisions(player.right.scaleInPlace(currentPlayerStrafeSpeed));
            player.onMoving({ direction: 'left' });

            if (!player.isMoving) {
                animatePlayerWalking();
            }

            if (!player.isMovingSoundOn) {
                addSoundToPlayerWalking();
            }
        }

        if(inputMap[' ']) {
            player.moveWithCollisions(player.up.scaleInPlace(playerMovements.jumpSpeed));
            player.onMoving({ direction: 'jump' });

            // TODO - Fix animation and sound

            if (!player.isMoving) {
                animatePlayerJumping();
            }

            if (!player.isMovingSoundOn) {
                addSoundToPlayerFalling();
            }
        }

        if (!player.intersectsMesh(walls)) {
            player.position = new Vector3(
                currentPlayerPositionBeforeWalls.x > 0 ? currentPlayerPositionBeforeWalls.x - 1 : currentPlayerPositionBeforeWalls.x + 1,
                player.position.y,
                currentPlayerPositionBeforeWalls.z > 0 ? currentPlayerPositionBeforeWalls.z - 1 : currentPlayerPositionBeforeWalls.z + 1,
            );
        }
    };

    const mapPlayerStopMovements = (scene: Scene) => {
        scene.stopAllAnimations();
        animatePlayerIdle();
    };

    const onSwitchCameras = (inputMap: { [key: string]: boolean }): void => {
        switchCameras(scene, inputMap, firstViewCamera, thirdViewCamera);
    };

    return { player, onPlayerCamera, mapPlayerMovements, mapPlayerStopMovements, onSwitchCameras };
};

export default CreatePlayer;
