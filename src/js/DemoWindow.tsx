import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { intrinsicHelper } from './common'
import { DemoType, main } from './stereoSetup/main'
import '../css/DemoWindow.scss'

function Target({ x, y, className }: { x: number; y: number; className: string }) {
  // Bottom left = [1,1]; top right = [-1,-1]
  return (
    <div
      className={'target ' + className}
      style={{
        transform: `translate(${-x * 50}%, ${y * 50 || 0}%) scale(0.02)`,
      }}
    />
  )
}

type DemoWindowProps = {
  x: THREE.Vector3
  xp: THREE.Vector3
  lFunction: (x: number) => number
  lpFunction: (xp: number) => number
  setX: React.Dispatch<React.SetStateAction<THREE.Vector4>>
  setK: React.Dispatch<React.SetStateAction<THREE.Matrix3>>
  setM: React.Dispatch<React.SetStateAction<THREE.Matrix4>>
  setKp: React.Dispatch<React.SetStateAction<THREE.Matrix3>>
  setMp: React.Dispatch<React.SetStateAction<THREE.Matrix4>>
  showC1: boolean
  showC2: boolean
  showC1Point: boolean
  showC2Point: boolean
  c1LookAtOrigin: boolean
  c1AlignAxis: 0 | 1 | 2 | null
  setC1AlignAxis: React.Dispatch<React.SetStateAction<0 | 1 | 2 | null>>
  isPlaying: boolean
}

function DemoWindow({
  x,
  xp,
  lFunction,
  lpFunction,
  setX,
  setK,
  setM,
  setKp,
  setMp,
  showC1,
  showC2,
  showC1Point,
  showC2Point,
  c1LookAtOrigin,
  c1AlignAxis,
  setC1AlignAxis,
  isPlaying,
}: DemoWindowProps) {
  // Refs
  const demoRef = useRef<DemoType>()
  const container1Ref = useRef<any>()
  const canvas1Ref = useRef<any>()
  const container2Ref = useRef<any>()
  const canvas2Ref = useRef<any>()

  // C1
  useEffect(() => {
    c1LookAtOrigin
      ? demoRef.current?.modifierFunctions.setC1ToLookAtOrigin()
      : demoRef.current?.modifierFunctions.setC1RotationToIdentity()
  }, [c1LookAtOrigin])
  useEffect(() => {
    demoRef.current?.modifierFunctions.alignC1Axis(c1AlignAxis)
    setC1AlignAxis(null)
  }, [c1AlignAxis])

  // Playing
  useEffect(() => {
    if (demoRef.current != null) {
      const { on, off } = demoRef.current.modifierFunctions.autoplay
      isPlaying ? on() : off()
    }
  }, [isPlaying])

  // Epipolar Line Predictions
  const [showELinePredictions, setShowELinePredictions] = useState<boolean>(false)

  // Frustums
  const [showFrustums, setShowFrustums] = useState<boolean>(false)
  useEffect(() => {
    if (demoRef.current != null) {
      const { on, off } = demoRef.current.modifierFunctions.frustums
      showFrustums ? on() : off()
    }
  }, [showFrustums])

  // Epipolar Lines
  const [showELines, setShowELines] = useState<boolean>(false)
  useEffect(() => {
    if (demoRef.current != null) {
      const { on, off } = demoRef.current.modifierFunctions.epipolarLines
      showELines ? on() : off()
    }
  }, [showELines])

  // Helper
  function updateGUIFunction(d: DemoType) {
    const newX = new THREE.Vector4(d.pointPosition.x, d.pointPosition.y, d.pointPosition.z, 1)
    setX((prevX) => (newX.equals(prevX) ? prevX : newX))
    // Camera 1
    const newK = intrinsicHelper(d.cameraData[0].intrinsicMatrix.clone())
    const newM = d.cameraData[0].extrinsicMatrix.clone()
    setK((prevK) => (newK.equals(prevK) ? prevK : newK))
    setM((prevM) => (newM.equals(prevM) ? prevM : newM))
    // Camera 2
    const newKp = intrinsicHelper(d.cameraData[1].intrinsicMatrix.clone())
    const newMp = d.cameraData[1].extrinsicMatrix.clone()
    setKp((prevKp) => (newKp.equals(prevKp) ? prevKp : newKp))
    setMp((prevMp) => (newMp.equals(prevMp) ? prevMp : newMp))
  }

  // On startup
  useEffect(() => {
    demoRef.current = main(container1Ref.current, canvas1Ref.current, container2Ref.current, canvas2Ref.current)
    demoRef.current.updateGUIFunction = updateGUIFunction
    updateGUIFunction(demoRef.current)
  }, [])

  const hiddenStyle: React.CSSProperties = { opacity: 0, pointerEvents: 'none' }

  return (
    <div id="demo-window">
      <div>
        <div className="container" ref={container1Ref} style={showC1 ? {} : hiddenStyle}>
          <canvas className="canvas" ref={canvas1Ref} />
          {showC1Point ? <Target x={x.x} y={x.y} className="blue" /> : null}
          {showELinePredictions ? (
            <>
              <Target x={-1} y={lFunction(-1)} className="green" />
              <Target x={1} y={lFunction(1)} className="green" />
            </>
          ) : null}
          <div className="container-label">{'Camera 1 (c1)'}</div>
        </div>
      </div>
      <div>
        <div className="container" ref={container2Ref} style={showC2 ? {} : hiddenStyle}>
          <canvas className="canvas" ref={canvas2Ref} />
          {showC2Point ? <Target x={xp.x} y={xp.y} className="green" /> : null}
          {showELinePredictions ? (
            <>
              <Target x={-1} y={lpFunction(-1)} className="blue" />
              <Target x={1} y={lpFunction(1)} className="blue" />
            </>
          ) : null}
          <div className="container-label">{'Camera 2 (c2)'}</div>
        </div>
      </div>
      <div>
        <div id="demo-controls-container">
          <button className="demo-control-button" onClick={() => setShowFrustums((prev) => !prev)}>
            {showFrustums ? 'hide frustums' : 'show frustums'}
          </button>
          <button className="demo-control-button" onClick={() => setShowELines((prev) => !prev)}>
            {showELines ? 'hide epipolar lines' : 'show epipolar lines'}
          </button>
          <button className="demo-control-button" onClick={() => setShowELinePredictions((prev) => !prev)}>
            {showELinePredictions ? 'hide epipolar line predictions' : 'show epipolar line predictions'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DemoWindow
