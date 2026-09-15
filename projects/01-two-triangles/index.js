async function main() {
    const adapter = await navigator.gpu?.requestAdapter();
    const device = await adapter?.requestDevice();

    if (!device) {
        document.body.textContent =
            "need a browser that supports WebGPU";
        return;
    }

    const canvas = document.querySelector("canvas");

    const context = canvas.getContext("webgpu");
    const presentationFormat =
        navigator.gpu.getPreferredCanvasFormat();

    context.configure({
        device,
        format: presentationFormat,
    });

    const module = device.createShaderModule({
        label: "our hardcoded red triangle shaders",
        code: `
            @vertex fn vs(
                @builtin(vertex_index) vertexIndex : u32
            ) -> @builtin(position) vec4f {
                let pos = array(
                    vec2f(0, 0),
                    vec2f(-0.5, -0.5),
                    vec2f(0.5, -0.5),
                    vec2f(0, 0),
                    vec2f(-0.5, 0.5),
                    vec2f(0.5, 0.5),
                );
        
                return vec4f(pos[vertexIndex], 0.0, 1.0);
            }
        
            @fragment fn fs() -> @location(0) vec4f {
                return vec4f(1.0, 1.0, 1.0, 1.0);
            }
        `,
    });

    const pipeline = device.createRenderPipeline({
        label: "triangle pipeline",
        layout: "auto",
        vertex: {
            module,
        },
        fragment: {
            module,
            targets: [{ format: presentationFormat }],
        },
    });

    const renderPassDescriptor = {
        label: "our basic canvas renderPass",
        colorAttachments: [
            {
                clearValue: [0.3, 0.3, 0.3, 1],
                loadOp: "clear",
                storeOp: "store",
            },
        ],
    };

    function render() {
        renderPassDescriptor.colorAttachments[0].view = context
            .getCurrentTexture()
            .createView();

        const encoder = device.createCommandEncoder({
            label: "encoder",
        });

        const pass = encoder.beginRenderPass(renderPassDescriptor);
        pass.setPipeline(pipeline);
        pass.draw(6);
        pass.end();

        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
    }

    const maxSize = device.limits.maxTextureDimension2D;
    const observer = new ResizeObserver(([entry]) => {
        const { inlineSize, blockSize } = entry.contentBoxSize[0];
        const dpr = window.devicePixelRatio;

        canvas.width = Math.max(
            1,
            Math.min(Math.round(inlineSize * dpr), maxSize),
        );

        canvas.height = Math.max(
            1,
            Math.min(Math.round(blockSize * dpr), maxSize),
        );

        render();
    });

    observer.observe(canvas);
}

main();