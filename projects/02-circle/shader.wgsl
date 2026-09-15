@vertex fn vs(
    @builtin(vertex_index) vertexIndex : u32
) -> @builtin(position) vec4f {
    let position = array(
        // bottom left half of rect
        vec2f(-0.5, 0.5),
        vec2f(-0.5, -0.5),
        vec2f(0.5, -0.5),
        // top right half of rect
        vec2f(-0.5, 0.5),
        vec2f(0.5, 0.5),
        vec2f(0.5, -0.5),
    );

    return vec4f(position[vertexIndex], 0.0, 1.0);
}

@fragment fn fs(@builtin(position) position : vec4f) -> @location(0) vec4f {
    let empty = vec4f(0, 0, 0, 1);
    let color = vec4f(1, 1, 1, 1);
    
    let center = vec2f(200, 200); // hardcoded center of circle

    let distanceFromCenter = distance(position.xy, center);
    let cond = distanceFromCenter <= 100;

    return select(empty, color, cond);
    //return vec4f(1, 1, 1, 1);
}