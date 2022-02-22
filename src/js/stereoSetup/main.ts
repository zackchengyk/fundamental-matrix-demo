import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { animate } from './animate'
import { DemoCameraDataType, init } from './init'

export type DemoType = {
  // For React use
  updateGUIFunction: (d: DemoType) => void
  // Scene data
  scene: THREE.Scene
  pointPosition: THREE.Vector3
  fixedPointPosition: THREE.Vector3 | null
  // Animation data
  nextFrameReq: number
  prevTime: DOMHighResTimeStamp
  // Camera-specific stuff
  cameraData: DemoCameraDataType[]
  // Modifier stuff
  isMoving: boolean
  modifierFunctions: {
    enableMovement: (bool: boolean) => void
    setPointPosition: (pos: THREE.Vector3 | null) => void
    showFrustum: (cameraNumber: number, bool: boolean) => void
    showEpipolarLines: (bool: boolean) => void
    setPosition: (cameraNumber: number, pos: THREE.Vector3) => void
    setLookPosition: (cameraNumber: number, pos: THREE.Vector3) => void
    resetSetup: (cameraNumber: number) => void
    setRotationToIdentity: (cameraNumber: number) => void
  }
}

export function main(
  container1: HTMLElement,
  canvas1: HTMLElement,
  container2: HTMLElement,
  canvas2: HTMLElement,
  container3: HTMLElement,
  canvas3: HTMLElement
): DemoType {
  // Create a new instance
  const demo = init([
    { container: container1, canvas: canvas1 },
    { container: container2, canvas: canvas2 },
    { container: container3, canvas: canvas3 },
  ])

  // Start the animation loop
  demo.nextFrameReq = requestAnimationFrame((t) => animate(t, demo, true))

  // Return
  return demo
}
