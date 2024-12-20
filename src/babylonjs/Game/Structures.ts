import { Scene } from '@babylonjs/core/scene';
import { GroundMesh, Mesh } from '@babylonjs/core/Meshes';
import { SceneLoader } from '@babylonjs/core/Loading';
import { Quaternion } from '@babylonjs/core/Maths';
import { CreateBox } from '@babylonjs/core/Meshes/Builders';
import { StandardMaterial } from '@babylonjs/core/Materials';

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

        const groundHeightAtMainHallPosition = ground.getHeightAtCoordinates(mainHall.position.x, mainHall.position.z);
        mainHall.position.set(mainHall.position.x, groundHeightAtMainHallPosition + mainHall.scaling.y + 0.1, mainHall.position.z);
        mainHall.checkCollisions = true;

        const item1 = CreateBox('item1', { width: 10, height: 10, depth: 10 }, scene);
        item1.position.set(0, groundHeightAtMainHallPosition + 6, 250);
        item1.material = new StandardMaterial('item1Material', scene);
        item1.checkCollisions = true;

        mainHall.addChild(item1);

        structures['mainHall'] = mainHall;

        resolve({ structures });
    });
};
