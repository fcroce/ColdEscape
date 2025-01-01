import { PickingInfo } from '@babylonjs/core/Collisions';
import { Ray } from '@babylonjs/core/Culling';
import { Vector3 } from '@babylonjs/core/Maths';
import { AbstractMesh, GroundMesh, Mesh } from '@babylonjs/core/Meshes';
import { PlayerMesh } from './CreatePlayer.ts';

const pickFloorType = (
    player: PlayerMesh,
    ground: GroundMesh,
    ice: GroundMesh,
    structures: { [key: string]: Mesh }
): PickingInfo | null => {
    const ray = new Ray(
        player.position,
        Vector3.Down(),
        8
    );
    const predicate = (mesh: AbstractMesh) => {
        let isHittingMesh = false;

        if (mesh.name === ice.name) {
            isHittingMesh = true;
        }

        Object.values(structures).forEach(structure => {
            if (mesh.name === structure.name) {
                isHittingMesh = true;
                return;
            }
        });

        return isHittingMesh;
    };

    const pick = player.getScene().pickWithRay(ray, predicate, true);

    if (pick?.hit) {
        player.walkingOnMeshName = pick?.pickedMesh?.name || ground.name;
    } else {
        player.walkingOnMeshName = ground.name;
    }

    return pick;
};

export default pickFloorType;
