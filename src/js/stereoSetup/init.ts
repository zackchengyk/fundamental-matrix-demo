import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { render } from './animate'
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
      camera.position.set(35, 25, 35)
    } else {
      camera.position.set(4, 4, 20)
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

    const cameraHelper = new THREE.CameraHelper(camera)
    cameraHelper.layers.enableAll()
    cameraHelper.layers.disable(i)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: arr[i].canvas, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0xffffff, 0)
    renderer.setSize(iw, ih)

    // Orbit Controls
    const orbitControls = new OrbitControls(camera, arr[i].container)

    cameraData.push({
      camera,
      cameraHelper,
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
  axesHelper.setColors(new THREE.Color(0xff0000), new THREE.Color(0x00ff00), new THREE.Color(0x0000ff))
  axesHelper.layers.enableAll()
  scene.add(axesHelper)
  const gridHelper = new THREE.GridHelper(5, 5, 0xff0000, 0x84756c)
  gridHelper.layers.enableAll()
  scene.add(gridHelper)

  // Create demo object
  let demo: DemoType = 'dummy' as any
  const singleRender = () => requestAnimationFrame((t) => render(t, demo))
  const isPlaying = false
  cameraData.forEach(({ orbitControls }) => orbitControls.addEventListener('change', singleRender))
  demo = {
    isPlaying,
    modifierFunctions: {
      autoplay: {
        on: () => {
          demo.isPlaying = true
          cameraData.forEach(({ orbitControls }) => orbitControls.removeEventListener('change', singleRender))
        },
        off: () => {
          demo.isPlaying = false
          cameraData.forEach(({ orbitControls }) => orbitControls.addEventListener('change', singleRender))
        },
      },
      frustums: {
        on: () => (cameraData.forEach(({ cameraHelper }) => scene.add(cameraHelper)), singleRender()),
        off: () => (cameraData.forEach(({ cameraHelper }) => scene.remove(cameraHelper)), singleRender()),
      },
      epipolarLines: {
        on: () => (cameraData.forEach(({ line }) => scene.add(line)), singleRender()),
        off: () => (cameraData.forEach(({ line }) => scene.remove(line)), singleRender()),
      },
      setC1RotationToIdentity: () => {
        const target = new THREE.Vector3(
          cameraData[0].camera.position.x,
          cameraData[0].camera.position.y,
          cameraData[0].camera.position.z > 0 ? 0 : cameraData[0].camera.position.z - 1
        )
        cameraData[0].camera.lookAt(target)
        cameraData[0].orbitControls.target.copy(target)
        cameraData[0].camera.updateProjectionMatrix()
        singleRender()
      },
      setC1ToLookAtOrigin: () => {
        const zeroTarget = new THREE.Vector3()
        cameraData[0].camera.lookAt(zeroTarget)
        cameraData[0].orbitControls.target.copy(zeroTarget)
        cameraData[0].camera.updateProjectionMatrix()
        singleRender()
      },
      alignC1Axis: (a: 0 | 1 | 2 | null) => {
        if (a == null) return
        cameraData[0].orbitControls.target.set(0, 0, 0)
        cameraData[0].camera.position.set(a === 0 ? 10 : 0, a === 1 ? 10 : 0, a === 2 ? 10 : 0)
        cameraData[0].camera.updateProjectionMatrix()
        singleRender()
      },
    },
    scene,
    pointPosition: mesh.position,
    updateGUIFunction: (d: DemoType) => {},
    nextFrameReq: 0,
    prevTime: 0,
    cameraData,
  }

  // Return
  return demo
}
