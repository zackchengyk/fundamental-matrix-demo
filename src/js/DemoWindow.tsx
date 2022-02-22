import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { CameraCommand, intrinsicHelper } from './common'
import { DemoType, main } from './stereoSetup/main'
import { OtherThingsToShow } from './App'
import '../css/DemoWindow.scss'

function Target({ x, y, className }: { x: number; y: number; className: string }) {
  // Note: bottom left = [1,1]; top right = [-1,-1]
  return (
    <div
      className={'target ' + className}
      style={{
        transform: `translate(${-x * 50}%, ${y * 50}%) scale(0.04)`,
      }}
    />
  )
}

function dispatchCameraCommand(demoRef: DemoType, cameraNumber: number, command: CameraCommand) {
  switch (command) {
    case CameraCommand.setLookPositionToOrigin: {
      demoRef.modifierFunctions.setLookPosition(cameraNumber, new THREE.Vector3())
      break
    }
    case CameraCommand.setRotationToIdentity: {
      demoRef.modifierFunctions.setRotationToIdentity(cameraNumber)
      break
    }
    case CameraCommand.resetTransforms: {
      demoRef.modifierFunctions.resetSetup(cameraNumber)
      break
    }
    case CameraCommand.useStandardViewX: {
      demoRef.modifierFunctions.setPosition(cameraNumber, new THREE.Vector3(10, 0, 0))
      demoRef.modifierFunctions.setLookPosition(cameraNumber, new THREE.Vector3())
      break
    }
    case CameraCommand.useStandardViewY: {
      demoRef.modifierFunctions.setPosition(cameraNumber, new THREE.Vector3(0, 10, 0))
      demoRef.modifierFunctions.setLookPosition(cameraNumber, new THREE.Vector3())
      break
    }
    case CameraCommand.useStandardViewZ: {
      demoRef.modifierFunctions.setPosition(cameraNumber, new THREE.Vector3(0, 0, 10))
      demoRef.modifierFunctions.setLookPosition(cameraNumber, new THREE.Vector3())
      break
    }
  }
}

type DemoWindowProps = {
  // Predictions
  x: THREE.Vector3
  xp: THREE.Vector3
  lFunction: (x: number) => number
  lpFunction: (xp: number) => number
  // Point
  setX: React.Dispatch<React.SetStateAction<THREE.Vector4>>
  isMoving: boolean
  // Camera 1
  setK: React.Dispatch<React.SetStateAction<THREE.Matrix3>>
  setM: React.Dispatch<React.SetStateAction<THREE.Matrix4>>
  setC1Pos: React.Dispatch<React.SetStateAction<THREE.Vector3>>
  showC1Display: boolean
  // Camera 2
  setKp: React.Dispatch<React.SetStateAction<THREE.Matrix3>>
  setMp: React.Dispatch<React.SetStateAction<THREE.Matrix4>>
  setC2Pos: React.Dispatch<React.SetStateAction<THREE.Vector3>>
  showC2Display: boolean
  // Stuff
  showC3Display: boolean
  otherThingsToShow: OtherThingsToShow
  // Control function triggers
  c1Command: CameraCommand
  setC1Command: React.Dispatch<React.SetStateAction<CameraCommand>>
  c2Command: CameraCommand
  setC2Command: React.Dispatch<React.SetStateAction<CameraCommand>>
}

