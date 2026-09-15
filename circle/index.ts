import shaderCode from "./shader.wgsl?raw";

function fail(message: string): never {
    throw new Error(message);
}

async function createWebGPUContext() {
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

async function main() {
    const { device, context, presentationFormat } = await createWebGPUContext();

    context.configure({
        device,
        format: presentationFormat,
    });

    const module = device.createShaderModule({
        label: "circle shaders",
        code: shaderCode,
    });

    const pipeline = device.createRenderPipeline({
        label: "circle pipeline",
        layout: "auto",
        vertex: {
            module,
        },
        fragment: {
            module,
            targets: [{ format: presentationFormat }],
        },
    });

    const render = () => {
        const renderPassDescriptor: GPURenderPassDescriptor = {
            label: "canvas render pass descriptor",
            colorAttachments: [
                {
                    view: context.getCurrentTexture().createView(),
                    clearValue: [0.3, 0.3, 0.3, 1],
                    loadOp: "clear",
                    storeOp: "store",
                },
            ],
        };

        const commandEncoder = device.createCommandEncoder({
            label: "command encoder",
        });

        const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
        renderPass.setPipeline(pipeline);
        renderPass.draw(6);
        renderPass.end();

        const commandBuffer = commandEncoder.finish();
        device.queue.submit([commandBuffer]);
    };

    render();
}

main().catch((error) => {
    document.body.textContent = error.message;
});
