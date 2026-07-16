import { Renderer, Program, Mesh, Triangle } from 'ogl';

global.document = {
    createElement: () => ({
        getContext: () => ({
            getExtension: () => null,
            getParameter: () => null,
            enable: () => {},
            disable: () => {},
            clearColor: () => {},
            clearDepth: () => {},
            colorMask: () => {},
            depthMask: () => {},
            depthFunc: () => {},
            blendFunc: () => {},
            cullFace: () => {},
            createBuffer: () => ({}),
            bindBuffer: () => {},
            bufferData: () => {},
            createProgram: () => ({}),
            createShader: () => ({}),
            shaderSource: () => {},
            compileShader: () => {},
            getShaderParameter: () => 1,
            attachShader: () => {},
            linkProgram: () => {},
            getProgramParameter: () => 1,
            getProgramInfoLog: () => '',
            getShaderInfoLog: () => '',
            useProgram: () => {},
            getUniformLocation: () => ({}),
            getAttribLocation: () => 0,
            enableVertexAttribArray: () => {},
            vertexAttribPointer: () => {},
            uniform1f: () => {},
            clear: () => {},
            drawArrays: () => {},
            drawElements: () => {},
            viewport: () => {},
            pixelStorei: () => {}
        }),
        addEventListener: () => {}
    })
};

const renderer = new Renderer();
const gl = renderer.gl;
const geometry = new Triangle(gl);
const program = new Program(gl, {
    vertex: `void main() { gl_Position = vec4(0,0,0,1); }`,
    fragment: `void main() { gl_FragColor = vec4(1,1,1,1); }`,
});
const mesh = new Mesh(gl, { geometry, program });
try {
    renderer.render({ scene: mesh });
    console.log("Success");
} catch (e) {
    console.error(e.stack);
}
