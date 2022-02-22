import { useRef, useState } from 'react'
import '../css/App.scss'
import '../css/Matrix.scss'

import * as THREE from 'three'
import Matrix44Display from './matrixDisplay/Matrix44Display'
import Vector4Display from './matrixDisplay/Vector4Display'
import { CameraCommand, crossProductMatrixHelper, limitDpHelper } from './common'
import Matrix33Display from './matrixDisplay/Matrix33Display'
import Vector3Display from './matrixDisplay/Vector3Display'
import Matrix34Display from './matrixDisplay/Matrix34Display'
import DemoWindow from './DemoWindow'
import useScrollWatcher from './useScrollWatcher'

const proExample = new THREE.Matrix4().fromArray([
  'a',
  'e',
  'i',
  0,
  'b',
  'f',
  'j',
  0,
  'c',
  'g',
  'k',
  0,
  'd',
  'h',
  'l',
  0,
])
const intExample = new THREE.Matrix3().fromArray(['fx', 0, 0, 's', 'fy', 0, 'u0', 'v0', 1])
const extExample = new THREE.Matrix4().fromArray([
  'r11',
  'r21',
  'r31',
  0,
  'r12',
  'r22',
  'r32',
  0,
  'r13',
  'r23',
  'r33',
  0,
  'tx',
  'ty',
  'tz',
  0,
])

export type OtherThingsToShow = {
  c1PointPrediction: boolean
  c2PointPrediction: boolean
  frustums: boolean
  epipolarLines: boolean
  epipolarLinePredictions: boolean
}

