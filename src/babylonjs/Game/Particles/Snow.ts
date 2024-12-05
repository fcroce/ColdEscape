import { CreateBox } from '@babylonjs/core/Meshes/Builders';
import { ParticleSystem } from '@babylonjs/core/Particles';
import { Scene } from '@babylonjs/core/scene';
import { Texture } from '@babylonjs/core/Materials/Textures';
import { Color4, Vector3 } from '@babylonjs/core/Maths';

const Snow = ({
    scene,
    size = 150,
    snowTexture = '',
    snowCount = 5000,
    snowSpeed = 0.01,
    snowRate = 700,
}: {
    scene: Scene,
    size?: number,
    snowTexture?: string,
    snowCount?: number,
    snowSpeed?: number,
    snowRate?: number,
}): {
    snowSystem: ParticleSystem,
    changeSnowEmitterPosition: (position: Vector3) => void,
} => {
    const snowfall = CreateBox('snowfall', { size: 0.2 }, scene);
    const snowSystem = new ParticleSystem('snowParticles', snowCount, scene);

    if(snowTexture) {
        snowSystem.particleTexture = new Texture(snowTexture, scene);
    } else {
        const textureData = 'data:image/png;base64,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';
        snowSystem.particleTexture = new Texture(
            'data:snowTexture',
            scene,
            true,
            true,
            Texture.BILINEAR_SAMPLINGMODE,
            null,
            null,
            textureData,
            true);
    }

    // Where the particles come from
    snowSystem.emitter = snowfall;
    snowSystem.minEmitBox = new Vector3(-size, 250, size);
    snowSystem.maxEmitBox = new Vector3(size, 200, -size);

    // Colors of all particles
    snowSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
    snowSystem.color2 = new Color4(0.2, 0.5, 1.0, 1.0);
    snowSystem.colorDead = new Color4(0, 0, 0.2, 0.0);

    // Size of each particle (random between...)
    snowSystem.minSize = 0.5;
    snowSystem.maxSize = 1;

    // Lifetime of each particle (random between...)
    snowSystem.minLifeTime = 6;
    snowSystem.maxLifeTime = 12;

    // Emission rate
    snowSystem.emitRate = snowRate;

    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    snowSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;

    // Direction of each particle after it has been emitted
    snowSystem.direction1 = new Vector3(0, -10, -1);
    snowSystem.direction2 = new Vector3(0, -20, -5);

    // Angular speed, in radians
    snowSystem.minAngularSpeed = 0;
    snowSystem.maxAngularSpeed = Math.PI;

    // Speed
    snowSystem.minEmitPower = 1;
    snowSystem.maxEmitPower = 3;
    snowSystem.updateSpeed = snowSpeed;

    const changeSnowEmitterPosition = (position: Vector3): void => {
        snowfall.position.set(position.x, snowfall.position.y, position.z);
    };

    return { snowSystem, changeSnowEmitterPosition };
}

export default Snow;
