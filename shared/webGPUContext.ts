function fail(message: string): never {
    throw new Error(message);
}

export async function createWebGPUContext() {
    const adapter = await navigator.gpu?.requestAdapter();

    const device = await adapter?.requestDevice();
    if (!device) fail("failed to get device (probably doesn't support WebGPU)");

    const canvas = document.querySelector("canvas");
    if (!canvas) fail("failed to get canvas element");

    const context = canvas.getContext("webgpu");
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

    if (!context) fail("failed to get context");

    return {
        device,
        context,
        presentationFormat,
    };
}