function App() {
  // World
  const [X, setX] = useState<THREE.Vector4>(new THREE.Vector4())

  // Camera 1
  const [K, setK] = useState<THREE.Matrix3>(new THREE.Matrix3())
  const [M, setM] = useState<THREE.Matrix4>(new THREE.Matrix4())
  const [c1Pos, setC1Pos] = useState<THREE.Vector3>(new THREE.Vector3())
  const MX = X.clone().applyMatrix4(M)
  const result = new THREE.Vector3(MX.x, MX.y, MX.z).applyMatrix3(K)
  const x = result.clone().divideScalar(result.z)

  // Camera 2
  const [Kp, setKp] = useState<THREE.Matrix3>(new THREE.Matrix3())
  const [Mp, setMp] = useState<THREE.Matrix4>(new THREE.Matrix4())
  const [c2Pos, setC2Pos] = useState<THREE.Vector3>(new THREE.Vector3())
  const MpX = X.clone().applyMatrix4(Mp)
  const resultp = new THREE.Vector3(MpX.x, MpX.y, MpX.z).applyMatrix3(Kp)
  const xp = resultp.clone().divideScalar(resultp.z)

  // Camera 1 to camera 2 coordinate transform
  const M_inv = M.clone().invert()
  const cam1ToCam2 = Mp.clone().multiply(M_inv)
  const Rt = new THREE.Matrix3().setFromMatrix4(cam1ToCam2)
  const minusRtT = new THREE.Vector3().setFromMatrixColumn(cam1ToCam2, 3)

  // Decomposed into R and T
  const R = Rt.clone().transpose()
  const T = minusRtT.clone().multiplyScalar(-1).applyMatrix3(R)
  const T_x = crossProductMatrixHelper(T)

  // Essential and Fundamental Matrices
  const Kit = K.clone().invert().transpose()
  const Kpi = Kp.clone().invert()
  const E = T_x.clone().multiply(R)
  const F = Kit.clone().multiply(E).multiply(Kpi)
  const Ft = F.clone().transpose()

  // Lines
  const l = xp.clone().applyMatrix3(F)
  const lFunction = (x: number): number => (-l.z - l.x * x) / l.y
  const lp = x.clone().applyMatrix3(Ft)
  const lpFunction = (x: number): number => (-lp.z - lp.x * x) / lp.y

  // States
  const scrollRef = useRef<any>()
  const [c1EquationRef, showC1Display] = useScrollWatcher({
    root: scrollRef.current,
    rootMargin: '0px',
    threshold: 1.0,
  })
  const [c2EquationRef, showC2Display] = useScrollWatcher({
    root: scrollRef.current,
    rootMargin: '0px',
    threshold: 1.0,
  })

  // Controls to interact with demo
  const [isMoving, setIsMoving] = useState<boolean>(false)
  const [otherThingsToShow, setOtherThingsToShow] = useState<OtherThingsToShow>({
    c1PointPrediction: false,
    c2PointPrediction: false,
    frustums: false,
    epipolarLines: false,
    epipolarLinePredictions: false,
  })
  const [c1Command, setC1Command] = useState<CameraCommand>(CameraCommand.nothing)
  const [c2Command, setC2Command] = useState<CameraCommand>(CameraCommand.nothing)

  return (
    <div className="App">
      <DemoWindow
        {...{
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
          otherThingsToShow,
          // Control function triggers
          c1Command,
          setC1Command,
          c2Command,
          setC2Command,
        }}
      />

      <div id="scroll-outer">
        <div ref={scrollRef}>
          <div id="scroll-inner">
            <h1 className="title-text">{'CSCI 1430: Fundamental Matrix Workshop'}</h1>

            <div className="body-text">
              <p>
                {"Hello! In this workshop, we'll walk through how to go from "}
                <strong>{'camera matrices'}</strong>
                {' to the '}
                <strong>{'fundamental matrix'}</strong>
                {' and '}
                <strong>{'epipolar lines'}</strong>
                {'.'}
              </p>
              <p>
                {'Epipolar geometry is a challenging concept to nail down, '}
                {'so if you have any questions, please make sure to ask us TAs!'}
              </p>
            </div>

            <h2 id="camera-matrices-recap" className="title-text">
              {'Camera Matrices (Recap)'}
            </h2>

            <div className="body-text">
              <p>
                {'In previous lectures, you learned that a pinhole camera can be described by its '}
                <strong>{'projection'}</strong>
                {' matrix, which is the product of its '}
                <strong>{'intrinsic'}</strong>
                {' and '}
                <strong>{'extrinsic'}</strong>
                {' matrices:'}
              </p>
            </div>

            <div className="matrix-equation">
              <Matrix34Display label={'projection matrix'} matrix={proExample} />
              <span>{'='}</span>
              <Matrix33Display label={'intrinsic matrix'} matrix={intExample} />
              <span>{'*'}</span>
              <Matrix34Display label={'extrinsic matrix'} matrix={extExample} />
            </div>

            <div className="body-text">
              <p>
                {'Recall that the '}
                <strong>
                  <em>{'intrinsic'}</em>
                </strong>
                {' matrix depends only on things '}
                <em>{'intrinsic'}</em>
                {' to the camera, like its field of view.'}
              </p>
              <p>
                {'Likewise, the '}
                <strong>
                  <em>{'extrinsic'}</em>
                </strong>
                {" matrix depends only on the camera's "}
                <em>{'extrinsic'}</em>
                {' properties: its rotation and position in space.'}
              </p>
              <blockquote>
                <p>
                  {'Think:  '}
                  {"using only the extrinsic matrix, can you determine the camera's "}
                  {'position in world space? If yes, how?'}
                  <br />
                  <br />
                  {'Hint:  '}
                  {"it's not <tx, ty, tz>."}
                </p>
              </blockquote>
            </div>

            <h2 id="introducing-camera-1" className="title-text">
              {'Introducing: Camera 1'}
            </h2>

            <div className="body-text">
              <p>
                {"Now, let's look at an "}
                <strong>{'interactive example'}</strong>
                {". Here, we've set up a scene with an object and a camera (we'll call this "}
                <strong>{'camera 1'}</strong>
                {').'}
              </p>
            </div>

            <div className="matrix-equation" ref={c1EquationRef}>
              <span>{'Camera 1 has'}</span>
              <Matrix33Display label={'intrinsic matrix, K'} matrix={K} />
              <span>{', '}</span>
              <Matrix34Display label={'extrinsic matrix, M'} matrix={M} />
              <span>{', and'}</span>
              <Vector3Display label={'position'} vector={c1Pos} />
            </div>

            <div className="body-text">
              <p>
                {'Move the camera, and see how its intrinsic and extrinsic matrices change. '}
                {'You can drag with one finger to rotate, drag with two fingers to pan, '}
                {'scroll to zoom, or click any of these buttons:'}
              </p>
            </div>

            <div className="body-text">
              <p>
                <button
                  className="control-button"
                  onClick={() => setC1Command(CameraCommand.setRotationToIdentity)}>
                  {'Set Rotation To Identity'}
                </button>{' '}
                <button
                  className="control-button"
                  onClick={() => setC1Command(CameraCommand.setLookPositionToOrigin)}>
                  {'Look At Origin'}
                </button>{' '}
                <button className="control-button" onClick={() => setC1Command(CameraCommand.resetTransforms)}>
                  {'Reset'}
                </button>
              </p>
              <p>
                {'Standard views: '}
                <button className="control-button" onClick={() => setC1Command(CameraCommand.useStandardViewX)}>
                  {'X Axis'}
                </button>{' '}
                <button className="control-button" onClick={() => setC1Command(CameraCommand.useStandardViewY)}>
                  {'Y Axis'}
                </button>{' '}
                <button className="control-button" onClick={() => setC1Command(CameraCommand.useStandardViewZ)}>
                  {'Z Axis'}
                </button>
              </p>
            </div>

            <div className="body-text">
              <blockquote>
                <p>
                  {'Notice how the right-most column of M changes when you rotate the camera, '}
                  {"even if you don't change its position."}
                </p>
              </blockquote>
            </div>

            <h2 id="projection-recap" className="title-text">
              {'Projection (Recap)'}
            </h2>

            <div className="body-text">
              <p>
                {"If you've done the written component of HW3, you'd already have "}
                <strong>{'projected'}</strong>
                {' points in world space onto an image plane. '}
                {"If not, that's okay! We'll briefly recap the basic principles here :)"}
              </p>
              <p>
                {"Using camera 1 as an example, let's project the point located at "}
                <strong>
                  {`<${limitDpHelper(X.x)},\u00a0${limitDpHelper(X.y)},\u00a0${limitDpHelper(X.z)}>`}
                </strong>
                {' onto our image plane.'}
              </p>
            </div>

            <div className="matrix-equation">
              <Matrix33Display label={'intrinsic matrix, K'} matrix={K} />
              <span>{'*'}</span>
              <Matrix34Display label={'extrinsic matrix, M'} matrix={M} />
              <span>{'*'}</span>
              <Vector4Display label={'world coord, X'} vector={X} />
              <span>{'='}</span>
              <Vector3Display label={'result'} vector={result} />
              <span>{'='}</span>
              <span className="limit-dp">{limitDpHelper(result.z)}</span>
              <Vector3Display label={'image coord, x'} vector={x} className="blue" />
            </div>

            <div className="body-text">
              <p>
                {"This equation may seem scary, but it's lot simpler when you recall the steps for projection: "}
                <br />
                {'1. Multiply K * M * X to get a 3x1 result'}
                <br />
                {'2. Then, divide that result by its z component'}
                <br />
                {"3. Finally, the result's "}
                <strong className="blue">{'x and y values'}</strong>
                {" give the point's normalized* coordinates on the image plane."}
              </p>
              <p>
                {"Now that we've calculated where the point should be, let's see if our prediction is correct. "}
                {'Click the button below to show a '}
                <strong className="blue">{'marker'}</strong>
                {' on the image: '}
              </p>
              <p>
                <button
                  className="control-button"
                  onClick={() =>
                    setOtherThingsToShow((prev) => ({ ...prev, c1PointPrediction: !prev.c1PointPrediction }))
                  }>
                  {otherThingsToShow.c1PointPrediction
                    ? "Hide Camera 1's Point Prediction"
                    : "Show Camera 1's Point Prediction"}
                </button>
              </p>
            </div>

            <div className="body-text">
              <p>
                {'Try moving the camera around again! Or, click the button below to make the point '}
                {isMoving ? 'stop moving' : 'start moving'}
                {':'}
              </p>
              <p>
                <button className="control-button" onClick={() => setIsMoving((prev) => !prev)}>
                  {isMoving ? 'Stop Moving' : 'Start Moving'}
                </button>
              </p>
            </div>

            <div className="body-text">
              <blockquote>
                <p>
                  {'Think:  '}
                  {'why are x and y axes seemingly flipped / '}
                  {'why is <1,\u00a01> at the bottom left?'}
                  <br />
                  <br />
                  {'Hint 1:  '}
                  {'consider that, in our result, z is +1. '}
                  {'What does this mean about where the image plane is relative to the camera center?'}
                  <br />
                  <br />
                  {'Hint 2:  '}
                  {'have you ever been told that the images on your retinas (in your eyes) are "flipped"?'}
                </p>
              </blockquote>
            </div>

            <h2 id="introducing-camera-2" className="title-text">
              {'Introducing: Camera 2'}
            </h2>

            <div className="body-text">
              <p>
                {"Now that we're through the recaps, it's finally time to talk about "}
                <strong>{'stereo camera pairs'}</strong>
                {". For that, let's introduce "}
                <strong>{'camera 2'}</strong>
                {'!'}
              </p>
            </div>

            <div className="matrix-equation" ref={c2EquationRef}>
              <span>{'Camera 2 has'}</span>
              <Matrix33Display label={'intrinsic matrix, Kp'} matrix={Kp} />
              <span>{', '}</span>
              <Matrix34Display label={'extrinsic matrix, Mp'} matrix={Mp} />
              <span>{', and'}</span>
              <Vector3Display label={'position'} vector={c2Pos} />
            </div>

            <div className="body-text">
              <p>
                {'Just like we did with camera 1, we can project the point located at '}
                <strong>{`<${limitDpHelper(X.x)}, ${limitDpHelper(X.y)}, ${limitDpHelper(X.z)}>`}</strong>
                {" onto camera 2's image plane:"}
              </p>
            </div>

            <div className="matrix-equation">
              <Matrix33Display label={"intrinsic matrix, K'"} matrix={Kp} />
              <span>{'*'}</span>
              <Matrix34Display label={"extrinsic matrix, M'"} matrix={Mp} />
              <span>{'*'}</span>
              <Vector4Display label={'world coord, X'} vector={X} />
              <span>{'='}</span>
              <Vector3Display label={'result'} vector={resultp} />
              <span>{'='}</span>
              <span className="limit-dp">{limitDpHelper(resultp.z)}</span>
              <Vector3Display label={"image coord, x'"} vector={xp} className="green" />
            </div>

            <div className="body-text">
              <p>
                <button
                  className="control-button"
                  onClick={() =>
                    setOtherThingsToShow((prev) => ({ ...prev, c2PointPrediction: !prev.c2PointPrediction }))
                  }>
                  {otherThingsToShow.c2PointPrediction
                    ? "Hide Camera 2's Point Prediction"
                    : "Show Camera 2's Point Prediction"}
                </button>
              </p>
              <p>{'And, of course, we can also move camera 2 around:'}</p>
            </div>

            <div className="body-text">
              <p>
                <button
                  className="control-button"
                  onClick={() => setC2Command(CameraCommand.setRotationToIdentity)}>
                  {'Set Rotation To Identity'}
                </button>{' '}
                <button
                  className="control-button"
                  onClick={() => setC2Command(CameraCommand.setLookPositionToOrigin)}>
                  {'Look At Origin'}
                </button>{' '}
                <button className="control-button" onClick={() => setC2Command(CameraCommand.resetTransforms)}>
                  {'Reset'}
                </button>
              </p>
              <p>
                {'Standard views: '}
                <button className="control-button" onClick={() => setC2Command(CameraCommand.useStandardViewX)}>
                  {'X Axis'}
                </button>{' '}
                <button className="control-button" onClick={() => setC2Command(CameraCommand.useStandardViewY)}>
                  {'Y Axis'}
                </button>{' '}
                <button className="control-button" onClick={() => setC2Command(CameraCommand.useStandardViewZ)}>
                  {'Z Axis'}
                </button>
              </p>
            </div>

            <h2 id="camera-to-camera-transforms" className="title-text">
              {'Camera-to-Camera Transforms'}
            </h2>

            <div className="body-text">
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
              <Matrix44Display label={"M'"} matrix={Mp} />
              <span>{'*'}</span>
              <Matrix44Display label={'M\u207B\u00B9'} matrix={M_inv} />
              <span>{'='}</span>
              <Matrix44Display label={'camera 1 space to camera 2 space'} matrix={cam1ToCam2} />
            </div>

            <div className="body-text">
              <p>
                {"Next, let's break the above matrix apart. We define these parts as "}
                {' weird math expressions, but it will make more sense later!'}
              </p>
            </div>

            <div className="matrix-equation">
              <span>{' break '}</span>
              <Matrix44Display label={'camera 1 space to camera 2 space'} matrix={cam1ToCam2} />
              <span>{' into '}</span>
              <Matrix33Display label={'left side, defined as R\u1D40'} matrix={R} />
              <span>{' and '}</span>
              <Vector3Display label={'right side, defined as -(R\u1D40 * T)'} vector={minusRtT} />
            </div>

            <div className="matrix-equation">
              <span>{'From R\u1D40 and -(R\u1D40 * T), we can then get '}</span>
              <Matrix33Display label={'R'} matrix={R} />
              <span>{' and '}</span>
              <Vector3Display label={'T'} vector={T} />
            </div>

            <div className="body-text">
              <p>
                {'Think:  '}
                {'what exactly do '}
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

            <div className="body-text">
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
              <Matrix33Display label={'T_x'} matrix={T_x} />
            </div>
            <div className="matrix-equation">
              <span>{'Then multiply!: '}</span>
              <Matrix33Display label={'T_x'} matrix={T_x} />
              <span>{'*'}</span>
              <Matrix33Display label={'R'} matrix={R} />
              <span>{'='}</span>
              <Matrix33Display label={'E'} matrix={E} />
            </div>

            <div className="body-text">
              <p>
                {'The essential matrix is great for '}
                <strong>{'canonical cameras'}</strong>
                {', with K = identity, but we have non-canonical cameras here. So, we must instead get the '}
                <strong>{'fundamental matrix'}</strong>
                {':'}
              </p>
            </div>

            <div className="matrix-equation">
              <Matrix33Display label={'K\u207B\u1D40'} matrix={Kit} />
              <span>{'*'}</span>
              <Matrix33Display label={'E'} matrix={E} />
              <span>{'*'}</span>
              <Matrix33Display label={"K'\u207B\u00B9"} matrix={Kpi} />
              <span>{'='}</span>
              <Matrix33Display label={'F'} matrix={F} />
            </div>

            <div className="body-text">
              <p>
                {'And with that, we can finally make '}
                <strong>{'epipolar lines'}</strong>
                {'! '}
                {"Those are what I'm using to position the circles on the sides of the images above."}
              </p>
            </div>

            <div className="matrix-equation">
              <Matrix33Display label={'F'} matrix={F} />
              <span>{'*'}</span>
              <Vector3Display label={"x'"} vector={xp} className="green" />
              <span>{'='}</span>
              <Vector3Display label={'l'} vector={l} className="green all" />
            </div>

            <div className="matrix-equation">
              <Matrix33Display label={'F\u1D40'} matrix={Ft} />
              <span>{'*'}</span>
              <Vector3Display label={'x'} vector={x} className="blue" />
              <span>{'='}</span>
              <Vector3Display label={"l'"} vector={lp} className="blue all" />
            </div>

            <div className="body-text">
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
    </div>
  )
}

export default App
