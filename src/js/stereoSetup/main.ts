import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { animate } from './animate'
import { init } from './init'

export type DemoType = {
  isPlaying: boolean
  scene: THREE.Scene
  pointPosition: THREE.Vector3
  updateGUIFunction: (d: DemoType) => void
  // Animation data
  nextFrameReq: number
  prevTime: DOMHighResTimeStamp
  // Camera-specific stuff
  cameraData: DemoCameraDataType[]
}

export type DemoCameraDataType = {
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
  // Create a new instance
  const demo = init([
    { container: container1, canvas: canvas1 },
    { container: container2, canvas: canvas2 },
  ])

  // Start the animation loop
  demo.nextFrameReq = requestAnimationFrame((t) => animate(t, demo, true))

  // Return
  return demo
}
