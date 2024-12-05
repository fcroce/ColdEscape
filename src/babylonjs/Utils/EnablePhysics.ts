import HavokPhysics from '@babylonjs/havok';
import { HavokPlugin } from '@babylonjs/core/Physics';
import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths';

export const GRAVITY_ON_LAND = -9.81;

const EnablePhysics = async (scene: Scene): Promise<HavokPlugin> => {
    const havokInterface = await HavokPhysics();
    const plugin = new HavokPlugin(true, havokInterface);
    scene.enablePhysics(new Vector3(0, GRAVITY_ON_LAND, 0), plugin);

    return plugin;
}

export default EnablePhysics;
