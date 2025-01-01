import { Scene } from '@babylonjs/core/scene';
import { Axis, Vector3 } from '@babylonjs/core/Maths';
import {
    PhysicsAggregate,
    PhysicsMotionType,
    PhysicsShapeType,
} from '@babylonjs/core/Physics';
import '@babylonjs/core/Loading/Plugins/babylonFileLoader';
import { SceneLoader } from '@babylonjs/core/Loading';
import { Mesh, GroundMesh, AbstractMesh, CreateCapsule } from '@babylonjs/core/Meshes';
import { Ray } from '@babylonjs/core/Culling';
import createCameras, { mapPlayerCamera, switchCameras } from './Cameras.ts';
import { PickingInfo } from '@babylonjs/core/Collisions';
import PlayerSounds from './Sounds.ts';
import PlayerAnimations from './Animations.ts';
import { GRAVITY_ON_LAND } from '../../Utils/EnablePhysics.ts';
import Directions from './directions.enum.ts';

export interface PlayerMesh extends Mesh {
    playerPhysics: PhysicsAggregate;
    isMoving: boolean;
    isMovingSoundOn: boolean;
    isFalling: boolean;
    walkingOnMeshName: string;
    interactingWithMeshName: string | null;
    onMoving: ({ direction, isRunning } : { direction?: string, isRunning?: boolean }) => void;
    onTouchDown: () => void;
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
            playerMeshes.player = mesh;
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

    let player = CreateCapsule('player', { height: 8.5, radius: 2 }, scene) as PlayerMesh;
    player.bakeCurrentTransformIntoVertices();
    player.isVisible = false;
    player.addChild(playerMeshes.player);

    const groundHeightAtPlayerPosition = (): number => {
        const groundHeightAtCoordinates = ground.getHeightAtCoordinates(player.position.x, player.position.z);

        return groundHeightAtCoordinates < ice.position.y
            ? ice.position.y + 3.8
            : groundHeightAtCoordinates + 3.8;
    }
    player.position.set(0, groundHeightAtPlayerPosition(), -100);

    player.playerPhysics = new PhysicsAggregate(player, PhysicsShapeType.CAPSULE, { mass: 1, restitution: 0, friction: 1 }, scene);
    player.playerPhysics.body.disablePreStep = false;
    player.playerPhysics.body.setMotionType(PhysicsMotionType.DYNAMIC);
    player.playerPhysics.body.setMassProperties({ mass: 60, inertia: Vector3.ZeroReadOnly });

    const playerSkeleton = skeletons[0];
    const animations = PlayerAnimations(player, playerSkeleton);

    player.isMoving = false;
    player.onMoving = ({ direction, isRunning } : { direction?: string, isRunning?: boolean }): void => {
        player.isMoving = true;

        if (direction === Directions.FORWARD) {
            animations.actions.onWalkingForward(isRunning);
        }

        if (direction === Directions.BACKWARD) {
            animations.actions.onWalkingBackward();
        }

        if (direction === Directions.LEFT) {
            animations.actions.onStrifeLeft(isRunning);
        }

        if (direction === Directions.RIGHT) {
            animations.actions.onStrifeRight(isRunning);
        }
    };
    player.onTouchDown = (): void => {
        console.log('Touch Down!')
    };

    // player.isMovingSoundOn = false;
    // player.walkingOnMeshName = ground.name;

    // const sounds = PlayerSounds(scene);

