import { Scene } from '@babylonjs/core/scene';
import { CreateBox } from '@babylonjs/core/Meshes/Builders';
import { StandardMaterial } from '@babylonjs/core/Materials';
import { CubeTexture, Texture } from '@babylonjs/core/Materials/Textures';
import { Color3 } from '@babylonjs/core/Maths';
import { Mesh } from '@babylonjs/core/Meshes';
import getRootUrl from '../Utils/RootUrl.ts';

export const createWorldBox = (scene: Scene, size: number): Mesh => {
    const worldBox = CreateBox('worldBox', { size: size * 2 }, scene);
    const worldBoxMaterial = new StandardMaterial('worldBox', scene);
    worldBoxMaterial.backFaceCulling = false;
    worldBoxMaterial.reflectionTexture = new CubeTexture(`${getRootUrl()}TropicalSunnyDay/TropicalSunnyDay`, scene);
    worldBoxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    worldBoxMaterial.diffuseColor = new Color3(0, 0, 0);
    worldBoxMaterial.specularColor = new Color3(0, 0, 0);
    worldBox.material = worldBoxMaterial;

    return worldBox;
}