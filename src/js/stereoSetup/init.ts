import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DemoCameraDataType, DemoType } from './main'

export function init(
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
    if (i) {
      camera.position.set(10, 10, 15)
    } else {
      camera.position.set(35, 20, 20)
    }
    camera.lookAt(new THREE.Vector3())
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
    isPlaying: true,
    scene,
    pointPosition: mesh.position,
    updateGUIFunction: (d) => {},
    nextFrameReq: 0,
    prevTime: 0,
    cameraData,
  }
}
