import { Skeleton } from '@babylonjs/core/Bones';
import { Nullable } from '@babylonjs/core/types';
import { AnimationRange } from '@babylonjs/core/Animations';
import { PlayerMesh } from './CreatePlayer.ts';

interface PlayerAnimationsInterface {
    ranges: {
        [key: string]: Nullable<AnimationRange>
    },
    actions: {
        [key: string]: (running?: boolean) => void
    },
}

const PlayerAnimations = (player: PlayerMesh, skeleton: Skeleton): PlayerAnimationsInterface => {
    const idle = null;
    const walkingForward = skeleton.getAnimationRange('walking');
    const walkingBackward = skeleton.getAnimationRange('walking');
    const strifeLeft = skeleton.getAnimationRange('walking');
    const strifeRight = skeleton.getAnimationRange('walking');
    const jumping = null;

    let isAnimationInProgress = false;

    const onStopAllAnimations = (): void => {
        isAnimationInProgress = false;

        onIdle();
    };
    const onIdle = (): void => {
        if (!idle || isAnimationInProgress) {
            return;
        }

        player.getScene().beginAnimation(
            skeleton,
            (idle as AnimationRange).from,
            (idle as AnimationRange).to,
            true,
            1.0,
            () => {
                isAnimationInProgress = false;
            },
        );
    };
    const onWalkingForward = (running = false): void => {
        if (!walkingForward || isAnimationInProgress) {
            return;
        }

        isAnimationInProgress = true;

        player.getScene().beginAnimation(
            skeleton,
            (walkingForward as AnimationRange).from + 1,
            (walkingForward as AnimationRange).to,
            false,
            running ? 1.5 : 1,
            () => {
                onStopAllAnimations();
            },
        );
    };
    const onWalkingBackward = (): void => {
        if (!walkingBackward || isAnimationInProgress) {
            return;
        }

        isAnimationInProgress = true;

        player.getScene().beginAnimation(
            skeleton,
            (walkingBackward as AnimationRange).from + 1,
            (walkingBackward as AnimationRange).to,
            false,
            1,
            () => {
                onStopAllAnimations();
            },
        );
    };
    const onStrifeLeft = (running = false): void => {
        if (!strifeLeft || isAnimationInProgress) {
            return;
        }

        isAnimationInProgress = true;

        player.getScene().beginAnimation(
            skeleton,
            (strifeLeft as AnimationRange).from + 1,
            (strifeLeft as AnimationRange).to,
            false,
            running ? 1.5 : 1,
            () => {
                onStopAllAnimations();
            },
        );
    };
    const onStrifeRight = (running = false): void => {
        if (!strifeRight || isAnimationInProgress) {
            return;
        }

        isAnimationInProgress = true;

        player.getScene().beginAnimation(
            skeleton,
            (strifeRight as AnimationRange).from + 1,
            (strifeRight as AnimationRange).to,
            false,
            running ? 1.5 : 1,
            () => {
                onStopAllAnimations();
            },
        );
    };

    return {
        ranges: {
            idle,
            walkingForward,
            walkingBackward,
            strifeLeft,
            strifeRight,
            jumping,
        },
        actions: {
            onStopAllAnimations,
            onIdle,
            onWalkingForward,
            onWalkingBackward,
            onStrifeLeft,
            onStrifeRight,
        },
    };
};

export const onWalkingForward = (): void => {

};

export default PlayerAnimations;