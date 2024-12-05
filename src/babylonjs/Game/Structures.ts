import { Scene } from '@babylonjs/core/scene';
import { GroundMesh, Mesh } from '@babylonjs/core/Meshes';
import { SceneLoader } from '@babylonjs/core/Loading';
import { Quaternion } from "@babylonjs/core/Maths";

export const createStructures = (
    scene: Scene,
    ground: GroundMesh,
): Promise<{
    structures: { [key: string]: Mesh },
}> => {
    return new Promise(async (resolve) => {
        const structures: { [key: string]: Mesh } = {};

        const { meshes } = await SceneLoader.ImportMeshAsync('', '/', 'MainHall.glb', scene);
        const mainHall =  meshes.find(mesh => mesh.id === 'MainHall') as Mesh;
        mainHall.position.set(0, mainHall.scaling.y, 230);
        mainHall.rotationQuaternion = Quaternion.FromEulerAngles(0, Math.PI, 0);
        mainHall.checkCollisions = true;

        const groundHeightAtMainHallPosition = ground.getHeightAtCoordinates(mainHall.position.x, mainHall.position.z);
        mainHall.position.set(mainHall.position.x, groundHeightAtMainHallPosition + mainHall.scaling.y + 0.5, mainHall.position.z);

        structures['mainHall'] = mainHall;

        resolve({ structures });
    });
};