
class Shape {
    constructor(vertex_shader, fragment_shader) {
        this.vertex_shader
        this.fragment_shader
        this.program_object
        this.attribute = new Map()
        this.uniform = new Map()
        this.model_matrix = mat4.create()
        this.index_length = 0

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

    setIndexBuffer(index) {
        var ibo = this.createIBO(index)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
        this.index_length = index.length
    }

    createIBO(data) {
        var ibo = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
        return ibo
    }

    draw(time, camera) {
        var model_view_projection = mat4.create()
        this.resetTransform()
        mat4.fromZRotation(this.model_matrix, time)
        this.translate(vec3.fromValues(3 * Math.sin(time * 0.711), 0, 0))
        mat4.mul(model_view_projection, camera.view_projection, this.model_matrix)
        gl.uniformMatrix4fv(this.uniform_mvpMatrix, false, model_view_projection)
        //gl.drawArrays(gl.TRIANGLES, 0, 3)
        gl.drawElements(gl.TRIANGLES, this.index_length, gl.UNSIGNED_SHORT, 0)
    }
}

class Triangle extends Shape {
    constructor(vertex_shader, fragment_shader) {
        super(vertex_shader, fragment_shader)

        this.vertices_position = [
            0, 2 / 1.7320508, 0,
            -1, -1 / 1.7320508, 0,
            1, -1 / 1.7320508, 0
        ]
        this.setAttribute("position", this.vertices_position, 3)

        this.vertices_color = [
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0
        ]
        this.setAttribute("color", this.vertices_color, 4)

        this.index = [
            0, 1, 2
        ]
        this.setIndexBuffer(this.index)
    }
}

class Rectangle extends Shape {
    constructor(vertex_shader, fragment_shader) {
        super(vertex_shader, fragment_shader)

        this.vertices_position = [
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,
            -1.0, 1.0, 0.0
        ]
        this.setAttribute("position", this.vertices_position, 3)

        this.vertices_color = [
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0
        ]
        this.setAttribute("color", this.vertices_color, 4)

        this.index = [
            0, 1, 2,
            0, 2, 3
        ]
        this.setIndexBuffer(this.index)
    }
}
