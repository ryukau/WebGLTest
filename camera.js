class Camera {
    constructor(aspect_ratio) {
        this.aspect_ratio = aspect_ratio
        this.reset()
        this.refresh()
    }

    reset() {
        this.view = mat4.create()
        this.position = vec3.fromValues(0, 0, 10) // Position of the camera
        this.look_at = vec3.fromValues(0, 0, 0) //Point the camera is looking at
        this.up = vec3.fromValues(0, 1, 0) // 画面の上となる方向。
        this.projection = mat4.create()
        this.fov = 65
        this.near = 0.001
        this.far = 1000
        this.view_projection = mat4.create()
    }

    refresh() {
        mat4.lookAt(this.view, this.position, this.look_at, this.up)
        mat4.perspective(
            this.projection,
            angleToRadian(this.fov),
            this.aspect_ratio,
            this.near,
            this.far
        )
        mat4.mul(this.view_projection, this.projection, this.view)
    }

    set(position, look_at) {
        this.position = position
        this.look_at = look_at
        refresh()
    }

    // setPosition(v) {
    //     this.position = v
    //     refresh()
    // }

    // setLookAt(v) {
    //     this.look_at = v
    //     refresh()
    // }

    // setUp(v) {
    //     this.up = v
    //     refresh()
    // }

    // setVerticalFOVFromAngle(fov) {
    //     this.fov = fov
    //     refresh()
    // }
}

function angleToRadian(angle) {
    return Math.PI * angle / 180
}