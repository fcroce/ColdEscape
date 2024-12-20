import { Skeleton } from '@babylonjs/core/Bones';
import { Nullable } from '@babylonjs/core/types';
import { AnimationRange } from '@babylonjs/core/Animations';

const PlayerAnimations = (skeleton: Skeleton): { [key: string]: Nullable<AnimationRange> } => {
    return {
        idle: null,
        walkingForward: skeleton.getAnimationRange('walking'),
        walkingBackward: skeleton.getAnimationRange('walking'),
        strifeLeft: null,
        strifeRight: null,
        jumping: null,
    };
};

export default PlayerAnimations;