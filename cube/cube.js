let Cube = (function(){

    const vertexText = [
        'precision mediump float;',
        '',
        'attribute vec3 vertPosition;',
        'attribute vec3 vertColor;',
        'varying vec3 fragColor;',
        'uniform mat4 mWorld;',
        'uniform mat4 mView;',
        'uniform mat4 mProj;',
        '',
        'void main()',
        '{',
        '   fragColor = vertColor;',
        '   gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
        '}'
    ].join('\n')
    const fragmentText = [
        'precision mediump float;',
        '',
        'varying vec3 fragColor;',
        '',
        'void main()',
        '{',
        '   gl_FragColor = vec4(fragColor, 1.0);',
        '}'
    ].join('\n')
    const vertices = [
        // X,    Y,    Z,       R,   G,   B

        // Top
        -1.0,  1.0, -1.0,     0.75, 0.5, 0.5,
        -1.0,  1.0,  1.0,     0.75, 0.5, 0.5,
         1.0,  1.0,  1.0,     0.75, 0.5, 0.5,
         1.0,  1.0, -1.0,     0.75, 0.5, 0.5,

        // Left
        -1.0,  1.0,  1.0,     0.75, 0.25, 0.5,
        -1.0, -1.0,  1.0,     0.75, 0.25, 0.5,
        -1.0, -1.0, -1.0,     0.75, 0.25, 0.5,
        -1.0,  1.0, -1.0,     0.75, 0.25, 0.5,

        // Right
         1.0,  1.0,  1.0,     0.25, 0.25, 0.75,
         1.0, -1.0,  1.0,     0.25, 0.25, 0.75,
         1.0, -1.0, -1.0,     0.25, 0.25, 0.75,
         1.0,  1.0, -1.0,     0.25, 0.25, 0.75,

        // Front
         1.0,  1.0,  1.0,     1.0, 0.0, 0.15,
         1.0, -1.0,  1.0,     1.0, 0.0, 0.15,
        -1.0, -1.0,  1.0,     1.0, 0.0, 0.15,
        -1.0,  1.0,  1.0,     1.0, 0.0, 0.15,

        // Back
         1.0,  1.0, -1.0,     0.0, 1.0, 0.15,
         1.0, -1.0, -1.0,     0.0, 1.0, 0.15,
        -1.0, -1.0, -1.0,     0.0, 1.0, 0.15,
        -1.0,  1.0, -1.0,     0.0, 1.0, 0.15,

        // Bottom
        -1.0, -1.0, -1.0,     0.5, 0.5, 1.0,
        -1.0, -1.0,  1.0,     0.5, 0.5, 1.0,
         1.0, -1.0,  1.0,     0.5, 0.5, 1.0,
         1.0, -1.0, -1.0,     0.5, 0.5, 1.0,
    ]

    const indices = [
        // Top
        0,1,2,
        0,2,3,

        // Left
        4,6,5,
        6,4,7,

        // Right
        8,9,10,
        8,10,11,

        // Front
        12,14,13,
        12,15,14,

        // Back
        16,17,18,
        16,18,19,

        // Bottom
        20,22,21,
        20,23,22
    ]

    let isDebugging = false

    let setDebug = (status) => {
        if (status) {
            console.log("Debug is active!")
        }
        isDebugging = !!status
    }

    let getContext = (canvas) => {
        let ctx = canvas.getContext('webgl')
        if (!ctx) {
            console.log('WebGl Not supported, falling back to experimental WebGL')
            ctx = canvas.getContext('experimental-webgl')
        }
        if (!ctx) {
            throw 'Your browser does not support WebGL'
        }
        return ctx
    }
    let resizeCanvas = (canvas, gl) => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        gl.viewport(0,0,window.innerWidth ,window.innerHeight )
    }
    let clearScreen = (gl,red,green,blue,alpha) => {
        gl.clearColor(red,green,blue,alpha || 1)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.CULL_FACE)
        gl.frontFace(gl.CCW)
        gl.cullFace(gl.BACK)
    }
    let createShaders = (gl) => {
        let vertex = gl.createShader(gl.VERTEX_SHADER)
        let fragment = gl.createShader(gl.FRAGMENT_SHADER)

        gl.shaderSource(vertex, vertexText)
        gl.shaderSource(fragment, fragmentText)

        gl.compileShader(vertex)
        if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS)){
            let error = "ERROR compiling vertex shader!"
            console.error(error, gl.getShaderInfoLog(vertex))
            throw error
        }
        gl.compileShader(fragment)
        if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS)){
            let error = "ERROR compiling fragment shader!"
            console.error(error, gl.getShaderInfoLog(fragment))
            throw error
        }
        return {
            vertex, fragment
        }
    }
    let createProgram = (gl, vertex, fragment) => {
        let program = gl.createProgram()
        gl.attachShader(program, vertex)
        gl.attachShader(program, fragment)
        gl.linkProgram(program)
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)){
            let error = "ERROR linking program!"
            console.error(error, gl.getProgramInfoLog(program))
            throw error
        }
        if (isDebugging){
            validateProgram(gl,program)
        }
        return program
    }
    let validateProgram = (gl, program) => {
        gl.validateProgram(program)
        if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
            let error = "ERROR validation program!"
            console.error(error, gl.getProgramInfoLog(program))
            throw error
        }
    }
    let createBuffer = (gl) => {
        let buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

        let index = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

        return {buffer, index}
    }

    return {
        init: (params) => {

            const { debug } = params
            setDebug(debug)

            try {
                let canvas = document.getElementsByTagName('canvas')[0]
                let gl = getContext(canvas)

                window.onresize = () => resizeCanvas(canvas,gl)
                resizeCanvas(canvas,gl)

                clearScreen(gl,0.5,0.5,0.5)

                let { vertex, fragment } = createShaders(gl)
                let program = createProgram(gl, vertex, fragment)
                createBuffer(gl)


                let position = gl.getAttribLocation(program, 'vertPosition')
                let color = gl.getAttribLocation(program, 'vertColor')
                gl.vertexAttribPointer(
                    position,
                    3,
                    gl.FLOAT,
                    false,
                    6*Float32Array.BYTES_PER_ELEMENT,
                    0)
                gl.vertexAttribPointer(
                    color,
                    3,
                    gl.FLOAT,
                    false,
                    6*Float32Array.BYTES_PER_ELEMENT,
                    3*Float32Array.BYTES_PER_ELEMENT)

                gl.enableVertexAttribArray(location)
                gl.enableVertexAttribArray(color)

                gl.useProgram(program)

                let matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld')
                let matViewUniformLocation = gl.getUniformLocation(program, 'mView')
                let matProjUniformLocation = gl.getUniformLocation(program, 'mProj')

                let worldMatrix = new Float32Array(16)
                let viewMatrix = new Float32Array(16)
                let projMatrix = new Float32Array(16)

                glMatrix.mat4.identity(worldMatrix)
                glMatrix.mat4.lookAt(viewMatrix, [0,0,-5], [0,0,0], [0,1,0])
                glMatrix.mat4.perspective(
                    projMatrix,glMatrix.glMatrix.toRadian(45),
                    canvas.width / canvas.height,
                    0.1,
                    1000.0
                )

                gl.uniformMatrix4fv(matWorldUniformLocation,false,worldMatrix)
                gl.uniformMatrix4fv(matViewUniformLocation,false,viewMatrix)
                gl.uniformMatrix4fv(matProjUniformLocation,false,projMatrix)

                const xRotation = new Float32Array(16)
                const yRotation = new Float32Array(16)

                const identity = new Float32Array(16)
                glMatrix.mat4.identity(identity)

                let dispX = 325, dispY = 20
                let angleX = dispX / 360 * Math.PI * 2
                let angleY = dispY / 360 * Math.PI * 2
                let panX = 0, panY = 0
                window.onmousedown = () => {
                    window.onmousemove = (e) => {
                        if (e.altKey){
                            panX += e.movementX / 100
                            panY += e.movementY / 100
                        } else {
                            // angleX = e.x / window.innerWidth * 2 * Math.PI - Math.PI
                            // angleY = e.y / window.innerHeight * 2 * Math.PI - Math.PI
                            dispX = (dispX + e.movementX / 4) % 360
                            dispX = (dispX < 0) ? 360 - dispX : dispX
                            angleX = dispX / 360 * Math.PI * 2

                            dispY = (dispY + e.movementY / 4) % 360
                            dispY = (dispY < 0) ? 360 - dispY : dispY
                            angleY = dispY / 360 * Math.PI * 2
                        }
                    }
                }
                window.onmouseup = () => {
                    window.onmousemove = null
                }

                let distance = -6
                let fov = 45
                window.onmousewheel = (e) => {
                    if (e.altKey){
                        fov += (e.deltaY / 100)
                    } else {
                        distance -= (e.deltaY / 250)
                    }
                }

                let loop = () => {

                    glMatrix.mat4.perspective(
                        projMatrix,glMatrix.glMatrix.toRadian(fov),
                        canvas.width / canvas.height,
                        0.1,
                        1000.0
                    )

                    glMatrix.mat4.lookAt(viewMatrix, [0,0,distance], [panX,panY,0], [0,1,0])

                    glMatrix.mat4.rotate(xRotation, identity, angleX, [0,1,0])
                    glMatrix.mat4.rotate(yRotation, identity, -angleY, [1,0,0])
                    glMatrix.mat4.mul(worldMatrix, yRotation, xRotation)
                    gl.uniformMatrix4fv(matWorldUniformLocation,false, worldMatrix)
                    gl.uniformMatrix4fv(matViewUniformLocation,false, viewMatrix)
                    gl.uniformMatrix4fv(matProjUniformLocation,false,projMatrix)
                    clearScreen(gl,0.5,0.5,0.5)

                    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT,0)
                    requestAnimationFrame(loop)
                }
                requestAnimationFrame(loop)


            } catch (e) {
                alert(e)
            }
        }
    }
})();