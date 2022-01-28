import React, { useEffect, useRef } from 'react'
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
}

function DemoWindow({ x, xp, lFunction, lpFunction, setX, setK, setM, setKp, setMp }: DemoWindowProps) {
  // Refs
  const demoRef = useRef<DemoType>()
  const container1Ref = useRef<any>()
  const canvas1Ref = useRef<any>()
  const container2Ref = useRef<any>()
  const canvas2Ref = useRef<any>()

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

  return (
    <div id="demo-window">
      <div className="camera-window">
        <div className="container" ref={container1Ref}>
          <canvas className="canvas" ref={canvas1Ref} />
          <Target x={x.x} y={x.y} className="blue" />
          <Target x={-1} y={lFunction(-1)} className="green" />
          <Target x={1} y={lFunction(1)} className="green" />
          <div className="container-label">{'Camera 1 (c1)'}</div>
        </div>
      </div>
      <div className="camera-window">
        <div className="container" ref={container2Ref}>
          <canvas className="canvas" ref={canvas2Ref} />
          <Target x={xp.x} y={xp.y} className="green" />
          <Target x={-1} y={lpFunction(-1)} className="blue" />
          <Target x={1} y={lpFunction(1)} className="blue" />
          <div className="container-label">{'Camera 2 (c2)'}</div>
        </div>
      </div>
    </div>
  )
}

export default DemoWindow
