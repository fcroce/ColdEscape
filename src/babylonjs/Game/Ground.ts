import { CreateBox, CreateGround } from '@babylonjs/core/Meshes/Builders';
import { Scene } from '@babylonjs/core/scene';
import { GroundMesh, Mesh, MeshBuilder } from '@babylonjs/core/Meshes';
import { PhysicsAggregate, PhysicsShapeType } from '@babylonjs/core/Physics';
import { MirrorTexture, StandardMaterial } from '@babylonjs/core/Materials';
import { Color3, Plane, Vector3 } from '@babylonjs/core/Maths';
import { Texture } from '@babylonjs/core/Materials/Textures';
import Snow from './Particles/Snow.ts';
import { Sound } from '@babylonjs/core/Audio';

export const createGround = (
    scene: Scene,
    size: number,
    groundAvailable: number,
    meshes: { [key: string]: Mesh } = {}
): Promise<{
    ground: GroundMesh,
    walls: Mesh,
    ice: GroundMesh,
    changeSnowEmitterPosition: (position: Vector3) => void,
}> => {
    return new Promise((resolve) => {
        const { world } = meshes;

        const ground = MeshBuilder.CreateGroundFromHeightMap(
            'ground',
            'heightMap.png',
            {
                width: size,
                height: size,
                subdivisions: 500,
                minHeight: -30,
                maxHeight: 200,
                onReady: () => {
                    const groundTexture = new Texture('snow.jpg', scene);
                    groundTexture.vScale = 800;
                    groundTexture.uScale = 800;

                    const groundMaterial = new StandardMaterial('groundMaterial', scene);
                    groundMaterial.diffuseTexture = groundTexture;
                    groundMaterial.diffuseColor = Color3.FromHexString('#FFFFFF');
                    groundMaterial.specularColor = Color3.FromHexString('#3c3c3c');

                    ground.material = groundMaterial;

                    new PhysicsAggregate(ground, PhysicsShapeType.MESH, { mass: 0, restitution: 0, friction: 1 }, scene);

                    const walls = createWalls(scene, groundAvailable);

                    const ice = createIce(scene, size, world);

                    const { snowSystem, changeSnowEmitterPosition } = Snow({
                        scene,
                        size: 100,
                        snowCount: 400,
                        snowSpeed: 0.02,
                    });
                    snowSystem.start();

                    new Sound('Wind', 'cold_wind.mp3', scene, null, {
                        loop: true,
                        autoplay: true,
                        volume: 0.1
                    });

                    resolve({ ground, walls, ice, changeSnowEmitterPosition });
                }
            },
            scene
        );
    });
}

const createIce = (scene: Scene, size: number, world: Mesh): GroundMesh => {
    const iceTexture = new Texture('ice.jpg', scene);
    iceTexture.vScale = 350;
    iceTexture.uScale = 350;

    const iceReflectionTexture = new MirrorTexture('iceReflectionTexture', size, scene, true);
    iceReflectionTexture.mirrorPlane = new Plane(0, -1.0, 0, -2.0);
    iceReflectionTexture.renderList = [ world ];
    iceReflectionTexture.level = 0.2;

    const iceMaterial = new StandardMaterial('iceMaterial', scene);
    iceMaterial.diffuseTexture = iceTexture;
    iceMaterial.reflectionTexture = iceReflectionTexture;

    const ice = CreateGround(
        'ice',
        {
            width: size,
            height: size,
        },
        scene
    );

    ice.position.set(0, 0, 0);
    ice.material = iceMaterial;

    new PhysicsAggregate(ice, PhysicsShapeType.MESH, { mass: 0, restitution: 0, friction: 1 }, scene);

    return ice;
};

const createWalls = (scene: Scene, groundAvailable: number) => {
    const wallMaterial = new StandardMaterial('wallsMaterial', scene);
    wallMaterial.alpha = 0;
    wallMaterial.backFaceCulling = true;

    const walls = CreateBox('walls', {
        width: groundAvailable,
        height: 500,
        depth: groundAvailable,
    }, scene);
    walls.position.set(0, 0, 0);
    walls.material = wallMaterial;

    return walls;
};
