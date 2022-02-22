import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DemoType } from './main'
import { onOrbitControlChange, setTargetLookPosition, setTargetPosition } from './update'

const green = 0x5bb585
const blue = 0x0082e7

export type DemoCameraDataType = {
  // HTML
  container: HTMLElement
  canvas: HTMLElement
  // Camera
  camera: THREE.PerspectiveCamera
  renderer: THREE.Renderer
  // Geometry
  cameraHelper: THREE.CameraHelper
  line: THREE.Line
  // Controls
  orbitControls: OrbitControls
  // Data
  targetPosition: THREE.Vector3
  targetLookPosition: THREE.Vector3
  extrinsicMatrix: THREE.Matrix4
  intrinsicMatrix: THREE.Matrix4
}

export function init(
  arr: {
    container: HTMLElement
    canvas: HTMLElement
  }[]
): DemoType {
  // Set up scene
  const scene = new THREE.Scene()
  const geometry = new THREE.IcosahedronGeometry(0.25)
  const material = new THREE.MeshBasicMaterial({ color: 0xe8ceb8 })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.layers.enableAll()
  scene.add(mesh)

  // Set up cameras
  const cameraData: DemoCameraDataType[] = []
  for (let i = 0; i < arr.length; i++) {
    // Get stuff
    const container = arr[i].container
    const canvas = arr[i].canvas

    // Get screen size
    const iw = container.clientWidth
    const ih = container.clientHeight
    const aspect = iw / ih

    // Set up camera
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.0001, 10000)
    camera.position.fromArray(getInitialCameraPosition(i))
    camera.layers.set(i)

    // Set up camera helper (frustum)
    const cameraHelper = new THREE.CameraHelper(camera)
    cameraHelper.layers.enableAll()
    // cameraHelper.layers.disable(i)
    cameraHelper.visible = false
    scene.add(cameraHelper)

    // Set up line of sight
    const material = new THREE.LineBasicMaterial({ color: i ? green : blue })
    const points = [camera.position, mesh.position]
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(geometry, material)
    line.frustumCulled = false
    line.layers.enableAll()
    line.layers.disable(i)
    line.visible = false
    scene.add(line)

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0xffffff, 0)
    renderer.setSize(iw, ih)

    // Set up controls
    const orbitControls = new OrbitControls(camera, container)

    // Create data object
    const data = {
      // HTML
      container,
      canvas,
      // Camera
      camera,
      renderer,
      // Geometry
      cameraHelper,
      line,
      // Controls
      orbitControls,
      // Data
      targetPosition: new THREE.Vector3().copy(camera.position),
      targetLookPosition: new THREE.Vector3(),
      extrinsicMatrix: camera.matrixWorldInverse,
      intrinsicMatrix: camera.projectionMatrix,
    }

    // Attach listener
    orbitControls.addEventListener('change', () => onOrbitControlChange(data))

    // Save
    cameraData.push(data)
  }

  // Set up axes
  const axesHelper = new THREE.AxesHelper(10)
  axesHelper.setColors(new THREE.Color(0xff0000), new THREE.Color(0x00ff00), new THREE.Color(0x0000ff))
  axesHelper.layers.enableAll()
  scene.add(axesHelper)
  const gridHelper = new THREE.GridHelper(5, 5, 0xff0000, 0x84756c)
  gridHelper.layers.enableAll()
  scene.add(gridHelper)

  // Create demo object
  let demo: DemoType = 'dummy' as any
  const isMoving = false
  demo = {
    isMoving,
    modifierFunctions: {
      enableMovement(bool: boolean) {
        demo.isMoving = bool
      },
      showFrustum(cameraNumber: number, bool: boolean) {
        cameraData[cameraNumber].cameraHelper.visible = bool
      },
      showEpipolarLines(bool: boolean) {
        cameraData.forEach(({ line }) => (line.visible = bool))
      },
      setPosition(cameraNumber: number, pos: THREE.Vector3) {
        setTargetPosition(cameraData[cameraNumber], pos)
      },
      setLookPosition(cameraNumber: number, pos: THREE.Vector3) {
        setTargetLookPosition(cameraData[cameraNumber], pos)
      },
      resetSetup(cameraNumber: number) {
        setTargetPosition(
          cameraData[cameraNumber],
          new THREE.Vector3().fromArray(getInitialCameraPosition(cameraNumber))
        )
        setTargetLookPosition(cameraData[cameraNumber], new THREE.Vector3())
      },
      setRotationToIdentity: (cameraNumber: number) => {
        const data = cameraData[cameraNumber]
        const camera = data.camera
        const distance = data.orbitControls.getDistance()
        const pos = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z - distance)
        setTargetLookPosition(data, pos)
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

function getInitialCameraPosition(i: number): [number, number, number] {
  switch (i) {
    case 0:
      return [4, 4, 20]
    case 1:
      return [35, 25, 35]
    case 2:
      return [0, 0, 100]
    default:
      return [0, 0, 0]
  }
}
