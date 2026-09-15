# Notes for the circle experiment.

## Boilerplate code explained.

`createWebGPUContext` returns the device, context and presentationFormat so the main function is less cluttered. This boilerplate should be the same across all projects, so it'll be copy pasted.

We configure the canvas's context to use the presentationFormat as the format. This is noted as "not really that important what it is but querying it will make things faster for the user’s system."

Then we create the module for the shaders. This contains our code written in `shader.wgsl` that is imported thanks to the help of Vite.

A pipeline is then created, which takes in the module's vertex and fragment shader functions. If we have multiple in one module, we can write the `entryPoint` that is going to be used in the pipeline.

Then we begin to set up the actual instructions to render our "image" on to the canvas/screen.

The `renderPassDescriptor` is essentially a list of textures that will be rendered to, and how they will be treated. We set the `view` to our canvas's texture, color the background with gray. `loadOp` being set to `clear` essentially means that each frame, fill the texture with the `clearValue`. `storeOp`'s value of `store` means to store the result of what we drew onto the texture.

We create a command encoder and begin a render pass from it. The render pass records which pipeline to use and how many vertices to draw. Nothing runs yet: `finish()` packages the commands into a command buffer, and `submit` sends it to the GPU, which then runs the shader functions in parallel.

We then can call this `render` function to render our image.

## Our shader code explained.

We define our vertex shader function, `vs`, and our fragment shader function, `fs`.

Our vertex function outputs what position the current vertex is at. So, if we have an index of 0, we get (-0.5, 0.5). This is hardcoded in an array within the function.

Our fragment shader function determines what color the pixel should be. This function runs for every pixel within the bounds of the 3 vertices, assuming we are using the triangle-list topology. This essentially means that for every 3 vertices, a triangle is created and rasterized, and then colored.

What we do to create a circle, is first make two triangles that are equal in size to create a rectangle. This is based off the fact that if we cut a rectangle in half diagonally, we get two triangles.

Then, the rasterized pixels are passed to the fragment shader function. This is where we can determine whether or not a pixel is within a certain distance from a center of a point, which we can use to create a radius of the circle and make the pixel black or white.

**THE BIGGEST THING TO LEARN:**

In our fragment shader functions, `@builtin(position)` is in pixels, not clip space like in `vs`. This means that instead of the center of the canvas being (0, 0), the center of the canvas is (width/2, height/2), and (0, 0) is the top-left corner. So, if we want to go towards the bottom of the screen, our y-value goes up from 0, and if we want to go right of the screen, our x-value goes up.

Also, the position points at the center of each pixel, so the top-left pixel is (0.5, 0.5), not (0, 0). This matters when doing math like `% 2` on positions, since the values are never whole numbers. Use `floor` or convert to `u32` first.