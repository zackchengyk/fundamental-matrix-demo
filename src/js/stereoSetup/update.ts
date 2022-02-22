import * as THREE from 'three'
import { quaternionEquals, vector3Equals } from '../common'
import { DemoCameraDataType } from './init'
import { DemoType } from './main'

export enum LookDirUpdateMode {
  anything,
  maintainDirection,
  exactToLookAt,
  slerpToLookAt,
}

const factor = 1 / 8
const dummyVector = new THREE.Vector3()
const dummyMatrix = new THREE.Matrix4()
const dummyQuaternion = new THREE.Quaternion()

export function onOrbitControlChange(data: DemoCameraDataType) {
  setTargetPosition(data, data.camera.position)
  setTargetLookPosition(data, data.orbitControls.target)
}

export function setTargetPosition(
  data: DemoCameraDataType,
  pos: THREE.Vector3,
  lookDirUpdateMode?: LookDirUpdateMode
) {
  if (lookDirUpdateMode != null) data.lookDirUpdateMode = lookDirUpdateMode
  data.targetPosition.copy(pos)
}

export function setTargetLookPosition(
  data: DemoCameraDataType,
  pos: THREE.Vector3,
  lookDirUpdateMode?: LookDirUpdateMode
) {
  if (lookDirUpdateMode != null) data.lookDirUpdateMode = lookDirUpdateMode
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
    demo.fixedPointPosition = null
  } else if (demo.fixedPointPosition != null) {
    pointPosition.copy(demo.fixedPointPosition)
  }

  // For each camera
  for (let i = 0; i < 3; i++) {
    const data = demo.cameraData[i]

    // Get stuff
    const camera = data.camera
    const line = data.line
    const orbitControls = data.orbitControls
    let isTranslating = false
    let isRotating = false

    // Update position of camera if necessary
    const targetPosition = data.targetPosition
    dummyVector.subVectors(camera.position, targetPosition)
    const norm = dummyVector.length()
    if (norm > 0.0001) {
      isTranslating = true
      const step = 1 - Math.pow(factor, deltaTime) // Approximate lerp-ing
      camera.position.lerp(targetPosition, step)
      camera.updateProjectionMatrix()
      if (
        data.lookDirUpdateMode === LookDirUpdateMode.anything ||
        data.lookDirUpdateMode === LookDirUpdateMode.exactToLookAt
      ) {
        // If not already set to maintain, update exactly if far away
        data.lookDirUpdateMode = norm > 0.5 ? LookDirUpdateMode.exactToLookAt : LookDirUpdateMode.slerpToLookAt
      }
    } else {
      // Not translating
      data.lookDirUpdateMode = LookDirUpdateMode.slerpToLookAt
    }

    if (i === 1) console.log(data.lookDirUpdateMode)

    // Update angle of camera if necessary
    switch (data.lookDirUpdateMode) {
      case LookDirUpdateMode.maintainDirection: {
        break
      }
      case LookDirUpdateMode.exactToLookAt: {
        orbitControls.target.copy(data.targetLookPosition)
        camera.lookAt(data.targetLookPosition)
        break
      }
      case LookDirUpdateMode.slerpToLookAt: {
        dummyVector.copy(data.targetLookPosition).add(camera.position).sub(data.targetPosition)
        dummyMatrix.lookAt(camera.position, dummyVector, camera.up)
        dummyQuaternion.setFromRotationMatrix(dummyMatrix)
        if (!quaternionEquals(camera.quaternion, dummyQuaternion, 0.0001)) {
          isRotating = true
          const step = 1 - Math.pow(factor, deltaTime)
          data.orbitControls.target.copy(dummyVector)
          camera.quaternion.slerp(dummyQuaternion, step)
          camera.updateProjectionMatrix()
        }
        break
      }
    }
    if (!isTranslating && !isRotating) {
      orbitControls.update()
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
