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
  updateFunction: (d: DemoType) => void
  rotationMatrix: THREE.Matrix4
  translationCrossMatrix: THREE.Matrix3
  // Animation data
  nextFrameReq: number
  prevTime: DOMHighResTimeStamp
  // Camera-specific stuff
  cameraData: DemoCameraDataType[]
}

type DemoCameraDataType = {
  camera: THREE.PerspectiveCamera
  line: THREE.Line
  renderer: THREE.Renderer
  container: HTMLElement
  canvas: HTMLElement
  orbitControls: OrbitControls
  extrinsicMatrix: THREE.Matrix4
  intrinsicMatrix: THREE.Matrix4
}

export function main(
  container1: HTMLElement,
  canvas1: HTMLElement,
  container2: HTMLElement,
  canvas2: HTMLElement
) {
  console.log('once')

  // Create a new instance
  const demo = init([
    { container: container1, canvas: canvas1 },
    { container: container2, canvas: canvas2 },
  ])

  // Start the animation loop
  demo.nextFrameReq = requestAnimationFrame((t) => animate(t, demo))

  // Return
  return demo
}

function init(
  arr: {
    container: HTMLElement
    canvas: HTMLElement
  }[]
): DemoType {
  // Scene
  const scene = new THREE.Scene()

  // Geometry
  const geometry = new THREE.IcosahedronGeometry(0.25)
  const material = new THREE.MeshBasicMaterial({ color: 0xe8ceb8 })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.layers.enableAll()
  scene.add(mesh)

  const cameraData: DemoCameraDataType[] = []

  for (let i = 0; i < arr.length; i++) {
    // Get screen size
    const iw = arr[i].container.clientWidth
    const ih = arr[i].container.clientHeight
    const aspect = iw / ih

    // Camera
    const camera = new THREE.PerspectiveCamera(30, aspect, 0.0001, 10000)
    camera.position.set(0, 0, 5) // Set position like this
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    camera.layers.set(i)

    // Line to point
    const material = new THREE.LineBasicMaterial({ color: i ? 0x5bb585 : 0x0082e7 })
    const points = [camera.position, mesh.position]
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(geometry, material)
    line.frustumCulled = false
    line.layers.enableAll()
    line.layers.disable(i)
    scene.add(line)

    const cameraHelper = new THREE.CameraHelper(camera)
    cameraHelper.layers.enableAll()
    cameraHelper.layers.disable(i)
    scene.add(cameraHelper)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: arr[i].canvas })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x141212)
    renderer.setSize(iw, ih)

    // Orbit Controls
    const orbitControls = new OrbitControls(camera, arr[i].container)

    cameraData.push({
      camera,
      line,
      renderer,
      container: arr[i].container,
      canvas: arr[i].canvas,
      orbitControls,
      extrinsicMatrix: camera.matrixWorldInverse,
      intrinsicMatrix: camera.projectionMatrix,
    })
  }

  // Helpers
  const axesHelper = new THREE.AxesHelper(10)
  axesHelper.layers.enableAll()
  scene.add(axesHelper)
  const gridHelper = new THREE.GridHelper(5, 5, 0xff0000, 0x84756c)
  gridHelper.layers.enableAll()
  scene.add(gridHelper)

  // Return
  return {
    scene,
    pointPosition: mesh.position,
    updateFunction: (d) => {},
    rotationMatrix: new THREE.Matrix4(),
    translationCrossMatrix: new THREE.Matrix3(),
    nextFrameReq: 0,
    prevTime: 0,
    cameraData,
  }
}

function animate(time: DOMHighResTimeStamp, demo: DemoType) {
  // Continue the animation loop
  demo.nextFrameReq = requestAnimationFrame((t) => animate(t, demo))

  stats.begin()
  render(time, demo)
  stats.end()
}

function render(time: DOMHighResTimeStamp, demo: DemoType): void {
  // const deltaTime = time - demo.prevTime
  demo.prevTime = time

  // demo.pointPosition.y = 2 + Math.sin(time * 0.0015) * 2

  // For each camera
  for (let i = 0; i < demo.cameraData.length; i++) {
    const data = demo.cameraData[i]

    // Get
    const renderer = data.renderer
    const camera = data.camera

    // Get new size
    const iw = data.container.clientWidth
    const ih = data.container.clientHeight
    camera.aspect = iw / ih
    camera.updateProjectionMatrix()
    renderer.setSize(iw, ih)

    // Move
    data.orbitControls.update()

    const linePosArray = data.line.geometry.attributes.position.array
    const lineDir = demo.pointPosition.clone().sub(data.camera.position)
    lineDir.multiplyScalar(1000).add(data.camera.position)
    linePosArray[0] = data.camera.position.x
    linePosArray[1] = data.camera.position.y
    linePosArray[2] = data.camera.position.z
    linePosArray[3] = lineDir.x
    linePosArray[4] = lineDir.y
    linePosArray[5] = lineDir.z
    data.line.geometry.attributes.position.needsUpdate = true

    // Render
    renderer.render(demo.scene, data.camera)
  }

  // Find translation between cameras
  const t = demo.cameraData[1].camera.position.clone().sub(demo.cameraData[0].camera.position)
  demo.translationCrossMatrix.set(0, -t.z, t.y, t.z, 0, -t.x, -t.y, t.x, 0)

  // Find rotation between cameras
  const r0 = new THREE.Quaternion()
  demo.cameraData[0].camera.getWorldQuaternion(r0)
  const r1 = new THREE.Quaternion()
  demo.cameraData[1].camera.getWorldQuaternion(r1)
  r0.multiply(r1.invert())
  demo.rotationMatrix.makeRotationFromQuaternion(r0)

  demo.updateFunction(demo)
}
