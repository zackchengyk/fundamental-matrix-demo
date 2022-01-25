import { useEffect, useRef, useState } from 'react'
import '../css/App.scss'
import '../css/Matrix.scss'

import * as THREE from 'three'
import Matrix4Display from './matrixDisplay/Matrix4Display'
import Vector4Display from './matrixDisplay/Vector4Display'
import { limitDpHelper } from './matrixDisplay/common'
import { DemoType, main } from './stereoSetup/main'
import Matrix3Display from './matrixDisplay/Matrix3Display'
import Vector3Display from './matrixDisplay/Vector3Display'

function getCrossProductMatrix(T: THREE.Vector3): THREE.Matrix3 {
  return new THREE.Matrix3().fromArray([0, -T.z, T.y, T.z, 0, -T.x, -T.y, T.x, 0])
}

function App() {
  // References
  const demoRef = useRef<DemoType>()
  const container1Ref = useRef<any>()
  const canvas1Ref = useRef<any>()
  const container2Ref = useRef<any>()
  const canvas2Ref = useRef<any>()

  // States, camera 1
  const [X, setX] = useState<THREE.Vector4>(new THREE.Vector4())
  const [K, setK] = useState<THREE.Matrix4>(new THREE.Matrix4())
  const [M, setM] = useState<THREE.Matrix4>(new THREE.Matrix4())
  const KM = K.clone().multiply(M)
  const result = X.clone().applyMatrix4(KM)
  const homogenizedResult = result.clone().divideScalar(result.z)
  const x = new THREE.Vector3(homogenizedResult.x, homogenizedResult.y, homogenizedResult.z)

  // States, camera 2
  const [Kp, setKp] = useState<THREE.Matrix4>(new THREE.Matrix4())
  const [Mp, setMp] = useState<THREE.Matrix4>(new THREE.Matrix4())
  const KpMp = Kp.clone().multiply(Mp)
  const resultp = X.clone().applyMatrix4(KpMp)
  const homogenizedResultp = resultp.clone().divideScalar(resultp.z)
  const xp = new THREE.Vector3(homogenizedResultp.x, homogenizedResultp.y, homogenizedResultp.z)

  // Camera 1 to camera 2 coordinate transform
  const M_inv = M.clone().invert()
  const cam1ToCam2 = Mp.clone().multiply(M_inv)
  const Rt = new THREE.Matrix3().setFromMatrix4(cam1ToCam2)
  const minusRtT = new THREE.Vector3().setFromMatrixColumn(cam1ToCam2, 3)

  // Decomposed into R and T
  const R = Rt.clone().transpose()
  const T = minusRtT.clone().multiplyScalar(-1).applyMatrix3(R)
  const T_x = getCrossProductMatrix(T)

  // Essential and Fundamental Matrices
  const Kit = new THREE.Matrix3().setFromMatrix4(K).invert().transpose()
  const Kpi = new THREE.Matrix3().setFromMatrix4(Kp).invert()
  const E = T_x.clone().multiply(R)
  const F = Kit.clone().multiply(E).multiply(Kpi)
  const Ft = F.clone().transpose()

  // Lines
  const l = xp.clone().applyMatrix3(F)
  const lPoints = new THREE.Vector3((l.x - l.z) / l.y, 0, (-l.x - l.z) / l.y)
  const lp = x.clone().applyMatrix3(Ft)
  const lpPoints = new THREE.Vector3((lp.x - lp.z) / lp.y, 0, (-lp.x - lp.z) / lp.y)

  useEffect(() => {
    demoRef.current = main(
      container1Ref.current,
      canvas1Ref.current,
      container2Ref.current,
      canvas2Ref.current
    )

    function updateGUIFunction(d: DemoType) {
      setK(d.cameraData[0].intrinsicMatrix)
      setM(d.cameraData[0].extrinsicMatrix)

      setKp(d.cameraData[1].intrinsicMatrix)
      setMp(d.cameraData[1].extrinsicMatrix)

      setX(new THREE.Vector4(d.pointPosition.x, d.pointPosition.y, d.pointPosition.z, 1))
    }

    updateGUIFunction(demoRef.current)

    demoRef.current.updateGUIFunction = updateGUIFunction
  }, [])

  return (
    <div className="App">
      <div id="container-container">
        <div className="container" ref={container1Ref}>
          <canvas className="canvas" ref={canvas1Ref} />
          <div
            className="target blue"
            style={{
              transform: `translate(${homogenizedResult.x * 50}%, ${-homogenizedResult.y * 50}%) scale(0.02)`,
            }}
          />
          <div
            className="target green"
            style={{
              transform: `translate(${-50}%, ${-lPoints.x * 50 || 0}%) scale(0.02)`,
            }}
          />
          <div
            className="target green"
            style={{
              transform: `translate(${50}%, ${-lPoints.z * 50 || 0}%) scale(0.02)`,
            }}
          />
        </div>
        <div className="container" ref={container2Ref}>
          <canvas className="canvas" ref={canvas2Ref} />
          <div
            className="target green"
            style={{
              transform: `translate(${homogenizedResultp.x * 50}%, ${
                -homogenizedResultp.y * 50
              }%) scale(0.02)`,
            }}
          />
          <div
            className="target blue"
            style={{
              transform: `translate(${-50}%, ${-lpPoints.x * 50 || 0}%) scale(0.02)`,
            }}
          />
          <div
            className="target blue"
            style={{
              transform: `translate(${50}%, ${-lpPoints.z * 50 || 0}%) scale(0.02)`,
            }}
          />
        </div>
      </div>

      <div id="scroll-outer">
        <div id="scroll-inner">
          <div className="text">
            <p>
              {'Welcome! Get comfy, because this page is all about how to mathematically go from '}
              <strong>{'camera matrices'}</strong>
              {' to the '}
              <strong>{'fundamental matrix'}</strong>
              {' and '}
              <strong>{'epipolar lines'}</strong>
              {'.'}
            </p>
            <p>
              {"Let's get started with some simple camera projection, based on the cameras and objects "}
              {'in the scene simulated above.'}
            </p>
            <p>
              {'By the way, any time you see a '}
              <strong style={{ color: '#5bb585' }}>{'colored '}</strong>
              <strong style={{ color: '#0082e7' }}>{'circle '}</strong>
              {"up there, that's actually our prediction (using CSS), not a part of the simulation!"}
            </p>
          </div>

          <div className="matrix-equation">
            <Matrix4Display label={'intrinsic matrix, K'} matrix={K} />
            <span>{'*'}</span>
            <Matrix4Display label={'extrinsic matrix, M'} matrix={M} />
            <span>{'*'}</span>
            <Vector4Display label={'world coord, X'} vector={X} />
            <span>{'='}</span>
            <Vector4Display label={'result'} vector={result} />
            <span>{'='}</span>
            <span className="limit-dp">{limitDpHelper(result.z)}</span>
            <Vector4Display label={'image coord, x'} vector={homogenizedResult} className="blue" />
          </div>

          <div className="matrix-equation">
            <Matrix4Display label={"intrinsic matrix, K'"} matrix={Kp} />
            <span>{'*'}</span>
            <Matrix4Display label={"extrinsic matrix, M'"} matrix={Mp} />
            <span>{'*'}</span>
            <Vector4Display label={'world coord, X'} vector={X} />
            <span>{'='}</span>
            <Vector4Display label={'result'} vector={resultp} />
            <span>{'='}</span>
            <span className="limit-dp">{limitDpHelper(resultp.z)}</span>
            <Vector4Display label={"image coord, x'"} vector={homogenizedResultp} className="green" />
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
            <Matrix4Display label={"M'"} matrix={Mp} />
            <span>{'*'}</span>
            <Matrix4Display label={'M\u207B\u00B9'} matrix={M_inv} />
            <span>{'='}</span>
            <Matrix4Display label={'camera 1 space to camera 2 space'} matrix={cam1ToCam2} />
          </div>

          <div className="text">
            <p>
              {"Next, let's break the above matrix apart. We define these parts as "}
              {' weird math expressions, but it will make more sense later!'}
            </p>
          </div>

          <div className="matrix-equation">
            <span>{' break '}</span>
            <Matrix4Display label={'camera 1 space to camera 2 space'} matrix={cam1ToCam2} />
            <span>{' into '}</span>
            <Matrix3Display label={'left side, defined as R\u1D40'} matrix={R} />
            <span>{' and '}</span>
            <Vector3Display label={'right side, defined as -(R\u1D40 * T)'} vector={minusRtT} />
          </div>

          <div className="matrix-equation">
            <span>{'From R\u1D40 and -(R\u1D40 * T), we can then get '}</span>
            <Matrix3Display label={'R'} matrix={R} />
            <span>{' and '}</span>
            <Vector3Display label={'T'} vector={T} />
          </div>

          <div className="text">
            <p>
              <strong>{'Think:'}</strong>
              {' What exactly do '}
              <strong>{'R'}</strong>
              {' and '}
              <strong>{'T'}</strong>
              {" represent, and what's up with the -(R\u1D40 * T) on the right side?"}
            </p>
            <p>
              <strong>{'Explanation (click to expand):'}</strong>
            </p>
            <p>
              {'Imagine both cameras shared the same world position, but differed in rotation. Then, '}
              {"R\u1D40 would take camera 1's (c1's) direction and rotate it to match camera 2's (c2's). "}
              {'Thus, R\u1D40 is '}
              <strong>{'the rotation from c1 to c2'}</strong>
              {', and since transposition is the same as inversion for rotation matrices, R is '}
              <strong>{'the rotation from c2 to c1'}</strong>
              {'.'}
            </p>
            <p>
              {'Now, imagine they have different world positions as well. '}
              {'R\u1D40 again rotates c1 to be parallel to c2. '}
              {'But now, to move c1 to perfectly match c2, '}
              {'we need to translate it by some vector '}
              <em>{"in c2's space"}</em>
              {': this is -(R\u1D40 * T), '}
              <strong>{"the translation from c1 to c2, in c2's space"}</strong>
              {'.'}
            </p>
            <p>
              {'On the flip side, T is '}
              <strong>{"the translation from c2 to c1, in c1's space"}</strong>
              {'.'}
            </p>
          </div>

          <div className="matrix-equation">
            <span style={{ top: 0 }}>{'(ಥ﹏ಥ)'}</span>
          </div>

          <div className="text">
            <p>
              <strong>{'Whew!'}</strong>
              {' That was a lot to get through!'}
              <br />
              {"Don't worry, it took me >20h to figure this out, "}
              {"and you don't have to totally understand this for HW3."}
            </p>
            <p>
              {'But now, '}
              <strong>{'given R and T'}</strong>
              {', we can finally make the '}
              <strong>{'essential matrix'}</strong>
              {'! Just follow the recipe:'}
            </p>
          </div>

          <div className="matrix-equation">
            <span>{'First, convert T into its cross-product matrix form: '}</span>
            <Vector3Display label={'T'} vector={T} />
            <span>{'=>'}</span>
            <Matrix3Display label={'T_x'} matrix={T_x} />
          </div>
          <div className="matrix-equation">
            <span>{'Then multiply!: '}</span>
            <Matrix3Display label={'T_x'} matrix={T_x} />
            <span>{'*'}</span>
            <Matrix3Display label={'R'} matrix={R} />
            <span>{'='}</span>
            <Matrix3Display label={'E'} matrix={E} />
          </div>

          <div className="text">
            <p>
              {'The essential matrix is great for '}
              <strong>{'canonical cameras'}</strong>
              {', with K = identity, but we have non-canonical cameras here. So, we must instead get the '}
              <strong>{'fundamental matrix'}</strong>
              {':'}
            </p>
          </div>

          <div className="matrix-equation">
            <Matrix3Display label={'K\u207B\u1D40'} matrix={Kit} />
            <span>{'*'}</span>
            <Matrix3Display label={'E'} matrix={E} />
            <span>{'*'}</span>
            <Matrix3Display label={"K'\u207B\u00B9"} matrix={Kpi} />
            <span>{'='}</span>
            <Matrix3Display label={'F'} matrix={F} />
          </div>

          <div className="text">
            <p>
              {'And with that, we can finally make '}
              <strong>{'epipolar lines'}</strong>
              {'! '}
              {"Those are what I'm using to position the circles on the sides of the images above."}
            </p>
          </div>

          <div className="matrix-equation">
            <Matrix3Display label={'F'} matrix={F} />
            <span>{'*'}</span>
            <Vector3Display label={"x'"} vector={xp} className="green" />
            <span>{'='}</span>
            <Vector3Display label={'l'} vector={l} className="blue all" />
          </div>

          <div className="matrix-equation">
            <Matrix3Display label={'F\u1D40'} matrix={Ft} />
            <span>{'*'}</span>
            <Vector3Display label={'x'} vector={x} className="blue" />
            <span>{'='}</span>
            <Vector3Display label={"l'"} vector={l} className="green all" />
          </div>

          <div className="text">
            <p>
              <strong>{'Congratulations!'}</strong>
              <br />
              {'You made it through the most difficult concept in CSCI 1430 :)'}
            </p>
            <p>
              {'As you saw above, we used '}
              <strong>{'known camera matrices'}</strong>
              {' to get a fundamental matrix. This is just '}
              <strong>{'one'}</strong>
              {' way to do it, and probably the harder one.'}
            </p>
            <p>
              {'In HW3, you will implement a different way, one which involves '}
              {'using point correspondences to '}
              <em>{'guess'}</em>
              {' the fundamental matrix, instead. All the best!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
