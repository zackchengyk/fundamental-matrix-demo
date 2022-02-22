import * as THREE from 'three'
import { quaternionEquals, vector3Equals } from '../common'
import { DemoCameraDataType } from './init'
import { DemoType } from './main'

const dummyMatrix = new THREE.Matrix4()
const dummyQuaternion = new THREE.Quaternion()

export function onOrbitControlChange(data: DemoCameraDataType) {
  setTargetPosition(data, data.camera.position)
  setTargetLookPosition(data, data.orbitControls.target)
}

export function setTargetPosition(data: DemoCameraDataType, pos: THREE.Vector3) {
  data.targetPosition.copy(pos)
}

export function setTargetLookPosition(data: DemoCameraDataType, pos: THREE.Vector3) {
  data.orbitControls.target.copy(pos)
  data.targetLookPosition.copy(pos)
}

export function updateSize(_: DOMHighResTimeStamp, demo: DemoType): void {
  // For each camera
  for (const data of demo.cameraData) {
    // Get new size
    const iw = data.container.clientWidth
    const ih = data.container.clientHeight
    data.camera.aspect = iw / ih
    data.camera.updateProjectionMatrix()
    data.renderer.setSize(iw, ih)
  }
}

export function updateScene(time: DOMHighResTimeStamp, demo: DemoType): void {
  // Get stuff
  const deltaTime = (time - demo.prevTime) / 1000
  demo.prevTime = time
  const pointPosition = demo.pointPosition

  // Update position of point
  if (demo.isMoving) {
    pointPosition.y = 2 + Math.sin(time * 0.0015) * 2
  }

  // For each camera
  for (const data of demo.cameraData) {
    // Get stuff
    const camera = data.camera
    const line = data.line
    const orbitControls = data.orbitControls
    let isTranslating = false

    // Update position of camera if necessary
    const targetPosition = data.targetPosition
    if (!vector3Equals(camera.position, targetPosition, 0.0001)) {
      isTranslating = true
      const step = 10 * deltaTime // Approximate lerp-ing
      camera.position.lerp(targetPosition, step)
      camera.updateProjectionMatrix()
    }

    // Update angle of camera if necessary
    if (isTranslating) {
      // Known translation
      camera.lookAt(data.targetLookPosition)
    } else {
      // Possible translation or rotation
      const matrix = new THREE.Matrix4().lookAt(camera.position, data.targetLookPosition, camera.up)
      const quaternion = new THREE.Quaternion().setFromRotationMatrix(matrix)
      if (!quaternionEquals(camera.quaternion, quaternion, 0.0001)) {
        const step = 5 * deltaTime // Approximate slerp-ing
        camera.quaternion.slerp(quaternion, step)
        camera.updateProjectionMatrix()
      } else {
        orbitControls.update()
      }
    }

    // Update lines of sight
    const linePosArray = line.geometry.attributes.position.array
    const lineDir = pointPosition.clone().sub(camera.position)
    const startPos = camera.position.clone().add(lineDir.clone().multiplyScalar(-1000))
    const endPos = camera.position.clone().add(lineDir.clone().multiplyScalar(1000))

    // @ts-ignore
    linePosArray[0] = startPos.x // @ts-ignore
    linePosArray[1] = startPos.y // @ts-ignore
    linePosArray[2] = startPos.z // @ts-ignore
    linePosArray[3] = endPos.x // @ts-ignore
    linePosArray[4] = endPos.y // @ts-ignore
    linePosArray[5] = endPos.z

    // Force update
    line.geometry.attributes.position.needsUpdate = true
  }
}
