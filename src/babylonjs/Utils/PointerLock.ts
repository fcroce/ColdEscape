const PointerLock = (pointerlockchange: () => void) => {
    document.addEventListener("pointerlockchange", pointerlockchange, false);
}

export const PointerLockControlEnabled = (): boolean => Boolean(document.pointerLockElement || null);

export const PointerDownRequestLock = async (isPointerLocked: boolean, canvas: HTMLCanvasElement) => {
    if (!isPointerLocked) {
        await canvas?.requestPointerLock();
    }
};

export default PointerLock;
