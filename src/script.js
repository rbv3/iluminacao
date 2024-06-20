import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader from './shaders/test/fragment.glsl'

/**
 * Base
 */
// Debug
let gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const flagTexture = textureLoader.load('/textures/flag-pernambuco.png')
// input
let eyeMap = textureLoader.load('/textures/EyeMap_1.bmp')
let lightMap = textureLoader.load('/textures/LightMap_1.bmp')
let normalMap = textureLoader.load('/textures/NormalMap_1.bmp')
let paraMap = textureLoader.load('/textures/ParaMap_1.bmp')

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32)
// const geometry = new THREE.ConeGeometry(1, 3, 32, 32)
// const geometry = new THREE.SphereGeometry(1, 32, 32)
// const geometry = new THREE.TorusGeometry(5, 1, 32, 32)

// GUI
function setGUI(material) {
    gui.destroy()
    gui = new dat.GUI()
    gui.add(material, 'wireframe')
    gui.add(material.uniforms.uKa, 'value').min(0).max(1).step(0.001).name('Ka')
    gui.add(material.uniforms.uKd, 'value').min(0).max(1).step(0.001).name('Kd')
    gui.add(material.uniforms.uKs, 'value').min(0).max(1).step(0.001).name('Ks')
    gui.addColor(material.uniforms.uAmbientColor, 'value').onChange((newColor) => material.color = newColor).name('ambientLight')
    gui.addColor(material.uniforms.uLightColor, 'value').name('Light')
    gui.add({setMap1: () => setMap(1)}, 'setMap1')
    gui.add({setMap2: () => setMap(2)}, 'setMap2')
    gui.add({setMap3: () => setMap(3)}, 'setMap3')
    gui.add({setMap4: () => setMap(4)}, 'setMap4')
}
// Material
function setMaterial() {
    const newMaterial = new THREE.ShaderMaterial({
        vertexShader: testVertexShader,
        fragmentShader: testFragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uAmbientColor: { value: new THREE.Color('white') },
            uLightColor: { value: new THREE.Color('#99ff9b') },
            uTexture: { value: flagTexture },
            uKa: { value: 0.5 },
            uKd: { value: 0.5 },
            uKs: { value: 0.5 },
            uEyeMap: { value: eyeMap },
            uLightMap: { value: lightMap },
            uNormalMap: { value: normalMap },
            uParaMap: { value: paraMap },
        },
        transparent: true,
        side: THREE.DoubleSide
    })
    setGUI(newMaterial)
    return newMaterial
}
const material = setMaterial()

function setMap(mapNumber) {
    eyeMap = textureLoader.load(`/textures/EyeMap_${mapNumber}.bmp`)
    lightMap = textureLoader.load(`/textures/LightMap_${mapNumber}.bmp`)
    normalMap = textureLoader.load(`/textures/NormalMap_${mapNumber}.bmp`)
    paraMap = textureLoader.load(`/textures/ParaMap_${mapNumber}.bmp`)

    const newMaterial = setMaterial()
    mesh.material = newMaterial
}


// Mesh
const mesh = new THREE.Mesh(geometry, material)
mesh.scale.y = 2/3
scene.add(mesh)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0.25, - 0.25, 1)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update material
    material.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()