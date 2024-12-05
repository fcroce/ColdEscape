import { Scene } from '@babylonjs/core/scene';
import { KeyboardEventTypes } from '@babylonjs/core/Events';

const keyboardManager = (
    inputMap: { [key: string]: boolean },
    scene: Scene,
    keyDownCallback?: () => void,
    keyUpCallback?: () => void,
): void => {
    scene.onKeyboardObservable.add((kbInfo) => {
        if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
            inputMap[kbInfo.event.key] = true;

            if (keyDownCallback) {
                keyDownCallback();
            }
        }

        if (kbInfo.type === KeyboardEventTypes.KEYUP) {
            inputMap[kbInfo.event.key] = false;

            if (kbInfo.event.key === 'Shift') {
                inputMap['W'] = false;
                inputMap['S'] = false;
                inputMap['D'] = false;
                inputMap['A'] = false;
            }

            if (kbInfo.event.key === 'W') {
                inputMap['w'] = false;
            }

            if (kbInfo.event.key === 'S') {
                inputMap['s'] = false;
            }

            if (kbInfo.event.key === 'D') {
                inputMap['d'] = false;
            }

            if (kbInfo.event.key === 'A') {
                inputMap['a'] = false;
            }

            if (keyUpCallback) {
                keyUpCallback();
            }
        }
    });
};

export default keyboardManager;
