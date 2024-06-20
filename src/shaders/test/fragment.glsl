uniform vec3 uAmbientColor; // custom uniform, ambiente color
uniform vec3 uLightColor; // custom uniform, light color
uniform sampler2D uTexture; // custom uniform, texture

uniform float uKa; // coef ambient  [0, 1]
uniform float uKd; // coef difusion [0, 1]
uniform float uKs; // coef specular [0, 1]

uniform sampler2D uEyeMap;
uniform sampler2D uLightMap;
uniform sampler2D uNormalMap;
uniform sampler2D uParaMap;

// Recebe coords UV do VertexShader
varying vec2 vUv;

void main() {
    vec4 eye = texture2D(uEyeMap, vUv); // aponta pro observador (V)
    vec4 light = texture2D(uLightMap, vUv); // aponta pra luz (L)
    vec4 normal = texture2D(uNormalMap, vUv); // aponta normal (N)
    vec4 param = texture2D(uParaMap, vUv); // como posicionar a textura, usar coordenadas do mapa ao inves do vUv
    vec4 textureColor = texture2D(uTexture, param.xy);

    // I = (Ia * Ka) + (Il * Od * Kd * <N, L> ) + (Il * Ks * <R, V>)
    // componente ambiente = (Ia * Ka)
    // componente difusao = (Il * Od * Kd * <N, L> )
    // componente especular = (Il * Ks * <R, V>)
    // tal que
    // Il -> cor da fonte de luz [0, 255]^3
    // Od -> cor do objeto [0,1]^3, atenuador, variados em cada canal, dada pela textura
    // Ks -> coeficiente especular [0,1]
    // <N, L> vetores q dependem da posiçao do ponto (N vetor normal) (L vetor aponta pra luz)
    // <R, V> vetores q dependem da posiçao do ponto (R vetor reflexao) (V vetor aponta pra observador)
    // R = 2 * <L, N> - L

    vec3 R = 2.0 * (dot(light.xyz, normal.xyz)) - light.xyz;

    vec3 ambientIntensity = uAmbientColor * uKa;
    vec3 difusionIntensity = uLightColor * normalize(textureColor.xyz) * uKd * dot(normal.xyz, light.xyz);
    vec3 specularIntensity = uLightColor * uKs * dot(R.xyz, eye.xyz);
    vec3 colorIntensity = ambientIntensity + difusionIntensity + specularIntensity;

    // gl_FragColor is the color of the particular pixel
    // 4th value is the alpha, a, on rgba
    float isMesh = 1.0 + (ceil(param.z) * - 1.0); // if Z on param is 0, the fragment is on the mesh
    gl_FragColor = vec4(textureColor.xyz * colorIntensity.xyz, isMesh);
}