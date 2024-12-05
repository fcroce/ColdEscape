import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths';
import { PhysicsAggregate, PhysicsShapeType } from '@babylonjs/core/Physics';
import '@babylonjs/core/Loading/Plugins/babylonFileLoader';
import { SceneLoader } from '@babylonjs/core/Loading';
import { AnimationRange } from '@babylonjs/core/Animations';
import { Nullable } from '@babylonjs/core/types';
import { Mesh, GroundMesh, AbstractMesh } from '@babylonjs/core/Meshes';
import { Sound } from '@babylonjs/core/Audio';
import { Ray } from '@babylonjs/core/Culling';
import createCameras, { mapPlayerCamera, switchCameras } from './Cameras.ts';
import { PickingInfo } from "@babylonjs/core";

export interface PlayerMesh extends AbstractMesh {
    isMoving: boolean;
    isMovingSoundOn: boolean;
    walkingOnMeshName: string;
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
    const player =  meshes.find(mesh => mesh.id === 'Cube') as PlayerMesh;

    if (!player) {
        throw new Error('Player Mesh not found');
    }

    const groundHeightAtPlayerPosition = ground.getHeightAtCoordinates(player.position.x, player.position.z) + 10;
    player.position.set(0, groundHeightAtPlayerPosition, 0);

    const playerPhysics = new PhysicsAggregate(player, PhysicsShapeType.MESH, { mass: 10, restitution: 0, friction: 50 }, scene);
    playerPhysics.body.disablePreStep = false;

    const playerSkeletons = skeletons[0];

    const playerAnimationIdle: Nullable<AnimationRange> = null;
    const playerAnimationWalk: Nullable<AnimationRange> = playerSkeletons.getAnimationRange('walking');
    const playerAnimationJump: Nullable<AnimationRange> = playerSkeletons.getAnimationRange('walking');

    const walkingOnSnowSound = new Sound('walkingOnSnowSound', 'human_footsteps_snow.mp3', scene, null, {
        loop: false,
        autoplay: false
    });
    const walkingOnIceSound = new Sound('walkingOnIceSound', 'human_footsteps_ice.mp3', scene, null, {
        loop: false,
        autoplay: false
    });
    const walkingOnTilesSound = new Sound('walkingOnTilesSound', 'human_footsteps_tiles.mp3', scene, null, {
        loop: false,
        autoplay: false
    });
    const fallingOnSnowSound = new Sound('fallingOnSnowSound', 'human_falling_snow.mp3', scene, null, {
        loop: false,
        autoplay: false
    });
    const fallingOnIceSound = new Sound('fallingOnIceSound', 'human_falling_ice.mp3', scene, null, {
        loop: false,
        autoplay: false
    });

    player.isMoving = false;
    player.isMovingSoundOn = false;
    player.walkingOnMeshName = ground.name;

    player.onMoving = (): void => {};

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

    const pickFloorType = (): PickingInfo | null => {
        const pick = scene.pickWithRay(ray, predicate, true);

        if (pick?.hit) {
            player.walkingOnMeshName = pick?.pickedMesh?.name || ground.name;
        } else {
            player.walkingOnMeshName = ground.name;
        }

        return pick;
    };

    const animatePlayerIdle = () => {
        player.isMoving = false;
        player.isMovingSoundOn = false;

        walkingOnSnowSound.stop();
        walkingOnIceSound.stop();
        walkingOnTilesSound.stop();
        fallingOnSnowSound.stop();
        fallingOnIceSound.stop();

        if (!playerAnimationIdle) {
            return;
        }

        scene.beginAnimation(
            playerSkeletons,
            (playerAnimationIdle as AnimationRange).from,
            (playerAnimationIdle as AnimationRange).to,
            true,
            1.0
        );
    };

    const animatePlayerWalking = () => {
        player.isMoving = true;

        if (!playerAnimationWalk) {
            return;
        }

        scene.stopAllAnimations();
        scene.beginAnimation(
            playerSkeletons,
            (playerAnimationWalk as AnimationRange).from + 1,
            (playerAnimationWalk as AnimationRange).to,
            false,
            1.0,
            () => {
                animatePlayerIdle();
            }
        );

        pickFloorType();
    };
    const addSoundToPlayerWalking = () => {
        player.isMovingSoundOn = true;

        if (player.walkingOnMeshName === ice.name) {
            walkingOnIceSound.play();
        } else if (player.walkingOnMeshName === structures.mainHall.name) {
            walkingOnTilesSound.play();
        } else {
            walkingOnSnowSound.play();
        }
    };

    const animatePlayerJumping = () => {
        player.isMoving = true;

        if (!playerAnimationJump) {
            return;
        }

        scene.stopAllAnimations();
        scene.beginAnimation(
            playerSkeletons,
            (playerAnimationWalk as AnimationRange).from + 1,
            (playerAnimationWalk as AnimationRange).to,
            // (playerAnimationJump as AnimationRange).from,
            // (playerAnimationJump as AnimationRange).to,
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
            fallingOnIceSound.play();
        } else if (player.walkingOnMeshName === structures.mainHall.name) {
            walkingOnTilesSound.play();
        } else {
            fallingOnSnowSound.play();
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
        jumpSpeed: 0.3,
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
