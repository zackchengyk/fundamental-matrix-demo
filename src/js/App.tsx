import { useEffect, useRef, useState } from 'react'
import '../css/App.scss'
import '../css/Matrix.scss'

import * as THREE from 'three'
import Matrix4Display from './matrixDisplay/Matrix4Display'
import Vector4Display from './matrixDisplay/Vector4Display'
import { limitDpHelper } from './matrixDisplay/common'
import { DemoType, main } from './main'
import Matrix3Display from './matrixDisplay/Matrix3Display'
import Vector3Display from './matrixDisplay/Vector3Display'

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
  const vecHR1 = new THREE.Vector3(homogenizedResult1.x, homogenizedResult1.y, homogenizedResult1.z)

  const [matA2, setMatA2] = useState<THREE.Matrix4>(new THREE.Matrix4())
  const [matB2, setMatB2] = useState<THREE.Matrix4>(new THREE.Matrix4())
  const container2Ref = useRef<any>()
  const canvas2Ref = useRef<any>()
  const matMul2 = matA2.clone().multiply(matB2)
  const result2 = vecA.clone().applyMatrix4(matMul2)
  const homogenizedResult2 = result2.clone().divideScalar(result2.z)

  const [matR, setMatR] = useState<THREE.Matrix3>(new THREE.Matrix3())
  const [matT, setMatT] = useState<THREE.Matrix3>(new THREE.Matrix3())
  const Kit = new THREE.Matrix3().setFromMatrix4(matA1).invert().transpose()
  const Kp = new THREE.Matrix3().setFromMatrix4(matA2)
  const line = vecHR1.clone().applyMatrix3(Kit.clone().multiply(matR).multiply(matT).multiply(Kp))
  const test = new THREE.Vector3((line.x - line.z) / line.y, 0, (-line.x - line.z) / line.y)

  useEffect(() => {
    demoRef.current = main(
      container1Ref.current,
      canvas1Ref.current,
      container2Ref.current,
      canvas2Ref.current
    )

    function updateFunction(d: DemoType) {
      setMatA1(d.cameraData[0].intrinsicMatrix)
      setMatB1(d.cameraData[0].extrinsicMatrix)

      setMatA2(d.cameraData[1].intrinsicMatrix)
      setMatB2(d.cameraData[1].extrinsicMatrix)

      setVecA(new THREE.Vector4(d.pointPosition.x, d.pointPosition.y, d.pointPosition.z, 1))

      setMatR(new THREE.Matrix3().setFromMatrix4(d.rotationMatrix))
      setMatT(d.translationCrossMatrix)
    }

    updateFunction(demoRef.current)

    demoRef.current.updateFunction = updateFunction
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

          <div
            className="target green"
            style={{
              transform: `translate(${-50}%, ${-test.x * 50 || 0}%) scale(0.02)`,
            }}
          />
          <div
            className="target green"
            style={{
              transform: `translate(${50}%, ${-test.z * 50 || 0}%) scale(0.02)`,
            }}
          />
        </div>
      </div>

      <div className="matrix-equation">
        <Matrix4Display label={'intrinsic matrix (K)'} matrix={matA1} />
        <span>{'*'}</span>
        <Matrix4Display label={'extrinsic matrix'} matrix={matB1} />
        <span>{'*'}</span>
        <Vector4Display label={'world coord (X)'} vector={vecA} />
        <span>{'='}</span>
        <Vector4Display label={'result'} vector={result1} />
        <span>{'='}</span>
        <span className="limit-dp">{limitDpHelper(result1.z)}</span>
        <Vector4Display label={'image coord (x)'} vector={homogenizedResult1} className="blue" />
      </div>

      <div className="matrix-equation">
        <Matrix4Display label={"intrinsic matrix (K')"} matrix={matA2} />
        <span>{'*'}</span>
        <Matrix4Display label={'extrinsic matrix'} matrix={matB2} />
        <span>{'*'}</span>
        <Vector4Display label={'world coord (X)'} vector={vecA} />
        <span>{'='}</span>
        <Vector4Display label={'result'} vector={result2} />
        <span>{'='}</span>
        <span className="limit-dp">{limitDpHelper(result2.z)}</span>
        <Vector4Display label={"image coord (x')"} vector={homogenizedResult2} className="green" />
      </div>

      <div className="matrix-equation">
        <Matrix3Display label={'K inv T'} matrix={Kit} />
        <span>{'*'}</span>
        <Matrix3Display label={'rotation between cameras'} matrix={matR} />
        <span>{'*'}</span>
        <Matrix3Display label={'translation-cross between cameras'} matrix={matT} />
        <span>{'*'}</span>
        <Matrix3Display label={"K'"} matrix={Kp} />
        <span>{'*'}</span>
        <Vector3Display label={'image coord (x)'} vector={vecHR1} className="blue" />
        <span>{'='}</span>
        <Vector3Display label={'line'} vector={line} className="green" />
        <span>{'=>'}</span>
        <Vector3Display label={'test'} vector={test} className="green" />
      </div>
    </div>
  )
}

export default App
