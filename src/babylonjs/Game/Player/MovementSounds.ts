import { PlayerMesh } from './CreatePlayer.ts';
import PlayerSounds from './Sounds.ts';
import { GroundMesh, Mesh } from '@babylonjs/core/Meshes';
import { Sound } from '@babylonjs/core/Audio';

interface MovementSoundsInterface {
    stop: () => void;
    moving: () => void;
    touchDown: () => void;
}

const MovementSounds = (
    player: PlayerMesh,
    ground: GroundMesh,
    ice: GroundMesh,
    structures: { [key: string]: Mesh }
): MovementSoundsInterface => {
    const sounds = PlayerSounds(player.getScene());

    let isMovingSoundOn = false;
    let currentFloorType: string | null = null;

    const playSound = (sound: Sound) => {
        if (!isMovingSoundOn) {
            isMovingSoundOn = true;
            sound.play();
            sound.onended = () => {
                isMovingSoundOn = false;
            };
        }
    };

    const stop = (): void => {
        Object.values(sounds).forEach(sound => {
            sound.stop();
        });
    };

    const moving = (): void => {
        if (!player.isMoving) {
            return;
        }

        if (currentFloorType !== player.walkingOnMeshName) {
            stop();
        }

        if (player.walkingOnMeshName === ground.name) {
            currentFloorType = player.walkingOnMeshName;
            playSound(sounds.walkingOnSnow);
            return;
        }

        if (player.walkingOnMeshName === ice.name) {
            currentFloorType = player.walkingOnMeshName;
            playSound(sounds.walkingOnIce);
            return;
        }

        if (structures[player.walkingOnMeshName]) {
            currentFloorType = player.walkingOnMeshName;
            playSound(sounds.walkingOnTiles);
            return;
        }
    };

    const touchDown = (): void => {
        if (player.walkingOnMeshName === ground.name) {
            playSound(sounds.fallingOnSnow);
            return;
        }

        if (player.walkingOnMeshName === ice.name) {
            playSound(sounds.fallingOnIce);
            return;
        }

        if (structures[player.walkingOnMeshName]) {
            playSound(sounds.walkingOnTiles);
            return;
        }
    };

    return {
        stop,
        moving,
        touchDown,
    };
};

export default MovementSounds;
