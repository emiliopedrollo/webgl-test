let Triangle = (function(){

    const vertexText = [
        'precision mediump float;',
        '',
        'attribute vec2 vertPosition;',
        'attribute vec3 vertColor;',
        'varying vec3 fragColor;',
        '',
        'void main()',
        '{',
        '   fragColor = vertColor;',
        '   gl_Position = vec4(vertPosition, 0.0, 1.0);',
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
    const vertices =
    [//    X,    Y,   R,   G,   B
        0.0 , 0.5 , 1.0, 0.0, 0.0,
        -0.5, -0.5, 0.0, 1.0, 0.0,
        0.5 , -0.5, 0.0, 0.0, 1.0
    ]

    let isDebugging = false

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
        return buffer
    }

    return {
        debug: (status) => {
            console.log("Debug is active!")
            isDebugging = !!status
        },
        init: () => {
            try {
                let canvas = document.getElementsByTagName('canvas')[0]
                let gl = getContext(canvas)

                window.onresize = () => resizeCanvas(canvas,gl)
                resizeCanvas(canvas,gl)

                clearScreen(gl,0.5,0.5,0.5)

                let {vertex, fragment} = createShaders(gl)
                let program = createProgram(gl, vertex, fragment)
                let buffer = createBuffer(gl)


                let position = gl.getAttribLocation(program, 'vertPosition')
                let color = gl.getAttribLocation(program, 'vertColor')
                gl.vertexAttribPointer(
                    position,
                    2,
                    gl.FLOAT,
                    false,
                    5*Float32Array.BYTES_PER_ELEMENT,
                    0)
                gl.vertexAttribPointer(
                    color,
                    3,
                    gl.FLOAT,
                    false,
                    5*Float32Array.BYTES_PER_ELEMENT,
                    2*Float32Array.BYTES_PER_ELEMENT)

                gl.enableVertexAttribArray(location)
                gl.enableVertexAttribArray(color)

                gl.useProgram(program)
                gl.drawArrays(gl.TRIANGLES, 0,3)

            } catch (e) {
                alert(e)
            }
        }
    }
})();