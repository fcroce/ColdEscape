import { Quaternion, Vector3 } from '@babylonjs/core/Maths';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera, UniversalCamera } from '@babylonjs/core/Cameras';
import { PlayerMesh } from './CreatePlayer.ts';

export const firstViewCameraYPosition = 2;

const createCameras = (scene: Scene, player: PlayerMesh): {
    firstViewCamera: UniversalCamera,
    thirdViewCamera: ArcRotateCamera,
} => {
    const firstViewCamera = new UniversalCamera(
        'PlayerFirstViewCamera',
        new Vector3(player.position.x, player.position.y + firstViewCameraYPosition, player.position.z),
        scene
    );
    firstViewCamera.attachControl(true);

    const thirdViewCamera = new ArcRotateCamera(
        'PlayerThirdViewCamera',
        0,
        0,
        20,
        new Vector3(player.position.x, player.position.y, player.position.z),
        scene
    );

    scene.activeCamera = firstViewCamera;

    return { firstViewCamera, thirdViewCamera };
};

export const mapPlayerCamera = (
    scene: Scene,
    player: PlayerMesh,
    firstViewCamera: UniversalCamera,
    thirdViewCamera: ArcRotateCamera
) => {
    if (scene.activeCamera?.name === 'PlayerFirstViewCamera') {
        const firstViewCameraRotationY = firstViewCamera.rotation.y;

        if(firstViewCameraRotationY === player.rotationQuaternion?.toEulerAngles()?.y) {
            return;
        }

        player.rotationQuaternion = Quaternion.FromEulerAngles(0, firstViewCameraRotationY - Math.PI, 0);
        firstViewCamera.position.set(player.position.x, player.position.y + firstViewCameraYPosition, player.position.z);
    }

    else if (scene.activeCamera?.name === 'PlayerThirdViewCamera') {
        if (!player.isMoving) {
            player.rotationQuaternion = Quaternion.FromEulerAngles(0, player.rotationQuaternion?.toEulerAngles().y || player.rotation.y, 0);
        } else {
            const angle = -(Vector3.GetAngleBetweenVectorsOnPlane(thirdViewCamera.getForwardRay().direction, Vector3.Forward(), Vector3.Up()));
            player.rotationQuaternion = Quaternion.RotationAxis(Vector3.Up(), angle - Math.PI);
        }

        thirdViewCamera.target.set(player.position.x, player.position.y, player.position.z);
    }
};

export const switchCameras = (
    scene: Scene,
    inputMap: { [key: string]: boolean },
    firstViewCamera: UniversalCamera,
    thirdViewCamera: ArcRotateCamera
): void => {
    if (inputMap['c']) {
        if (scene.activeCamera?.name === 'PlayerFirstViewCamera') {
            firstViewCamera.detachControl();
            thirdViewCamera.attachControl(true);
            scene.activeCamera = thirdViewCamera;
        } else if (scene.activeCamera?.name === 'PlayerThirdViewCamera') {
            thirdViewCamera.detachControl();
            firstViewCamera.attachControl(true);
            scene.activeCamera = firstViewCamera;
        }
    }
};

export default createCameras;
