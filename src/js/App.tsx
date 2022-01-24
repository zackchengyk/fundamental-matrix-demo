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
  const vecHR2 = new THREE.Vector3(homogenizedResult2.x, homogenizedResult2.y, homogenizedResult2.z)

  const x = vecHR1.clone()
  const xp = vecHR2.clone()

  const matB1_inv = matB1.clone().invert()
  const cam1ToCam2 = matB2.clone().multiply(matB1_inv)
  const matR_T = new THREE.Matrix3().setFromMatrix4(cam1ToCam2)
  const matR = matR_T.clone().transpose()
  const right = new THREE.Vector3().setFromMatrixColumn(cam1ToCam2, 3)
  const vecT = right.clone().multiplyScalar(-1).applyMatrix3(matR)
  const matT = new THREE.Matrix3().fromArray([0, -vecT.z, vecT.y, vecT.z, 0, -vecT.x, -vecT.y, vecT.x, 0])
  const Ki = new THREE.Matrix3().setFromMatrix4(matA1).invert()
  const Kpi = new THREE.Matrix3().setFromMatrix4(matA2).invert()
  const test1 = vecT.clone().cross(xp.clone().applyMatrix3(Kpi).applyMatrix3(matR))

  const E = matT.clone().multiply(matR)
  const F = Ki.clone().transpose().multiply(E).multiply(Kpi)

  const line = xp.clone().applyMatrix3(F)
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

      <div id="scroll-outer">
        <div id="scroll-inner">
          <div className="matrix-equation">
            <Matrix4Display label={'intrinsic matrix, K'} matrix={matA1} />
            <span>{'*'}</span>
            <Matrix4Display label={'extrinsic matrix, M'} matrix={matB1} />
            <span>{'*'}</span>
            <Vector4Display label={'world coord, X'} vector={vecA} />
            <span>{'='}</span>
            <Vector4Display label={'result'} vector={result1} />
            <span>{'='}</span>
            <span className="limit-dp">{limitDpHelper(result1.z)}</span>
            <Vector4Display label={'image coord, x'} vector={homogenizedResult1} className="blue" />
          </div>

          <div className="matrix-equation">
            <Matrix4Display label={"intrinsic matrix, K'"} matrix={matA2} />
            <span>{'*'}</span>
            <Matrix4Display label={"extrinsic matrix, M'"} matrix={matB2} />
            <span>{'*'}</span>
            <Vector4Display label={'world coord, X'} vector={vecA} />
            <span>{'='}</span>
            <Vector4Display label={'result'} vector={result2} />
            <span>{'='}</span>
            <span className="limit-dp">{limitDpHelper(result2.z)}</span>
            <Vector4Display label={"image coord, x'"} vector={homogenizedResult2} className="green" />
          </div>

          <div className="text">
            <p>
              {'Since '}
              <strong>{'epipolar geometry'}</strong>
              {' is all about the relationship between two cameras,'}
              {" let's begin by finding the "}
              <strong>{'relative transformation'}</strong>
              {" from camera 1's space to camera 2's space."}
            </p>
            <p>
              {"If we have a coordinate in camera 1's space, first we "}
              <strong>{'left-multiply by M\u207B\u00B9'}</strong>
              {' to get to world space. Then, we '}
              <strong>{"left-multiply by M'"}</strong>
              {" to get to camera 2's space. This can be combined as below:"}
            </p>
          </div>

          <div className="matrix-equation">
            <Matrix4Display label={"M'"} matrix={matB2} />
            <span>{'*'}</span>
            <Matrix4Display label={'M\u207B\u00B9'} matrix={matB1_inv} />
            <span>{'='}</span>
            <Matrix4Display label={'camera 1 space to camera 2 space'} matrix={cam1ToCam2} />
          </div>

          <div className="text">
            <p>{'We can then break this into a rotation and translation.'}</p>
            <p>
              <strong>{'Think:'}</strong>
              {' What do R and T represent?'}
            </p>
            <p>
              <strong>{'Todo:'}</strong>
              {' Possibly explain why it breaks into R\u1D40 and -R\u1D40*T'}
            </p>
          </div>

          <div className="matrix-equation">
            <span>{' break '}</span>
            <Matrix4Display label={'camera 1 space to camera 2 space'} matrix={cam1ToCam2} />
            <span>{' into '}</span>
            <Matrix3Display label={'R\u1D40 (left side)'} matrix={matR_T} />
            <span>{' and '}</span>
            <Vector3Display label={'-R\u1D40 * T (right side)'} vector={right} />
            <span>{' ---> '}</span>
            <Matrix3Display label={'R'} matrix={matR} />
            <span>{' and '}</span>
            <Vector3Display label={'T'} vector={vecT} />
          </div>

          {/* <div className="matrix-equation">
            <span className="limit-dp">{limitDpHelper(x.clone().applyMatrix3(Ki).dot(test1))}</span>
            <span>{'='}</span>
            <Vector3Display label={"image coord, x'"} vector={vecHR2} className="green" />
            <span>{'dot'}</span>
            <Vector3Display label={"t cross Rx'"} vector={test1} className="blue" />
            <span>{'<==>'}</span>
            <Matrix3Display label={'R'} matrix={matR} />
            <span>{',, '}</span>
            <Vector3Display label={'T'} vector={vecT} className="blue" />
            <span>{',, '}</span>
            <Vector3Display label={'-R^T * T'} vector={right} className="blue" />
            <span>{',, '}</span>
          </div> */}

          <div className="matrix-equation">
            <Matrix3Display label={'F'} matrix={F} />
            <span>{'*'}</span>
            <Vector3Display label={'x'} vector={x} className="blue" />
            <span>{'='}</span>
            <Vector3Display label={'line'} vector={line} className="green" />
            <span>{'=>'}</span>
            <span className="limit-dp">{limitDpHelper(line.clone().dot(x))}</span>
            <span>{'=>'}</span>
            <Vector3Display label={'test'} vector={test} className="green" />
          </div>

          <div className="matrix-equation">
            <Matrix3Display label={'F'} matrix={F} />
            <span>{'*'}</span>
            <Vector3Display label={'x'} vector={x} className="blue" />
            <span>{'='}</span>
            <Vector3Display label={'line'} vector={line} className="green" />
            <span>{'=>'}</span>
            <span className="limit-dp">{limitDpHelper(line.clone().dot(x))}</span>
            <span>{'=>'}</span>
            <Vector3Display label={'test'} vector={test} className="green" />
          </div>

          <div className="text">
            <p>
              {'As you saw above, we used '}
              <strong>{'known camera matrices'}</strong>
              {' to get a fundamental matrix. This is just '}
              <strong>{'one'}</strong>
              {" way to do that \u2014 in fact, you'll implement a different way in HW3!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
