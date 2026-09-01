export const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const fragmentShader = `
    uniform float uProgress;
    uniform vec2 uResolution;
    uniform vec3 uColor;
    uniform float uSpread;
    varying vec2 vUv;

    float checkerboard(vec2 uv, float scale) {
        vec2 c = floor(uv * scale);
        return mod(c.x + c.y, 2.0);
    }

    void main() {
        vec2 uv = vUv;
        float aspect = uResolution.x / uResolution.y;
        vec2 centeredUv = (uv - 0.5) * vec2(aspect, 1.0);

        float dissolveEdge = uv.y - uProgress * 1.2;
        float noiseValue = checkerboard(centeredUv * 1.0, 20.0);
        float d = dissolveEdge + noiseValue * uSpread;

        float pixelSize = 1.0 / uResolution.y;
        float alpha = 1.0 - smoothstep(-pixelSize, pixelSize, d);

        gl_FragColor = vec4(uColor, alpha);
    }
`;