var width = 512
var height = 512
var aspect_ratio = width / height

// ---
// canvas
var canvas = document.createElement("canvas")
canvas.width = width
canvas.height = height
var gl = canvas.getContext("webgl")
document.body.appendChild(canvas)

gl.enable(gl.CULL_FACE)
gl.enable(gl.DEPTH_TEST)

gl.clearColor(1, 1, 1, 1)
gl.clear(gl.COLOR_BUFFER_BIT)

var vertex_shader = `
attribute vec3 position;
attribute vec4 color;
uniform mat4 mvpMatrix;
varying vec4 vColor;

void main(void) {
    vColor = color;
    gl_Position = mvpMatrix * vec4(position, 1.0);
}
`
var fragment_shader = `
precision highp float;

varying vec4 vColor;

void main(void) {
    //gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    gl_FragColor = vColor;
}
`
var shape = new Rectangle(vertex_shader, fragment_shader)
var camera = new Camera(aspect_ratio)

// ---
// draw
animate()

function animate() {
    var time = Date.now() * 0.001

    for (var i = 0; i < 3; i += 0.1) {
        shape.draw(time + i, camera)
    }

    gl.flush()

    requestAnimationFrame(animate)
}
