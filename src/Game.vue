<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue';
import { Engine } from '@babylonjs/core/Engines';
import Init from './babylonjs/Init.ts';
import Game from './babylonjs/Game/Game.ts';
import PointerLock, {PointerDownRequestLock, PointerLockControlEnabled} from './babylonjs/Utils/PointerLock.ts';

const showMainMenu = ref(true);
const isGameRunning = ref(false);
const isPointerLocked = ref(false);
const currentFPS = ref('0');
const canvas: Ref<HTMLCanvasElement | null> = ref(null);
const fpsMeter: Ref<HTMLCanvasElement | null> = ref(null);
const engine: Ref<Engine | null> = ref(null);
const gameInstance: Ref<Game | null> = ref(null);
const onPointerDownCallback = async () => {
  if (!canvas.value) {
    return;
  }

  await PointerDownRequestLock(isPointerLocked.value, canvas.value);
};
const onRenderingCallback = () => {
  PointerLock(() => {
    isPointerLocked.value = PointerLockControlEnabled();
  });
};
const onRenderingLoopCallback = () => {
  if (!engine.value || !fpsMeter.value) {
    return;
  }

  const fps = (engine.value as Engine).getFps().toFixed();
  if (currentFPS.value !== fps) {
    currentFPS.value = fps;
    (fpsMeter.value as HTMLCanvasElement).innerHTML = `${currentFPS.value} fps`;
  }
};

onMounted(async () => {
  const { canvasElement, fpsMeterElement, gameEngine } = Init('cold-escape', 'cold-escape-fps-meter');
  canvas.value = canvasElement;
  fpsMeter.value = fpsMeterElement;
  engine.value = gameEngine;
});

const startGame = async () => {
  gameInstance.value = new Game({
    canvas: canvas.value as HTMLCanvasElement,
    engine: engine.value as Engine,
    onPointerDownCallback,
    onRenderingCallback,
    onRenderingLoopCallback,
    onOpenMainMenuCallback: (): void => {
      showMainMenu.value = true;
    },
  });
  await (gameInstance.value as Game).createGame();

  continueGame();
};

const continueGame = () => {
  showMainMenu.value = false;
  isGameRunning.value = true;

  (gameInstance.value as Game).doRender();
};
</script>

<template>
  <div id="game-container">
    <div>Press { TAB } to pause/resume the game</div>

    <div id="game-web-wrapper">
      <div id="main-menu-background" :class="{ 'hide-main-menu': !showMainMenu }"></div>
      <div id="main-menu" :class="{ 'hide-main-menu': !showMainMenu }">
        <div>Main Menu</div>

        <div v-if="!isGameRunning" @click="startGame" class="start-continue-game">START GAME</div>
        <div v-if="isGameRunning" @click="continueGame" class="start-continue-game">CONTINUE GAME</div>
      </div>
      <canvas id="cold-escape" />
      <div id="cold-escape-fps-meter"></div>
    </div>
  </div>
</template>

<style scoped>
#game-container {
  width: 75rem;
  aspect-ratio: 16 / 9;
  margin: 0 auto;
}

#cold-escape-fps-meter {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  z-index: 9999;
  display: inline-block;
}

#game-web-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 1rem auto 0;
}

#main-menu-background, #main-menu, #cold-escape {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

#main-menu-background, #main-menu {
  z-index: 1;
  opacity: 1;
  visibility: visible;

  &.hide-main-menu {
    opacity: 0;
    visibility: hidden;
  }
}

#main-menu {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

#main-menu-background {
  opacity: 0.4;
  background-color: #747bff;
}

.start-continue-game {
  display: inline-flex;
  border: 1px solid #8d24bb;
  color: #ecc1ff;
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  cursor: pointer;
  user-select: none;

  &:hover {
    border: 1px solid #61327a;
    background-color: #8d24bb;
    color: #ffffff;
  }
}
</style>