    // const pickFloorType = (): PickingInfo | null => {
    //     const ray = new Ray(
    //         player.position,
    //         new Vector3(0, -1, 0),
    //         8
    //     );
    //     const predicate = (mesh: AbstractMesh) => {
    //         return [
    //             ice.name,
    //             structures.mainHall.name
    //         ].includes(mesh.name);
    //     };
    //
    //     const pick = scene.pickWithRay(ray, predicate, true);
    //
    //     if (pick?.hit) {
    //         player.walkingOnMeshName = pick?.pickedMesh?.name || ground.name;
    //     } else {
    //         player.walkingOnMeshName = ground.name;
    //     }
    //
    //     return pick;
    // };
    //
    // const pickObjectInteraction = (): PickingInfo | null => {
    //     const ray = new Ray(
    //         player.position,
    //         new Vector3(0, 0, -1),
    //         5
    //     );
    //     const predicate = (mesh: AbstractMesh) => {
    //         return ![
    //             player.name,
    //             ground.name,
    //             ice.name,
    //             structures.mainHall.name
    //         ].includes(mesh.name);
    //     };
    //
    //     const pick = scene.pickWithRay(ray, predicate, true);
    //
    //     if (pick?.hit) {
    //         player.interactingWithMeshName = pick?.pickedMesh?.name || null;
    //
    //         console.log('asd', player.interactingWithMeshName)
    //     } else {
    //         player.interactingWithMeshName = null;
    //     }
    //
    //     return pick;
    // };
    //
    // const animatePlayerIdle = () => {
    //     player.isMovingSoundOn = false;
    //
    //     sounds.walkingOnSnow.stop();
    //     sounds.walkingOnIce.stop();
    //     sounds.walkingOnTiles.stop();
    //     sounds.fallingOnSnow.stop();
    //     sounds.fallingOnIce.stop();
    //
    //     if (!animations.idle) {
    //         return;
    //     }
    //
    //     scene.beginAnimation(
    //         playerSkeleton,
    //         (animations.idle).from,
    //         (animations.idle).to,
    //         true,
    //         1.0
    //     );
    // };
    //
    // const animatePlayerWalking = () => {
    //     if (!animations.walkingForward) {
    //         return;
    //     }
    //
    //     scene.beginAnimation(
    //         playerSkeleton,
    //         (animations.walkingForward).from + 1,
    //         (animations.walkingForward).to,
    //         false,
    //         1.0,
    //         () => {
    //             animatePlayerIdle();
    //         },
    //     );
    //
    //     pickFloorType();
    //     pickObjectInteraction();
    // };
    // const addSoundToPlayerWalking = () => {
    //     player.isMovingSoundOn = true;
    //
    //     if (player.walkingOnMeshName === ice.name) {
    //         sounds.walkingOnIce.play();
    //     } else if (player.walkingOnMeshName === structures.mainHall.name) {
    //         sounds.walkingOnTiles.play();
    //     } else {
    //         sounds.walkingOnSnow.play();
    //     }
    // };
    //
    // const animatePlayerJumping = () => {
    //     if (!animations.jumping) {
    //         return;
    //     }
    //
    //     scene.stopAllAnimations();
    //     scene.beginAnimation(
    //         playerSkeleton,
    //         (animations.jumping).from + 1,
    //         (animations.jumping).to,
    //         false,
    //         1.0,
    //         () => {
    //             animatePlayerIdle();
    //         }
    //     );
    //
    //     pickFloorType();
    // };
    // const addSoundToPlayerFalling = () => {
    //     player.isMovingSoundOn = true;
    //
    //     if (player.walkingOnMeshName === ice.name) {
    //         sounds.fallingOnIce.play();
    //     } else if (player.walkingOnMeshName === structures.mainHall.name) {
    //         sounds.walkingOnTiles.play();
    //     } else {
    //         sounds.fallingOnSnow.play();
    //     }
    // };
    //
    // animatePlayerIdle();

    const playerMovements = {
        runningMultiplier: 1.5,
        forwardSpeed: 60,
        backwardSpeed: 45,
        strafeSpeed: 45,
        jumpSpeed: 80,
    };

