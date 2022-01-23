import { useEffect, useRef, useState } from 'react'
import '../css/App.scss'
import '../css/Matrix.scss'

import * as THREE from 'three'
import Matrix4Display from './matrixDisplay/Matrix4Display'
import Vector4Display from './matrixDisplay/Vector4Display'
import { limitDpHelper } from './matrixDisplay/common'
import { DemoType, main } from './main'

function App() {
  const demoRef = useRef<DemoType>()
  const [vecA, setVecA] = useState<THREE.Vector4>(new THREE.Vector4())

  const [matA1, setMatA1] = useState<THREE.Matrix4>(new THREE.Matrix4())
  const [matB1, setMatB1] = useState<THREE.Matrix4>(new THREE.Matrix4())
  const container1Ref = useRef<any>()
  const canvas1Ref = useRef<any>()
  const matMul1 = matA1.clone().multiply(matB1)
  const result1 = vecA.clone().applyMatrix4(matMul1)
  const homogenizedResult1 = result1.clone().divideScalar(result1.z)

  const [matA2, setMatA2] = useState<THREE.Matrix4>(new THREE.Matrix4())
  const [matB2, setMatB2] = useState<THREE.Matrix4>(new THREE.Matrix4())
  const container2Ref = useRef<any>()
  const canvas2Ref = useRef<any>()
  const matMul2 = matA2.clone().multiply(matB2)
  const result2 = vecA.clone().applyMatrix4(matMul2)
  const homogenizedResult2 = result2.clone().divideScalar(result2.z)

  useEffect(() => {
    demoRef.current = main(
      container1Ref.current,
      canvas1Ref.current,
      container2Ref.current,
      canvas2Ref.current
    )

    setMatA1(demoRef.current.cameraData[0].intrinsicMatrix)
    setMatB1(demoRef.current.cameraData[0].extrinsicMatrix)

    setMatA2(demoRef.current.cameraData[1].intrinsicMatrix)
    setMatB2(demoRef.current.cameraData[1].extrinsicMatrix)

    setVecA(
      new THREE.Vector4(
        demoRef.current.pointPosition.x,
        demoRef.current.pointPosition.y,
        demoRef.current.pointPosition.z,
        1
      )
    )

    demoRef.current.updateFunction = (d) => {
      setVecA(new THREE.Vector4(d.pointPosition.x, d.pointPosition.y, d.pointPosition.z, 1))
    }
  }, [])

  return (
    <div className="App">
      <div id="container-container">
        <div className="container" ref={container1Ref}>
          <canvas className="canvas" ref={canvas1Ref} />
          <div
            className="target blue"
            style={{
              transform: `translate(${homogenizedResult1.x * 50}%, ${
                -homogenizedResult1.y * 50
              }%) scale(0.02)`,
            }}
          />
        </div>
        <div className="container" ref={container2Ref}>
          <canvas className="canvas" ref={canvas2Ref} />
          <div
            className="target green"
            style={{
              transform: `translate(${homogenizedResult2.x * 50}%, ${
                -homogenizedResult2.y * 50
              }%) scale(0.02)`,
            }}
          />
        </div>
      </div>

      <div className="matrix-equation">
        <Matrix4Display label={'intrinsic matrix'} matrix={matA1} />
        <span>{'*'}</span>
        <Matrix4Display label={'extrinsic matrix'} matrix={matB1} />
        <span>{'*'}</span>
        <Vector4Display label={'point'} vector={vecA} />
        <span>{'='}</span>
        <Vector4Display label={'result'} vector={result1} />
        <span>{'='}</span>
        <span className="limit-dp">{limitDpHelper(result1.z)}</span>
        <Vector4Display label={'factorized result'} vector={homogenizedResult1} className="blue" />
      </div>

      <div className="matrix-equation">
        <Matrix4Display label={'intrinsic matrix'} matrix={matA2} />
        <span>{'*'}</span>
        <Matrix4Display label={'extrinsic matrix'} matrix={matB2} />
        <span>{'*'}</span>
        <Vector4Display label={'point'} vector={vecA} />
        <span>{'='}</span>
        <Vector4Display label={'result'} vector={result2} />
        <span>{'='}</span>
        <span className="limit-dp">{limitDpHelper(result2.z)}</span>
        <Vector4Display label={'factorized result'} vector={homogenizedResult2} className="green" />
      </div>
    </div>
  )
}

export default App
