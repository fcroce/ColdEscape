import { GroundMesh, Mesh } from '@babylonjs/core/Meshes';
import { SceneLoader } from '@babylonjs/core/Loading';
import { CreateBox } from '@babylonjs/core/Meshes/Builders';
import { StandardMaterial } from '@babylonjs/core/Materials';
import { PhysicsAggregate, PhysicsShapeType } from '@babylonjs/core/Physics';
import { Vector3 } from '@babylonjs/core/Maths';

export const STRUCTURES_FRICTION = 0.6;

enum StructureName {
    DOME = 'Dome',
    MODULE_LARGE = 'ModuleLarge',
}

const loadMainHall = async (ground: GroundMesh): Promise<Mesh> => {
    const scene = ground.getScene();
    const { meshes } = await SceneLoader.ImportMeshAsync('', '/', 'Dome.glb', scene);
    const mainHall =  meshes.find(mesh => mesh.id === StructureName.DOME) as Mesh;
    mainHall.position.set(0, 0, 230);

    mainHall.position.y = ground.getHeightAtCoordinates(mainHall.position.x, mainHall.position.z) + 0.1;

    const mainHallPhysics = new PhysicsAggregate(mainHall, PhysicsShapeType.MESH, { mass: 0, friction: STRUCTURES_FRICTION }, scene);
    mainHallPhysics.body.setMassProperties({ mass: 1, inertia: Vector3.ZeroReadOnly });

    const item1 = CreateBox('item1', { width: 10, height: 10, depth: 10 }, scene);
    item1.position.set(mainHall.position.x, mainHall.position.y + 6, mainHall.position.z + 20);
    item1.material = new StandardMaterial('item1Material', scene);

    const item1Physics = new PhysicsAggregate(item1, PhysicsShapeType.BOX, { mass: 0 }, scene);
    item1Physics.body.setMassProperties({ mass: 1, inertia: Vector3.ZeroReadOnly });

    mainHall.addChild(item1);

    return mainHall;
};

const loadModuleLarge = async (ground: GroundMesh): Promise<Mesh> => {
    const scene = ground.getScene();
    const { meshes } = await SceneLoader.ImportMeshAsync('', '/', 'ModuleLarge.glb', scene);
    const moduleLarge =  meshes.find(mesh => mesh.id === StructureName.MODULE_LARGE) as Mesh;
    moduleLarge.position.set(250, 0, 100);

    moduleLarge.position.y = ground.getHeightAtCoordinates(moduleLarge.position.x, moduleLarge.position.z) + 43;

    const moduleLargePhysics = new PhysicsAggregate(moduleLarge, PhysicsShapeType.MESH, { mass: 0, friction: STRUCTURES_FRICTION }, scene);
    moduleLargePhysics.body.setMassProperties({ mass: 1, inertia: Vector3.ZeroReadOnly });

    return moduleLarge;
};

export const createStructures = (ground: GroundMesh): Promise<{
    structures: { [key: string]: Mesh },
}> => {
    return new Promise(async (resolve) => {
        const structures: { [key: string]: Mesh } = {};

        structures[StructureName.DOME] = await loadMainHall(ground);
        structures[StructureName.MODULE_LARGE] = await loadModuleLarge(ground);

        resolve({ structures });
    });
};
