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

gl.clearColor(1, 1, 1, 1)
gl.clear(gl.COLOR_BUFFER_BIT)

// ---
// shader
class Shader {
    constructor(vertex_shader, fragment_shader) {
        this.vertex_shader
        this.fragment_shader
        this.program_object
        this.attribute = new Map()
        this.uniform = new Map()
        this.model_matrix = mat4.create()

        this.compileVertexShader(vertex_shader)
        this.compileFragmentShader(fragment_shader)
        this.link()

        this.uniform_mvpMatrix = gl.getUniformLocation(this.program_object, "mvpMatrix")
    }

    resetTransform() {
        mat4.identity(this.model_matrix)
    }

    translate(v) {
        mat4.translate(this.model_matrix, this.model_matrix, v)
    }

    scale(v) {
        mat4.scale(this.model_matrix, this.model_matrix, v)
    }

    compileVertexShader(code) {
        var shader = this.compile(code, gl.createShader(gl.VERTEX_SHADER))
        if (shader !== null) {
            this.vertex_shader = shader
        }
    }

    compileFragmentShader(code) {
        var shader = this.compile(code, gl.createShader(gl.FRAGMENT_SHADER))
        if (shader !== null) {
            this.fragment_shader = shader
        }
    }

    compile(code, shader) {
        gl.shaderSource(shader, code)
        gl.compileShader(shader)
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader
        }
        else {
            console.log(gl.getShaderInfoLog(shader))
        }
        return null
    }

    link() {
        var program = gl.createProgram()
        gl.attachShader(program, this.vertex_shader)
        gl.attachShader(program, this.fragment_shader)
        gl.linkProgram(program)
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.useProgram(program)
            this.program_object = program
        }
        else {
            console.log(gl.getProgramInfoLog(program))
        }
    }

    setUniform(name) {
        var uniform = gl.getUniformLocation(this.program_object, name)
        this.uniform.set(name, uniform)
        return uniform
    }

    setAttribute(name, vertices_data, size) {
        var attribute = gl.getAttribLocation(this.program_object, name)
        var vbo = this.createVBO(vertices_data)
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        gl.enableVertexAttribArray(attribute)
        gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, 0, 0)
        this.attribute.set(name, attribute)
        return attribute
    }

    createVBO(data) {
        var vbo = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)
        return vbo
    }

    draw(time, camera) {
        var model_view_projection = mat4.create()
        this.resetTransform()
        mat4.fromZRotation(this.model_matrix, time)
        this.translate(vec3.fromValues(3 * Math.sin(time * 0.711), 0, 0))
        mat4.mul(model_view_projection, camera.view_projection, this.model_matrix)
        gl.uniformMatrix4fv(this.uniform_mvpMatrix, false, model_view_projection)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
}

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
var shader = new Shader(vertex_shader, fragment_shader)

// ---
// triangle
var vertices_position = [
    0, 1.732, 0,
    1, 0, 0,
    -1, 0, 0
]
shader.setAttribute("position", vertices_position, 3)

var vertices_color = [
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0
]
shader.setAttribute("color", vertices_color, 4)

// ---
// camera
class Camera {
    constructor(aspect_ratio) {
        this.view = mat4.create()
        this.eye = vec3.fromValues(0, 0, 10) // Position of the camera
        this.center = vec3.fromValues(0, 0, 0) //Point the camera is looking at
        this.up = vec3.fromValues(0, 1, 0) // 画面の上となる方向。
        mat4.lookAt(this.view, this.eye, this.center, this.up)

        this.projection = mat4.create()
        mat4.perspective(this.projection, angleToRadian(65), aspect_ratio, 0.001, 1000)

        this.view_projection = mat4.create()
        mat4.mul(this.view_projection, this.projection, this.view)
    }
}

function angleToRadian(angle) {
    return Math.PI * angle / 180
}

var camera = new Camera(aspect_ratio)

// ---
// draw
animate()

function animate() {
    var time = Date.now() * 0.001

    for (var i = 0; i < 3; i += 0.1) {
        shader.draw(time + i, camera)
    }

    gl.flush()

    requestAnimationFrame(animate)
}
