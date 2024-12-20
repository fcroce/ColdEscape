import { Sound } from '@babylonjs/core/Audio';
import { Scene } from '@babylonjs/core/scene';

const PlayerSounds = (scene: Scene): { [key: string]: Sound } => {
    return {
        walkingOnSnow: new Sound('walkingOnSnowSound', 'human_footsteps_snow.mp3', scene, null, {
            loop: false,
            autoplay: false
        }),

        walkingOnIce: new Sound('walkingOnIceSound', 'human_footsteps_ice.mp3', scene, null, {
            loop: false,
            autoplay: false
        }),

        walkingOnTiles: new Sound('walkingOnTilesSound', 'human_footsteps_tiles.mp3', scene, null, {
            loop: false,
            autoplay: false
        }),

        fallingOnSnow: new Sound('fallingOnSnowSound', 'human_falling_snow.mp3', scene, null, {
            loop: false,
            autoplay: false
        }),

        fallingOnIce: new Sound('fallingOnIceSound', 'human_falling_ice.mp3', scene, null, {
            loop: false,
            autoplay: false
        }),
    };
};

export default PlayerSounds;