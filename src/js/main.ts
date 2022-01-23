import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// @ts-ignore
const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)
stats.dom.style.zIndex = '100000000000000'

export type DemoType = {
  scene: THREE.Scene
  pointPosition: THREE.Vector3
  // Animation data
  nextFrameReq: number
  prevTime: DOMHighResTimeStamp
  // Camera-specific
  camera: THREE.PerspectiveCamera
  renderer: THREE.Renderer
  container: HTMLElement
  canvas: HTMLElement
  orbitControls: OrbitControls
  extrinsicMatrix: THREE.Matrix4
  intrinsicMatrix: THREE.Matrix4
  updateFunction: (d: DemoType) => void
}

export function main(container: HTMLElement, canvas: HTMLElement) {
  console.log('once')

  // Create a new instance
  const demo = init(container, canvas)

  // Start the animation loop
  demo.nextFrameReq = requestAnimationFrame((t) => animate(t, demo))

  // Return
  return demo
}

function init(container: HTMLElement, canvas: HTMLElement): DemoType {
  // Get screen size
  const iw = container.clientWidth
  const ih = container.clientHeight
  const aspect = iw / ih

  // Camera
  const camera = new THREE.PerspectiveCamera(50, aspect, 0.01, 100)
  camera.position.set(10, 10, 10) // Set position like this
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  // Scene
  const scene = new THREE.Scene()

  // Geometry
  const geometry = new THREE.IcosahedronGeometry(0.5)
  const material = new THREE.MeshBasicMaterial({ color: 0xe8ceb8 })
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  // Helpers
  const axesHelper = new THREE.AxesHelper(10)
  scene.add(axesHelper)
  const gridHelper = new THREE.GridHelper(10, 11, 0xff0000, 0x84756c)
  scene.add(gridHelper)
  const orbitControls = new OrbitControls(camera, container)
  orbitControls.maxZoom = 10
  orbitControls.minZoom = 0.2

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor(0x141212)
  renderer.setSize(iw, ih)

  // Return
  return {
    camera,
    scene,
    renderer,
    container,
    canvas,
    orbitControls,
    nextFrameReq: 0,
    prevTime: 0,
    extrinsicMatrix: camera.matrixWorldInverse,
    intrinsicMatrix: camera.projectionMatrix,
    pointPosition: mesh.position,
    updateFunction: (d) => {},
  }
}

function animate(time: DOMHighResTimeStamp, demo: DemoType) {
  // Continue the animation loop
  demo.nextFrameReq = requestAnimationFrame((t) => animate(t, demo))

  stats.begin()
  render(time, demo)
  stats.end()
  displayMatrices(demo)
}

function render(time: DOMHighResTimeStamp, demo: DemoType): void {
  // const deltaTime = time - demo.prevTime
  demo.prevTime = time

  // Get
  const renderer = demo.renderer
  const camera = demo.camera

  // Get new size
  const iw = demo.container.clientWidth
  const ih = demo.container.clientHeight
  camera.aspect = iw / ih
  camera.updateProjectionMatrix()
  renderer.setSize(iw, ih)

  // Move
  demo.pointPosition.y = 2 + Math.sin(time * 0.0015) * 2
  demo.orbitControls.update()

  // Render
  renderer.render(demo.scene, demo.camera)

  demo.updateFunction(demo)
}

function displayMatrices(demo: DemoType): void {
  // Update extrinsic matrix
  const newExtrinsicMatrix = demo.camera.matrixWorldInverse

  // Update intrinsic matrix
  const newIntrinsicMatrix = demo.camera.projectionMatrix
}