    const mapPlayerMovements = (inputMap: { [key: string]: boolean }) => {
        let currentPlayerForwardSpeed = playerMovements.forwardSpeed;
        let currentPlayerStrafeSpeed = playerMovements.strafeSpeed;

        const groundHeight = groundHeightAtPlayerPosition();

        if (player.position.y < groundHeight) {
            player.position.y = groundHeight;
        }

        const groundMidAirPosition = groundHeight + 1;

        if (player.isFalling && player.position.y <= groundMidAirPosition) {
            player.onTouchDown();
        }

        player.isFalling = player.position.y > groundMidAirPosition;

        const currentPlayerPositionBeforeMoving = player.position;

        let isRunning = false;
        if (inputMap['Shift']) {
            isRunning = true;
            currentPlayerForwardSpeed = playerMovements.forwardSpeed * playerMovements.runningMultiplier;
            currentPlayerStrafeSpeed = playerMovements.strafeSpeed * playerMovements.runningMultiplier;
        }

        const vectors = [];

        if (inputMap['w'] || inputMap['W']) {
            vectors.push(player.forward.scaleInPlace(-currentPlayerForwardSpeed));
            player.onMoving({ direction: Directions.FORWARD, isRunning });

            // if (!player.isMovingSoundOn) {
            //     // addSoundToPlayerWalking();
            // }
        }

        if (inputMap['s'] || inputMap['S']) {
            vectors.push(player.forward.scaleInPlace(playerMovements.backwardSpeed));
            player.onMoving({ direction: Directions.BACKWARD });

            // if (!player.isMovingSoundOn) {
            //     // addSoundToPlayerWalking();
            // }
        }

        if (inputMap['d'] || inputMap['D']) {
            vectors.push(player.right.scaleInPlace(-currentPlayerStrafeSpeed));
            player.onMoving({ direction: Directions.RIGHT, isRunning });

            // if (!player.isMovingSoundOn) {
            //     // addSoundToPlayerWalking();
            // }
        }

        if (inputMap['a'] || inputMap['A']) {
            vectors.push(player.right.scaleInPlace(currentPlayerStrafeSpeed));
            player.onMoving({ direction: Directions.LEFT, isRunning });

            // if (!player.isMovingSoundOn) {
            //     // addSoundToPlayerWalking();
            // }
        }

        if(inputMap[' '] && !player.isFalling) {
            vectors.push(player.up.scaleInPlace(playerMovements.jumpSpeed));
            player.isFalling = true;
            player.onMoving({ direction: Directions.JUMP });

            // if (!player.isMovingSoundOn) {
            //     // addSoundToPlayerFalling();
            // }
        }

        if (vectors.length) {
            const direction = vectors.reduce((acc, cur) => {
                acc = acc.add(cur);
                return acc;
            }, new Vector3(0, player.isFalling ? player.playerPhysics.body.getLinearVelocity().y : GRAVITY_ON_LAND, 0));

            player.playerPhysics.body.setLinearVelocity(direction);
        }

        player.playerPhysics.body.setGravityFactor(player.isFalling ? 40 : 200);

        if (!player.intersectsMesh(walls)) {
            player.position = new Vector3(
                currentPlayerPositionBeforeMoving.x > 0 ? currentPlayerPositionBeforeMoving.x - 1 : currentPlayerPositionBeforeMoving.x + 1,
                player.position.y,
                currentPlayerPositionBeforeMoving.z > 0 ? currentPlayerPositionBeforeMoving.z - 1 : currentPlayerPositionBeforeMoving.z + 1,
            );
        }
    };

    const mapPlayerStopMovements = (scene: Scene) => {
        scene.stopAllAnimations();
        player.isMoving = false;
        animations.actions.onStopAllAnimations();
    };

    const { firstViewCamera, thirdViewCamera } = createCameras(scene, player);

    const onPlayerCamera = () => {
        mapPlayerCamera(scene, player, firstViewCamera, thirdViewCamera);
    };

    const onSwitchCameras = (inputMap: { [key: string]: boolean }): void => {
        switchCameras(scene, inputMap, firstViewCamera, thirdViewCamera);
    };

    return { player, onPlayerCamera, mapPlayerMovements, mapPlayerStopMovements, onSwitchCameras };
};

export default CreatePlayer;