function DemoWindow({
  // Predictions
  x,
  xp,
  lFunction,
  lpFunction,
  // Point
  setX,
  isMoving,
  // Camera 1
  setK,
  setM,
  setC1Pos,
  showC1Display,
  // Camera 2
  setKp,
  setMp,
  setC2Pos,
  showC2Display,
  // Stuff
  showC3Display,
  otherThingsToShow,
  // Control function triggers
  c1Command,
  setC1Command,
  c2Command,
  setC2Command,
}: DemoWindowProps) {
  // Refs
  const demoRef = useRef<DemoType>()
  const container1Ref = useRef<any>()
  const canvas1Ref = useRef<any>()
  const container2Ref = useRef<any>()
  const canvas2Ref = useRef<any>()
  const container3Ref = useRef<any>()
  const canvas3Ref = useRef<any>()

  // Camera 1
  useEffect(() => {
    if (c1Command === CameraCommand.nothing || demoRef.current == null) return
    dispatchCameraCommand(demoRef.current, 0, c1Command)
    setC1Command(CameraCommand.nothing)
  }, [c1Command])

  // Camera 2
  useEffect(() => {
    if (c2Command === CameraCommand.nothing || demoRef.current == null) return
    dispatchCameraCommand(demoRef.current, 1, c2Command)
    setC2Command(CameraCommand.nothing)
  }, [c2Command])

  // Moving
  useEffect(() => {
    if (demoRef.current == null) return
    demoRef.current.modifierFunctions.enableMovement(isMoving)
  }, [isMoving])

  // Frustums
  useEffect(() => {
    if (demoRef.current == null) return
    demoRef.current.modifierFunctions.showFrustum(0, otherThingsToShow.c1Frustum)
  }, [otherThingsToShow.c1Frustum])
  useEffect(() => {
    if (demoRef.current == null) return
    demoRef.current.modifierFunctions.showFrustum(1, otherThingsToShow.c2Frustum)
  }, [otherThingsToShow.c2Frustum])

  // Epipolar Lines
  useEffect(() => {
    if (demoRef.current == null) return
    demoRef.current.modifierFunctions.showEpipolarLines(otherThingsToShow.epipolarLines)
  }, [otherThingsToShow.epipolarLines])

  // Helper
  function updateGUIFunction(d: DemoType) {
    const newX = new THREE.Vector4(d.pointPosition.x, d.pointPosition.y, d.pointPosition.z, 1)
    setX((prevX) => (newX.equals(prevX) ? prevX : newX))
    // Camera 1
    const newK = intrinsicHelper(d.cameraData[0].intrinsicMatrix.clone())
    const newM = d.cameraData[0].extrinsicMatrix.clone()
    const newC1Pos = d.cameraData[0].camera.position.clone()
    setK((prevK) => (newK.equals(prevK) ? prevK : newK))
    setM((prevM) => (newM.equals(prevM) ? prevM : newM))
    setC1Pos((prevC1Pos) => (newC1Pos.equals(prevC1Pos) ? prevC1Pos : newC1Pos))
    // Camera 2
    const newKp = intrinsicHelper(d.cameraData[1].intrinsicMatrix.clone())
    const newMp = d.cameraData[1].extrinsicMatrix.clone()
    const newC2Pos = d.cameraData[0].camera.position.clone()
    setKp((prevKp) => (newKp.equals(prevKp) ? prevKp : newKp))
    setMp((prevMp) => (newMp.equals(prevMp) ? prevMp : newMp))
    setC2Pos((prevC2Pos) => (newC1Pos.equals(prevC2Pos) ? prevC2Pos : newC2Pos))
  }

  // On startup
  useEffect(() => {
    demoRef.current = main(
      container1Ref.current,
      canvas1Ref.current,
      container2Ref.current,
      canvas2Ref.current,
      container3Ref.current,
      canvas3Ref.current
    )
    demoRef.current.updateGUIFunction = updateGUIFunction
    updateGUIFunction(demoRef.current)
  }, [])

  const hiddenStyle: React.CSSProperties = { opacity: 0, pointerEvents: 'none' }

  return (
    <div id="demo-window">
      <div>
        <div className="container" ref={container1Ref} style={showC1Display ? {} : hiddenStyle}>
          <canvas className="canvas" ref={canvas1Ref} />
          {otherThingsToShow.c1PointPrediction ? <Target x={x.x} y={x.y} className="blue" /> : null}
          {otherThingsToShow.epipolarLinePredictions ? (
            <>
              <Target x={-1} y={lFunction(-1)} className="green" />
              <Target x={1} y={lFunction(1)} className="green" />
            </>
          ) : null}
          <div className="container-label">{'Camera 1 (c1)'}</div>
        </div>
      </div>
      <div>
        <div className="container" ref={container2Ref} style={showC2Display ? {} : hiddenStyle}>
          <canvas className="canvas" ref={canvas2Ref} />
          {otherThingsToShow.c2PointPrediction ? <Target x={xp.x} y={xp.y} className="green" /> : null}
          {otherThingsToShow.epipolarLinePredictions ? (
            <>
              <Target x={-1} y={lpFunction(-1)} className="blue" />
              <Target x={1} y={lpFunction(1)} className="blue" />
            </>
          ) : null}
          <div className="container-label">{'Camera 2 (c2)'}</div>
        </div>
      </div>
      <div>
        <div className="container" ref={container3Ref} style={showC3Display ? {} : hiddenStyle}>
          <canvas className="canvas" ref={canvas3Ref} />
          <div className="container-label">{'Witness Camera'}</div>
        </div>
      </div>
    </div>
  )
}

export default DemoWindow
