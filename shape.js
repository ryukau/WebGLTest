
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
        // mat4.fromZRotation(this.model_matrix, time)
        // mat4.rotateZ(this.model_matrix, this.model_matrix, time * 2.48521)
        mat4.rotateY(this.model_matrix, this.model_matrix, time * 0.48521)
        // this.translate(vec3.fromValues(3 * Math.sin(time * 0.711), 0, 0))
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

class Circle extends Shape {
    constructor(vertex_shader, fragment_shader) {
        super(vertex_shader, fragment_shader)

        this.vertices_position = []
        this.vertices_color = []
        this.index = []

        this.create()

        this.setAttribute("position", this.vertices_position, 3)
        this.setAttribute("color", this.vertices_color, 4)
        this.setIndexBuffer(this.index)
    }

    create() {
        var div = 128
        var tp_div = 2 * Math.PI / div
        var r = 0.1

        var sin, cos, theta
        this.vertices_position.push(0, 0, 0) // 中央
        this.vertices_color.push(1, 1, 1, 1) // 中央
        for (var i = 0; i < div; ++i) {
            theta = tp_div * i
            sin = Math.sin(theta)
            cos = Math.cos(theta)

            this.vertices_position.push(
                r * cos,
                r * sin,
                0
            )

            this.vertices_color.push(
                0.5 * sin + 0.5,
                0.5 * sin + 0.5,
                0.5 * cos + 0.5,
                1
            )
        }

        for (var i = 1; i < div; ++i) {
            this.index.push(0, i, i + 1)
        }
        this.index.push(0, div, 1)
    }
}

class Torus extends Shape {
    constructor(vertex_shader, fragment_shader) {
        super(vertex_shader, fragment_shader)

        this.vertices_position = []
        this.vertices_color = []
        this.index = []

        this.create()

        this.setAttribute("position", this.vertices_position, 3)
        this.setAttribute("color", this.vertices_color, 4)
        this.setIndexBuffer(this.index)
    }

    create() {
        var div_a = 128
        var div_b = 128
        var tp_div_a = 2 * Math.PI / div_a
        var tp_div_b = 2 * Math.PI / div_b
        var r_a = 1
        var r_b = 0.3

        var theta_a, theta_b, x, y, z, w
        for (var i = 0; i <= div_a; ++i) {
            theta_a = tp_div_a * i
            x = Math.cos(theta_a)
            y = Math.sin(theta_a)

            for (var j = 0; j <= div_b; ++j) {
                theta_b = tp_div_b * j
                w = r_b * Math.cos(theta_b) + r_a
                z = r_b * Math.sin(theta_b)

                this.vertices_position.push(
                    x * w,
                    y * w,
                    z
                )

                this.vertices_color.push(
                    0.5 * x + 0.5,
                    0.5 * x + 0.5,
                    0.5 * y + 0.5,
                    1
                )
            }
        }

        // d--c
        // |  |
        // a--b
        var a, b, c, d
        for (var i = 0; i <= div_a; ++i) {
            for (var j = 0; j < div_b; ++j) {
                a = i * div_a + j
                b = a + 1
                c = b + div_b
                d = a + div_b
                this.index.push(a, b, c)
                this.index.push(a, c, d)
            }
        }
    }
}
