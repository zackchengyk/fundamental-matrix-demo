import { useRef, useState } from 'react'
import '../css/App.scss'
import '../css/Matrix.scss'

import * as THREE from 'three'
import Matrix44Display from './matrixDisplay/Matrix44Display'
import Vector4Display from './matrixDisplay/Vector4Display'
import { CameraCommand, crossProductMatrixHelper, limitDpHelper, SceneCommand } from './common'
import Matrix33Display from './matrixDisplay/Matrix33Display'
import Vector3Display from './matrixDisplay/Vector3Display'
import Matrix34Display from './matrixDisplay/Matrix34Display'
import DemoWindow from './DemoWindow'
import useScrollWatcher from './useScrollWatcher'
import MatrixEquation from './matrixDisplay/MatrixEquation'

const proExample = new THREE.Matrix4().fromArray([
  // @ts-ignore
  'a', // @ts-ignore
  'e', // @ts-ignore
  'i',
  0, // @ts-ignore
  'b', // @ts-ignore
  'f', // @ts-ignore
  'j',
  0, // @ts-ignore
  'c', // @ts-ignore
  'g', // @ts-ignore
  'k',
  0, // @ts-ignore
  'd', // @ts-ignore
  'h', // @ts-ignore
  'l',
  0,
]) // @ts-ignore
const intExample = new THREE.Matrix3().fromArray(['fx', 0, 0, 's', 'fy', 0, 'u0', 'v0', 1])
const extExample = new THREE.Matrix4().fromArray([
  // @ts-ignore
  'r11', // @ts-ignore
  'r21', // @ts-ignore
  'r31',
  0, // @ts-ignore
  'r12', // @ts-ignore
  'r22', // @ts-ignore
  'r32',
  0, // @ts-ignore
  'r13', // @ts-ignore
  'r23', // @ts-ignore
  'r33',
  0, // @ts-ignore
  'tx', // @ts-ignore
  'ty', // @ts-ignore
  'tz',
  0,
])

export type OtherThingsToShow = {
  c1PointPrediction: boolean
  c2PointPrediction: boolean
  c1Frustum: boolean
  c2Frustum: boolean
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
  const R = new THREE.Matrix3().setFromMatrix4(cam1ToCam2)
  const T = new THREE.Vector3().setFromMatrixColumn(cam1ToCam2, 3)
  const T_x = crossProductMatrixHelper(T)

  // Essential Matrix (c1 to c2)
  const E = T_x.clone().multiply(R)

  // Fundamental Matrix (c1 to c2)
  const Ki = K.clone().invert()
  const Kpit = Kp.clone().invert().transpose()
  const F = Kpit.clone().multiply(E).multiply(Ki)

  // Fundamental Matrix (c2 to c1)
  const Ft = F.clone().transpose()

  // Lines
  const l = xp.clone().applyMatrix3(Ft)
  const lFunction = (x: number): number => (-l.z - l.x * x) / l.y
  const lp = x.clone().applyMatrix3(F)
  const lpFunction = (x: number): number => (-lp.z - lp.x * x) / lp.y

  const test = l.dot(x)
  const testp = lp.dot(xp)

  // States
  const scrollRef = useRef<any>()
  const options = { root: scrollRef.current, rootMargin: '0px', threshold: 1.0 }
  const [c1ScrollAppearRef, showC1Display] = useScrollWatcher(options)
  const [c2ScrollAppearRef, showC2Display] = useScrollWatcher(options)
  const [c3ScrollAppearRef, showC3Display] = useScrollWatcher(options)

  // Controls to interact with demo
  const [isMoving, setIsMoving] = useState<boolean>(false)
  const [otherThingsToShow, setOtherThingsToShow] = useState<OtherThingsToShow>({
    c1PointPrediction: false,
    c2PointPrediction: false,
    c1Frustum: false,
    c2Frustum: false,
    epipolarLines: false,
    epipolarLinePredictions: false,
  })
  const [sceneCommand, setSceneCommand] = useState<SceneCommand>(SceneCommand.nothing)
  const [c1Command, setC1Command] = useState<CameraCommand>(CameraCommand.nothing)
  const [c2Command, setC2Command] = useState<CameraCommand>(CameraCommand.nothing)
  const [c3Command, setC3Command] = useState<CameraCommand>(CameraCommand.nothing)

  // Phrasing
  const [generalPhrasing, setGeneralPhrasing] = useState<boolean>(false)
  const sourcePhraseA = generalPhrasing ? 'a source' : "c1's"
  const sourcePhrase = generalPhrasing ? 'the source' : "c1's"
  const destinationPhraseA = generalPhrasing ? 'a destination' : "c2's"
  const destinationPhrase = generalPhrasing ? 'the destination' : "c2's"

  // Dragging
  const appRef = useRef<HTMLDivElement>(null)
  const multiDragRef = {
    demoWindowRef: useRef<HTMLDivElement>(null),
    topRef: useRef<HTMLDivElement>(null),
    botRef: useRef<HTMLDivElement>(null),
  }
  const [isDraggingLR, setIsDraggingLR] = useState<boolean>(false)
  const [isDraggingTop, setIsDraggingTop] = useState<boolean>(false)
  const [isDraggingBot, setIsDraggingBot] = useState<boolean>(false)
  const [dragData, setDragData] = useState<[DOMRect, DOMRect, DOMRect] | null>(null)

  function changeCursor(cursor: string) {
    appRef.current!.style.cursor = cursor
  }
  function startDragLR() {
    if (!appRef.current) return
    setIsDraggingLR(true)
    changeCursor('ew-resize')
  }
  function startDragTop() {
    if (!multiDragRef.demoWindowRef.current || !multiDragRef.topRef.current || !multiDragRef.botRef.current) return
    setIsDraggingTop(true)
    setDragData([
      multiDragRef.demoWindowRef.current.getBoundingClientRect(),
      multiDragRef.topRef.current.getBoundingClientRect(),
      multiDragRef.botRef.current.getBoundingClientRect(),
    ])
    changeCursor('ns-resize')
  }
  function startDragBot() {
    if (!multiDragRef.demoWindowRef.current || !multiDragRef.topRef.current || !multiDragRef.botRef.current) return
    setIsDraggingBot(true)
    setDragData([
      multiDragRef.demoWindowRef.current.getBoundingClientRect(),
      multiDragRef.topRef.current.getBoundingClientRect(),
      multiDragRef.botRef.current.getBoundingClientRect(),
    ])
    changeCursor('ns-resize')
  }
  function endDrag() {
    setIsDraggingLR(false)
    setIsDraggingTop(false)
    setIsDraggingBot(false)
    setDragData(null)
    changeCursor('auto')
  }

  function onDrag(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (isDraggingLR && appRef.current) {
      // ==
      e.preventDefault()
      const app = appRef.current
      const appRect = app.getBoundingClientRect()
      // Hardcoded magic numbers:
      // - 15px is the $gap between panels, and 7 + 8 = 15
      // - 20px is the $smaller-gap from the edge of the browser viewport
      const leftWidth = e.clientX - 7 - appRect.left
      const rightWidth = appRect.right - e.clientX - 8
      const newGridTemplateColumns = `${leftWidth}fr 15px ${rightWidth}fr`
      app.style.gridTemplateColumns = newGridTemplateColumns
      return
    }

    if (
      (isDraggingTop || isDraggingBot) &&
      multiDragRef.demoWindowRef.current &&
      multiDragRef.topRef.current &&
      multiDragRef.botRef.current &&
      dragData
    ) {
      // ==
      e.preventDefault()
      // Hardcoded magic numbers:
      // - 15px is the $smaller-gap between panels, and 7 + 8 = 15
      // - 20px is the $gap from the edge of the browser viewport
      let topHeight = Math.max(isDraggingTop ? e.clientY - 7 - dragData[0].top : dragData[1].height, 2)
      let botHeight = Math.max(isDraggingTop ? dragData[2].height : dragData[0].bottom - e.clientY - 8, 2)
      let midHeight = dragData[0].height - topHeight - botHeight - 30
      if (midHeight < 2) {
        midHeight = 2
        if (isDraggingTop) {
          topHeight = dragData[0].height - botHeight - 32
        } else {
          botHeight = dragData[0].height - topHeight - 32
        }
      }
      const newGridTemplateRows = `${topHeight}fr 15px ${midHeight}fr 15px ${botHeight}fr`
      multiDragRef.demoWindowRef.current.style.gridTemplateRows = newGridTemplateRows
      return
    }
  }

  return (
    <div className="App" ref={appRef} onMouseUp={endDrag} onMouseLeave={endDrag} onMouseMove={onDrag}>
      <DemoWindow
        ref={multiDragRef}
        startDragTop={startDragTop}
        startDragBot={startDragBot}
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
          showC3Display,
          otherThingsToShow,
          // Control function triggers
          sceneCommand,
          setSceneCommand,
          c1Command,
          setC1Command,
          c2Command,
          setC2Command,
          c3Command,
          setC3Command,
        }}
      />

      <div id="ew-resize-bar" onMouseDown={startDragLR} />

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

            <MatrixEquation>
              <Matrix34Display label={'projection matrix'} matrix={proExample} />
              <span className="big">{'='}</span>
              <Matrix33Display label={'intrinsic matrix'} matrix={intExample} />
              <span>{'*'}</span>
              <Matrix34Display label={'extrinsic matrix'} matrix={extExample} />
            </MatrixEquation>

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
            </div>

            <div className="body-text">
              <blockquote>
                <p>
                  {'Think:  '}
                  {"using only the extrinsic matrix, can you determine the camera's "}
                  {'position in world space? If yes, how?'}
                </p>
                <p>
                  {'Hint:  '}
                  {"it's not <tx,\u00a0ty,\u00a0tz>."}
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

            <MatrixEquation ref={c1ScrollAppearRef}>
              <span>{'Camera 1 has'}</span>
              <Matrix33Display label={'intrinsic matrix, K'} matrix={K} />
              <span>{', '}</span>
              <Matrix34Display label={'extrinsic matrix, M'} matrix={M} />
              <span>{', and'}</span>
              <Vector3Display label={'position'} vector={c1Pos} />
            </MatrixEquation>

            <div className="body-text">
              <p>
                {'Move the camera, and see how its intrinsic and extrinsic matrices change. '}
                {'You can click and drag with the left mouse button to rotate, click and drag '}
                {'with the right mouse button to pan, scroll to zoom, or click any of these '}
                {" buttons (they're a bit finicky, so you might have to click more than once):"}
              </p>
              <div>
                <button
                  className="control-button"
                  onClick={() => setC1Command(CameraCommand.setRotationToIdentity)}>
                  {'Set Rotation To Identity'}
                </button>
                <button
                  className="control-button"
                  onClick={() => setC1Command(CameraCommand.setLookPositionToOrigin)}>
                  {'Look At Origin'}
                </button>
                <button className="control-button" onClick={() => setC1Command(CameraCommand.resetTransforms)}>
                  {'Reset'}
                </button>
              </div>
              <div>
                {'Standard views: '}
                <button className="control-button" onClick={() => setC1Command(CameraCommand.useStandardViewX)}>
                  {'X Axis'}
                </button>
                <button className="control-button" onClick={() => setC1Command(CameraCommand.useStandardViewY)}>
                  {'Y Axis'}
                </button>
                <button className="control-button" onClick={() => setC1Command(CameraCommand.useStandardViewZ)}>
                  {'Z Axis'}
                </button>
              </div>
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
                {"If you've done part of the written component of HW3, you might already have "}
                <strong>{'projected'}</strong>
                {' 3D points in world space onto a 2D image plane. '}
                {"If not, that's okay! We'll briefly recap the basic principles here :)"}
              </p>
              <p>
                {"Using camera 1 as an example, let's project the 3D point located at "}
                <strong>
                  {`<${limitDpHelper(X.x)},\u00a0${limitDpHelper(X.y)},\u00a0${limitDpHelper(X.z)}>`}
                </strong>
                {' onto our image plane.'}
              </p>
            </div>

            <MatrixEquation>
              <Matrix33Display label={'intrinsic matrix, K'} matrix={K} />
              <span>{'*'}</span>
              <Matrix34Display label={'extrinsic matrix, M'} matrix={M} />
              <span>{'*'}</span>
              <Vector4Display label={'world coord, X'} vector={X} />
              <span className="big">{'='}</span>
              <Vector3Display label={'result'} vector={result} />
              <span className="big">{'='}</span>
              <span className="limit-dp">{limitDpHelper(result.z)}</span>
              <Vector3Display label={'image coord, x'} vector={x} className="blue" />
            </MatrixEquation>

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
                {" give the point's normalized 2D image coordinates."}
              </p>
              <p>
                {"Now that we've calculated where the point should appear on the image plane, "}
                {"let's see if our prediction is correct. Click the button below to show a "}
                <strong className="blue">{'marker'}</strong>
                {' on the image: '}
              </p>
              <div>
                <button
                  className="control-button"
                  onClick={() =>
                    setOtherThingsToShow((prev) => ({ ...prev, c1PointPrediction: !prev.c1PointPrediction }))
                  }>
                  {otherThingsToShow.c1PointPrediction
                    ? "Hide Camera 1's Point Prediction"
                    : "Show Camera 1's Point Prediction"}
                </button>
              </div>
            </div>

            <div className="body-text">
              <p>
                {'Try moving the camera around again! Or, click the button below to make the 3D point '}
                {isMoving ? 'stop moving' : 'start moving'}
                {':'}
              </p>
              <div>
                <button className="control-button" onClick={() => setIsMoving((prev) => !prev)}>
                  {isMoving ? 'Stop Moving' : 'Start Moving'}
                </button>
              </div>
            </div>

            <div className="body-text">
              <blockquote>
                <p>
                  {'Think:  '}
                  {'why are x and y axes flipped, resulting in <1,\u00a01> being at the bottom left?'}
                </p>
                <p>
                  {'Hint 1:  '}
                  {'in our '}
                  <em>{'result'}</em>
                  {', z is +1. If the camera looks in the \u2011z direction, '}
                  {'where is the image plane relative to the camera center?'}
                </p>
                <p>
                  {'Hint 2:  '}
                  {'have you ever been told that the images on your retinas (in your eyes) are "inverted"?'}
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

            <MatrixEquation ref={c2ScrollAppearRef}>
              <span>{'Camera 2 has'}</span>
              <Matrix33Display label={'intrinsic matrix, Kp'} matrix={Kp} />
              <span>{', '}</span>
              <Matrix34Display label={'extrinsic matrix, Mp'} matrix={Mp} />
              <span>{', and'}</span>
              <Vector3Display label={'position'} vector={c2Pos} />
            </MatrixEquation>

            <div className="body-text">
              <p>
                {'Just like we did with camera 1, we can project the 3D point located at '}
                <strong>{`<${limitDpHelper(X.x)},\u00a0${limitDpHelper(X.y)},\u00a0${limitDpHelper(
                  X.z
                )}>`}</strong>
                {" onto camera 2's image plane:"}
              </p>
            </div>

            <MatrixEquation>
              <Matrix33Display label={"intrinsic matrix, K'"} matrix={Kp} />
              <span>{'*'}</span>
              <Matrix34Display label={"extrinsic matrix, M'"} matrix={Mp} />
              <span>{'*'}</span>
              <Vector4Display label={'world coord, X'} vector={X} />
              <span className="big">{'='}</span>
              <Vector3Display label={'result'} vector={resultp} />
              <span className="big">{'='}</span>
              <span className="limit-dp">{limitDpHelper(resultp.z)}</span>
              <Vector3Display label={"image coord, x'"} vector={xp} className="green" />
            </MatrixEquation>

            <div className="body-text">
              <div>
                <button
                  className="control-button"
                  onClick={() =>
                    setOtherThingsToShow((prev) => ({ ...prev, c2PointPrediction: !prev.c2PointPrediction }))
                  }>
                  {otherThingsToShow.c2PointPrediction
                    ? "Hide Camera 2's Point Prediction"
                    : "Show Camera 2's Point Prediction"}
                </button>
              </div>
              <p>{'And, of course, we can also move camera 2 around:'}</p>
            </div>

            <div className="body-text">
              <div>
                <button
                  className="control-button"
                  onClick={() => setC2Command(CameraCommand.setRotationToIdentity)}>
                  {'Set Rotation To Identity'}
                </button>
                <button
                  className="control-button"
                  onClick={() => setC2Command(CameraCommand.setLookPositionToOrigin)}>
                  {'Look At Origin'}
                </button>
                <button className="control-button" onClick={() => setC2Command(CameraCommand.resetTransforms)}>
                  {'Reset'}
                </button>
              </div>
              <div>
                {'Standard views: '}
                <button className="control-button" onClick={() => setC2Command(CameraCommand.useStandardViewX)}>
                  {'X Axis'}
                </button>
                <button className="control-button" onClick={() => setC2Command(CameraCommand.useStandardViewY)}>
                  {'Y Axis'}
                </button>
                <button className="control-button" onClick={() => setC2Command(CameraCommand.useStandardViewZ)}>
                  {'Z Axis'}
                </button>
              </div>
            </div>

            <h2 id="stereo-camera-pair" className="title-text">
              {'Getting To Know Our Stereo Camera Pair'}
            </h2>

            <div className="body-text">
              <p ref={c3ScrollAppearRef}>
                {"Surprise! Here's yet "}
                <em>{'another'}</em>
                {' camera. '}
              </p>
              <p>
                {"Don't worry, this one's just for reference (we'll call it the "}
                <strong>{'witness camera'}</strong>
                {"); we won't use it in any calculations or anything."}
              </p>
              <p>{"Instead, we'll use it to take a look at what our cameras can see:"}</p>
              <div>
                <button
                  className="control-button"
                  onClick={() => setOtherThingsToShow((prev) => ({ ...prev, c1Frustum: !prev.c1Frustum }))}>
                  {otherThingsToShow.c1Frustum ? "Hide Camera 1's Frustum" : "Show Camera 1's Frustum"}
                </button>
                <button
                  className="control-button"
                  onClick={() => setOtherThingsToShow((prev) => ({ ...prev, c2Frustum: !prev.c2Frustum }))}>
                  {otherThingsToShow.c2Frustum ? "Hide Camera 2's Frustum" : "Show Camera 2's Frustum"}
                </button>
              </div>
              <p>
                {"(You don't have to know this for CSCI 1430, but a camera's "}
                <strong>{'frustum'}</strong>
                {' is the shape which contains the region of space the camera can see)'}
              </p>
              <p>{"Before we move on, here's a reset button just in case:"}</p>
              <div>
                <button className="control-button" onClick={() => setC3Command(CameraCommand.resetTransforms)}>
                  {'Reset Witness Camera'}
                </button>
              </div>
            </div>

            <h2 id="camera-space-to-camera-space-transforms-prelude" className="title-text">
              {'Camera-Space to Camera-Space Transforms (Prelude)'}
            </h2>

            <div className="body-text">
              <blockquote>
                <p>
                  {'Think:  '}
                  {"we've seen that can map a 3D world point to a 2D image point on a camera's image "}
                  {'plane; but is it possible to map a 2D image point on one camera to a 2D image point '}
                  {'on another? Why or why not? '}
                </p>
                <p>
                  {'Hint:  '}
                  {'is a 3D-to-2D mapping reversible?'}
                </p>
              </blockquote>
            </div>

            <div className="body-text">
              <p>
                {'Since '}
                <strong>{'epipolar geometry'}</strong>
                {' is all about the relationship between two cameras,'}
                {' we typically begin by finding the '}
                <strong>{'relative transformation'}</strong>
                {" from c1's space to c2's space."}
              </p>
              <p>
                <em>
                  <strong>{'But wait:'}</strong>
                </em>
                {' what does a camera\'s "space" even mean, anyway? '}
              </p>
            </div>

            <h2 id="camera-spaces" className="title-text">
              {'Camera Spaces'}
            </h2>

            <div className="body-text">
              <p>
                {'Recall that '}
                <a href="#projection-recap">{'when we talked about 2D image coordinates'}</a>
                {', we used '}
                <strong className="blue">{'x and y'}</strong>
                {', and fixed z\u00a0=\u00a01, which just meant "it\'s on the image plane". '}
                <em>{"But who's to say we can't have coordinates where z\u00a0≠\u00a01?"}</em>
              </p>
              <p>
                {"Here's c1's projection equation again, but only its first step (M\u00a0*\u00a0X). "}
                {'Here are also some controls for the 3D world point:'}
              </p>
              <div>
                <button
                  className="control-button"
                  onClick={() => {
                    setIsMoving(false)
                    setSceneCommand(SceneCommand.setPointToOrigin)
                  }}>
                  {'Set Point To Origin'}
                </button>
                <button className="control-button" onClick={() => setIsMoving((prev) => !prev)}>
                  {isMoving ? 'Stop Moving' : 'Start Moving'}
                </button>
              </div>
              <p>{'...as well as for camera 1:'}</p>
              <div>
                <button
                  className="control-button"
                  onClick={() => setC1Command(CameraCommand.setRotationToIdentity)}>
                  {"Set c1's Rotation To Identity"}
                </button>
                <button
                  className="control-button"
                  onClick={() => setC1Command(CameraCommand.setLookPositionToOrigin)}>
                  {'Point c1 At Origin'}
                </button>
                <button className="control-button" onClick={() => setC1Command(CameraCommand.resetTransforms)}>
                  {'Reset c1'}
                </button>
              </div>
              <div>
                {'Standard views: '}
                <button className="control-button" onClick={() => setC1Command(CameraCommand.useStandardViewX)}>
                  {'X Axis'}
                </button>
                <button className="control-button" onClick={() => setC1Command(CameraCommand.useStandardViewY)}>
                  {'Y Axis'}
                </button>
                <button className="control-button" onClick={() => setC1Command(CameraCommand.useStandardViewZ)}>
                  {'Z Axis'}
                </button>
              </div>
            </div>

            <MatrixEquation>
              <Matrix33Display label={'intrinsic matrix, K'} matrix={K} />
              <span>{'*'}</span>
              <Matrix34Display label={'extrinsic matrix, M'} matrix={M} className="blue last" />
              <span>{'*'}</span>
              <Vector4Display label={'world coord, X'} vector={X} />
              <span className="big">{'='}</span>
              <Matrix33Display label={'intrinsic matrix, K'} matrix={K} />
              <span>{'*'}</span>
              <Vector3Display label={'M * X'} vector={MX} className="blue all" />
            </MatrixEquation>

            <div className="body-text">
              <blockquote>
                <p>
                  {'Think:  '}
                  {'what does the right-most column of the extrinsic matrix (M) represent, '}
                  {'in terms of the camera\'s "space"?'}
                </p>
                <p>
                  {'Hint:  '}
                  {'did you try setting the point to the '}
                  <em>{'origin'}</em>
                  {'?'}
                </p>
              </blockquote>
            </div>

            <div className="body-text">
              <p>
                {'Just this once, we\'re going to give you the answer to a "think" question: '}
                {'the right-most column represents the position of the '}
                <strong>{'world-space origin'}</strong>
                {' in '}
                <strong>{'camera space'}</strong>
                {'.'}
              </p>
              <p>
                {'In fact, that relates to the whole '}
                <em>{'point'}</em>
                {' of the '}
                <strong>{'extrinsic matrix'}</strong>
                {': it takes a '}
                <strong>{'3D'}</strong>
                {' point in world space and maps it to a corresponding '}
                <strong>{'3D'}</strong>
                {' point '}
                <strong>{'in camera space'}</strong>
                {'.'}
              </p>
            </div>

            <div className="body-text">
              <blockquote>
                <p>
                  {'By the way, since an extrinsic matrix is just a rotation and a translation, it is '}
                  <em>
                    <strong>{'invertible'}</strong>
                  </em>
                  {'.'}
                </p>
                <p>
                  {"However, this doesn't mean that "}
                  <em>
                    <strong>{'projection'}</strong>
                  </em>
                  {' is invertible! Recall that you divide '}
                  {'by z, and then toss that value away. That information is gone, so z could have been '}
                  {'anything: this corresponds to any location along the '}
                  <strong>{'ray'}</strong>
                  {' going from the camera to the point.'}
                </p>
              </blockquote>
            </div>

            <div className="body-text">
              <p>
                {'This was all you needed to know about coordinate spaces for CSCI 1430. '}
                {"Now, we're ready to talk about "}
                <strong>{'camera-space to camera-space transforms'}</strong>
                {'.'}
              </p>
            </div>

            <h2 id="camera-space-to-camera-space-transforms" className="title-text">
              {'Camera-Space to Camera-Space Transforms'}
            </h2>

            <div className="body-text">
              <p>
                {'As we just discussed, a 3D world-space coordinate X can be mapped to a '}
                {'3D camera-space coordinate by left-multiplying it by M:'}
              </p>
            </div>

            <MatrixEquation initialCollapse={true}>
              <Matrix34Display label={'M'} matrix={M} className="blue last" />
              <span>{'*'}</span>
              <Vector4Display label={'X'} vector={X} />
              <span className="big">{'='}</span>
              <Vector3Display label={'camera 1 space coord'} vector={MX} className="blue all" />
            </MatrixEquation>

            <div className="body-text">
              <p>
                {'We want to rearrange this so that X is on the left-hand side. '}
                {'To do this, we will pretend that M is a '}
                <strong>{'square matrix'}</strong>
                {' with [0,\u00a00,\u00a00,\u00a01] on the bottom row, so that we can take its '}
                <em>
                  <strong>{'inverse'}</strong>
                </em>
                {'.'}
              </p>
            </div>

            <MatrixEquation initialCollapse={true}>
              <Matrix34Display label={'M (3 x 4)'} matrix={M} />
              <span className="big">{'→'}</span>
              <Matrix44Display label={'M (4 x 4)'} matrix={M} />
              <span className="big">{'→'}</span>
              <Matrix44Display label={'inverse of extrinsic matrix, M\u207B\u00B9'} matrix={M_inv} />
            </MatrixEquation>

            <div className="body-text">
              <p>
                {"We'll also have to "}
                <strong>{'homogenize'}</strong>
                {' the camera space coordinate, by sticking a 1 on the bottom. '}
                {'Then, we can rearrange the earlier equation:'}
              </p>
            </div>

            <MatrixEquation initialCollapse={true}>
              <Vector4Display label={'X'} vector={X} />
              <span className="big">{'='}</span>
              <Matrix44Display label={'M\u207B\u00B9'} matrix={M_inv} />
              <span>{'*'}</span>
              <Vector4Display label={'camera 1 space coord'} vector={MX} className="blue all" />
            </MatrixEquation>

            <div className="body-text">
              <p>
                {'Now, if we want to get to '}
                <strong>{"camera 2's"}</strong>
                {' space, we can just left-multiply by '}
                <strong>
                  <em>{'its'}</em>
                  {" extrinsic matrix, M'"}
                </strong>
                {"! (Note that we have to do the same trick to make M' 4\u00a0x\u00a04):"}
              </p>
            </div>

            <MatrixEquation initialCollapse={true}>
              <Vector4Display label={'camera 2 space coord'} vector={MpX} className="green all" />
              <span className="big">{'='}</span>
              <Matrix44Display label={"M'"} matrix={Mp} />
              <span>{'*'}</span>
              <Matrix44Display label={'M\u207B\u00B9'} matrix={M_inv} />
              <span>{'*'}</span>
              <Vector4Display label={'camera 1 space coord'} vector={MX} className="blue all" />
            </MatrixEquation>

            <div className="body-text">
              <p>{"Finally, to make our lives easier, we can combine M' * M\u207B\u00B9 into a single matrix:"}</p>
            </div>

            <MatrixEquation>
              <Matrix44Display label={"M'"} matrix={Mp} />
              <span>{'*'}</span>
              <Matrix44Display label={'M\u207B\u00B9'} matrix={M_inv} />
              <span className="big">{'='}</span>
              <Matrix44Display label={'camera 1 space to camera 2 space'} matrix={cam1ToCam2} />
            </MatrixEquation>

            <div className="body-text">
              <p>
                {"As always, you're "}
                <em>{'highly'}</em>
                {' encouraged to mess around with the positions of c1 and c2'}
                {'. Watch how the above matrix changes!'}
              </p>
              <div>
                <button
                  className="control-button"
                  onClick={() => setC1Command(CameraCommand.setRotationToMatchC2)}>
                  {'Rotate c1 to match c2'}
                </button>
                <button
                  className="control-button"
                  onClick={() => setC1Command(CameraCommand.setPositionToMatchC2)}>
                  {'Translate c1 to match c2'}
                </button>
                <button className="control-button" onClick={() => setC1Command(CameraCommand.resetTransforms)}>
                  {'Reset c1'}
                </button>
              </div>
              <div>
                <button
                  className="control-button"
                  onClick={() => setC2Command(CameraCommand.setRotationToMatchC1)}>
                  {'Rotate c2 to match c1'}
                </button>
                <button
                  className="control-button"
                  onClick={() => setC2Command(CameraCommand.setPositionToMatchC1)}>
                  {'Translate c2 to match c1'}
                </button>
                <button className="control-button" onClick={() => setC2Command(CameraCommand.resetTransforms)}>
                  {'Reset c2'}
                </button>
              </div>
            </div>

            <h2 id="relative-rotation-and-translation" className="title-text">
              {'Relative Rotation And Translation'}
            </h2>

            <div className="body-text">
              <p>
                {'Like all coordinate transforms (mappings from one "space" to another), '}
                {'the above matrix is really just a rotation combined with a translation. '}
              </p>
              <p>{"Let's try to break it apart, since we'll need the pieces later:"}</p>
            </div>

            <MatrixEquation>
              <span>{'Break'}</span>
              <Matrix44Display label={'c1 space to c2 space'} matrix={cam1ToCam2} />
              <span>{'into'}</span>
              <Matrix33Display label={'some kind of rotation, R'} matrix={R} className="brown all" />
              <span>{'and'}</span>
              <Vector3Display label={'some kind of translation, T'} vector={T} />
            </MatrixEquation>

            <div className="body-text">
              <p className="brown">
                <em>{'What does the thing on the left, R, mean?'}</em>
              </p>
              <p>
                {'We can find out by giving both cameras the same position, but different '}
                {'rotations (you may have to click a few times):'}
              </p>
              <div>
                <button
                  className="control-button"
                  onClick={() => setC1Command(CameraCommand.setPositionToMatchC2)}>
                  {'Translate c1 to match c2'}
                </button>
                <button
                  className="control-button"
                  onClick={() => setC1Command(CameraCommand.setRotationToIdentity)}>
                  {"Set c1's Rotation To Identity"}
                </button>
                <button className="control-button" onClick={() => setC1Command(CameraCommand.resetTransforms)}>
                  {'Reset c1'}
                </button>
              </div>
            </div>

            <MatrixEquation>
              <span>{'Remember these guys? '}</span>
              <Matrix34Display label={"camera 1's extrinsic matrix, M"} matrix={M} className="brown left" />
              <span>{'and'}</span>
              <Matrix34Display label={"camera 2's extrinsic matrix, M'"} matrix={Mp} className="brown left" />
            </MatrixEquation>

            <div className="body-text">
              <p>
                {"Observe that R is equal to the rotation part of M' when M has no rotation! "}
                {'From this, we might guess that R is '}
                <span className="brown">
                  {"a rotation which takes c1's direction and rotates it to match c2's"}
                </span>
                {". Let's give it a proper label:"}
              </p>
            </div>

            <MatrixEquation>
              <span>{'Break'}</span>
              <Matrix44Display label={'c1 space to c2 space'} matrix={cam1ToCam2} />
              <span>{'into'}</span>
              <Matrix33Display label={'c1 space to c2 space rotation, R'} matrix={R} className="brown label" />
              <span>{'and'}</span>
              <Vector3Display label={'some kind of translation, T'} vector={T} className="purple all" />
            </MatrixEquation>

            <div className="body-text">
              <p className="purple">
                <em>{'Now, what does the thing on the right, T, mean?'}</em>
              </p>
              <p>
                {'To figure this one out, '}
                <strong>{'note'}</strong>
                {" T's value. Then, rotate c1:"}
              </p>
              <div>
                <button
                  className="control-button"
                  onClick={() => setC1Command(CameraCommand.setRotationToMatchC2)}>
                  {'Rotate c1 to match c2'}
                </button>
                <button
                  className="control-button"
                  onClick={() => setC1Command(CameraCommand.setPositionToMatchC2)}>
                  {'Translate c1 to match c2'}
                </button>
              </div>
              <p>
                {'Did T change when you rotated c1? (Probably not!). '}
                {'Reset, and this time, try rotating c2 instead:'}
              </p>
              <div>
                <button className="control-button" onClick={() => setC1Command(CameraCommand.resetTransforms)}>
                  {'Reset c1'}
                </button>
                <button className="control-button" onClick={() => setC2Command(CameraCommand.resetTransforms)}>
                  {'Reset c2'}
                </button>
              </div>
              <div>
                <button
                  className="control-button"
                  onClick={() => setC2Command(CameraCommand.setRotationToMatchC1)}>
                  {'Rotate c2 to match c1'}
                </button>
                <button
                  className="control-button"
                  onClick={() => setC1Command(CameraCommand.setPositionToMatchC2)}>
                  {'Translate c1 to match c2'}
                </button>
              </div>
              <p>{'Did T change when you rotated c2? (Probably!).'}</p>
              <p>
                {"As you've probably already guessed, T is "}
                <span className="purple">{'a translation which takes c1 and moves it to c2. '}</span>
                {"However, you might've also caught on to something more subtle: "}
                <em className="purple">{"T is defined in camera 2's space!"}</em>
              </p>
              <p>{'We can now give T a proper label, too:'}</p>
            </div>

            <MatrixEquation>
              <span>{'Break'}</span>
              <Matrix44Display label={'c1 space to c2 space'} matrix={cam1ToCam2} />
              <span>{'into'}</span>
              <Matrix33Display label={'c1 space to c2 space rotation, R'} matrix={R} className="brown all label" />
              <span>{'and'}</span>
              <Vector3Display
                label={'c1 space to c2 space translation (in c2 space), T'}
                vector={T}
                className="purple all label"
              />
            </MatrixEquation>

            <h2 id="uh-what-just-happened" className="title-text">
              {'Uh, What Just Happened?'}
            </h2>

            <div className="body-text">
              <p>
                {'We just figured out that, given a transform which maps 3D coordinates in '}
                <strong>{sourcePhraseA}</strong>
                {' space to 3D coordinates in '}
                <strong>{destinationPhraseA}</strong>
                {' space, we can break it into understandable pieces. '}
              </p>
              <p>
                {'Specifically, we can extract a '}
                <span className="brown">
                  {'rotation from '}
                  <strong>{sourcePhrase}</strong>
                  {' space to '}
                  <strong>{destinationPhrase}</strong>
                  {' space, R'}
                </span>
                {', and a '}
                <span className="purple">
                  {'translation from '}
                  <strong>{sourcePhrase}</strong>
                  {' space to '}
                  <strong>{destinationPhrase}</strong>
                  {' space, in '}
                  <strong>{destinationPhrase}</strong>
                  {' space, T'}
                </span>
                {'.'}
              </p>
              <div>
                <button className="control-button" onClick={() => setGeneralPhrasing((prev) => !prev)}>
                  {'Say that again, but more ' + (generalPhrasing ? 'specifically' : 'generally')}
                </button>
              </div>
              <p>
                {"If you're lost, don't worry, it took "}
                <em>{'us'}</em>
                {' >20h to figure this out 😅. '}
                {"The good news, though, is that we're on the home stretch!"}
              </p>
            </div>

            <h2 id="the-essential-matrix" className="title-text">
              {'The Essential Matrix'}
            </h2>

            <div className="body-text">
              <p>
                {'As a matter of fact, once you have '}
                <strong className="brown">{'R'}</strong>
                {' and '}
                <strong className="purple">{'T'}</strong>
                {', we can make the '}
                <strong>{'essential matrix'}</strong>
                {' just by following a simple recipe:'}
              </p>
            </div>

            <MatrixEquation>
              <span>{'First, convert T into its "cross-product matrix form": '}</span>
              <Vector3Display label={'T'} vector={T} className="purple all label" />
              <span>{'→'}</span>
              <Matrix33Display label={'T_x'} matrix={T_x} className="purple all label" />
            </MatrixEquation>

            <MatrixEquation>
              <span>{'Then multiply!: '}</span>
              <Matrix33Display label={'T_x'} matrix={T_x} className="purple all label" />
              <span>{'*'}</span>
              <Matrix33Display label={'R'} matrix={R} className="brown all label" />
              <span className="big">{'='}</span>
              <Matrix33Display label={'E'} matrix={E} />
            </MatrixEquation>

            <div className="body-text">
              <p>
                {"Great! Let's recap:"}
                <br />
                {"- We took M and M'"}
                <br />
                {'- Calculated a c1 space to c2 space transform'}
                <br />
                {'- Broke it apart to get R and T'}
                <br />
                {'- And finally calculated our essential matrix'}
              </p>
              <p>{"We're done here, right?"}</p>
              <p>{'Right?'}</p>
            </div>

            <h2 id="the-fundamental-matrix" className="title-text">
              {'The Fundamental Matrix'}
            </h2>

            <div className="body-text">
              <p>{"There's good news and bad news."}</p>
              <p>
                {"The bad news is that we haven't considered our "}
                <strong>{"intrinsic matrices, K and K'"}</strong>
                {'. Since all we have are normalized image coordinates, we need to '}
                {'"un-normalize" them, undoing the last multiplication-by-K in the '}
                {'projection equation (repeated here):'}
              </p>
            </div>

            <MatrixEquation>
              <Matrix33Display label={'intrinsic matrix, K'} matrix={K} />
              <span>{'*'}</span>
              <Matrix34Display label={'extrinsic matrix, M'} matrix={M} />
              <span>{'*'}</span>
              <Vector4Display label={'world coord, X'} vector={X} />
              <span className="big">{'='}</span>
              <Vector3Display label={'result'} vector={result} />
              <span className="big">{'='}</span>
              <span className="limit-dp">{limitDpHelper(result.z)}</span>
              <Vector3Display label={'image coord, x'} vector={x} className="blue" />
            </MatrixEquation>

            <div className="body-text">
              <p>
                {'We '}
                <em>{'could'}</em>
                {' do this for every normalized image coordinate we use. However, that would be a pain. '}
              </p>
              <p>
                {'Instead, we can "sandwich" the essential matrix with the '}
                <strong>{'inverses'}</strong>
                {' of the intrinsic matrices, to make a '}
                <strong>{'fundamental matrix'}</strong>
                {'.'}
              </p>
            </div>

            <MatrixEquation>
              <Matrix33Display label={"transpose of the inverse of K', aka K'\u207B\u1D40"} matrix={Kpit} />
              <span>{'*'}</span>
              <Matrix33Display label={'E'} matrix={E} />
              <span>{'*'}</span>
              <Matrix33Display label={'the inverse of K, aka K\u207B\u00B9'} matrix={Ki} />
              <span className="big">{'='}</span>
              <Matrix33Display label={'F'} matrix={F} />
            </MatrixEquation>

            <div className="body-text">
              <blockquote>
                <p>
                  {
                    "Aside: we just skipped over that, but note the placements of K and K'. Back when we calculated "
                  }
                  <strong>{'c1 space to c2 space'}</strong>
                  {', we assumed a certain "direction" in our transform, which affected R and T, and thus E.'}
                </p>
                <p>
                  {'Since '}
                  <strong>{"c1's"}</strong>
                  {' space is the "'}
                  <strong>{'input'}</strong>
                  {'", we should apply our E to that; '}
                  {"therefore, c1's intrinsic matrix K (rather, its inverse) must be on the "}
                  <strong>{'right'}</strong>
                  {' side. '}
                </p>
                <p>
                  {'Conversely, '}
                  <strong>{"c2's"}</strong>
                  {" intrinsic matrix K' (again, its inverse, then transpose, because of "}
                  {'matrix multiplication rules) must be on the '}
                  <strong>{'left'}</strong>
                  {' side.'}
                </p>
              </blockquote>
            </div>

            <div className="body-text">
              <p>
                {'We now have our '}
                <strong>{'fundamental matrix'}</strong>
                {"! Let's test it out :)"}
              </p>
            </div>

            <h2 id="epipolar-lines" className="title-text">
              {'Epipolar Lines'}
            </h2>

            <div className="body-text">
              <p>
                {"We've seen "}
                <a href="#projection-recap">
                  {'matrices that map '}
                  <em>{'3D world coordinates'}</em>
                  {' to '}
                  <em>{'2D image coordinates'}</em>
                </a>
                {'.'}
              </p>
              <p>
                {"We've also seen "}
                <a href="#camera-space-to-camera-space-transforms">
                  {'matrices that map '}
                  <em>{'3D coordinates in one space'}</em>
                  {' to '}
                  <em>{'3D coordinates in a different space'}</em>
                </a>
                {'.'}
              </p>
              <p>
                {'Compared to those, the essential and fundamental matrices are actually '}
                {'pretty unique: they map '}
                <strong>{"points on one camera's image plane"}</strong>
                {' to '}
                <strong>
                  <em>{'lines'}</em>
                  {" on another camera's image plane!"}
                </strong>
              </p>
              <p>
                {'These lines are known as '}
                <strong>{'epipolar lines'}</strong>
                {', and they represent the places where a 2D point (on '}
                <em>{'our'}</em>
                {" camera's image plane) corresponding to a 2D point (on "}
                <em>{'the other'}</em>
                {" camera's image plane) can be found."}
              </p>
              <p>
                {'For a different perspective, an epipolar line can also be considered to be the '}
                <strong>{'projection'}</strong>
                {" of the line going through the other camera's center and the object, onto our "}
                {'camera\'s image plane. Try enabling these "lines of sight" below:'}
              </p>
              <div>
                <button
                  className="control-button"
                  onClick={() =>
                    setOtherThingsToShow((prev) => ({
                      ...prev,
                      epipolarLines: !prev.epipolarLines,
                    }))
                  }>
                  {otherThingsToShow.epipolarLines
                    ? 'Hide Lines From Cameras To Object'
                    : 'Show Lines From Cameras To Object'}
                </button>
              </div>
            </div>

            <div className="body-text">
              <blockquote>
                <p>
                  {'Think:  '}
                  {'why does the "line of sight" contain all the places where the corresponding point should '}
                  {'be found on our image plane?'}
                </p>
                <p>
                  {'Hint:  '}
                  {'consider that every point along that "line of sight" will look the same to the other camera.'}
                </p>
              </blockquote>
            </div>

            <div className="body-text">
              <p>{'Do also enable the point predictions below, for some nice color-coding:'}</p>
              <div>
                <button
                  className="control-button"
                  onClick={() =>
                    setOtherThingsToShow((prev) => ({ ...prev, c1PointPrediction: !prev.c1PointPrediction }))
                  }>
                  {otherThingsToShow.c1PointPrediction
                    ? "Hide c1's Point Prediction"
                    : "Show c1's Point Prediction"}
                </button>
                <button
                  className="control-button"
                  onClick={() =>
                    setOtherThingsToShow((prev) => ({ ...prev, c2PointPrediction: !prev.c2PointPrediction }))
                  }>
                  {otherThingsToShow.c1PointPrediction
                    ? "Hide c2's Point Prediction"
                    : "Show c2's Point Prediction"}
                </button>
              </div>
              <p>
                {"To get an epipolar line, left-multiply the point on the c1's image plane by F, "}
                {"or c2's by F\u1D40:"}
              </p>
            </div>

            <MatrixEquation>
              <Matrix33Display label={'F'} matrix={F} />
              <span>{'*'}</span>
              <Vector3Display label={'x'} vector={x} className="blue" />
              <span className="big">{'='}</span>
              <Vector3Display label={"l'"} vector={lp} className="blue all" />
            </MatrixEquation>

            <MatrixEquation>
              <Matrix33Display label={'F\u1D40'} matrix={Ft} />
              <span>{'*'}</span>
              <Vector3Display label={"x'"} vector={xp} className="green" />
              <span className="big">{'='}</span>
              <Vector3Display label={'l'} vector={l} className="green all" />
            </MatrixEquation>

            <div className="body-text">
              <p>{'The lines are represented in vector form, but they can be read:'}</p>
              <p>
                {"l': "}
                <span className="blue">{limitDpHelper(lp.x)}</span>
                {' x + '}
                <span className="blue">{limitDpHelper(lp.y)}</span>
                {' y + '}
                <span className="blue">{limitDpHelper(lp.z)}</span>
                {' = 0'}
              </p>
              <p>
                {'l: '}
                <span className="green">{limitDpHelper(l.x)}</span>
                {' x + '}
                <span className="green">{limitDpHelper(l.y)}</span>
                {' y + '}
                <span className="green">{limitDpHelper(l.z)}</span>
                {' = 0'}
              </p>
              <p>
                {'Here, we have a crude test (it only shows the y-intercepts on the left and right borders) '}
                {'which checks if our calculated epipolar lines match up exactly with the "lines of sight":'}
              </p>
              <div>
                <button
                  className="control-button"
                  onClick={() =>
                    setOtherThingsToShow((prev) => ({
                      ...prev,
                      epipolarLinePredictions: !prev.epipolarLinePredictions,
                    }))
                  }>
                  {otherThingsToShow.epipolarLinePredictions
                    ? 'Hide Epipolar Line Predictions'
                    : 'Show Epipolar Line Predictions'}
                </button>
              </div>
            </div>

            <h2 id="epipolar-constraint" className="title-text">
              {'Epipolar Constraint'}
            </h2>

            <div className="body-text">
              <p>{'Now that we have our epipolar lines, why stop there?'}</p>
              <p>
                {'After all, the dot product of a line and a point on that line should return zero. '}
                {'So, if we have a '}
                <strong>{'candidate point correspondence'}</strong>
                {' we would like to check, we can use that to our advantage.'}
              </p>
              <p>
                {'This is known as the '}
                <strong>{'epipolar constraint'}</strong>
                {', and it usually looks something like this:'}
              </p>
            </div>

            <MatrixEquation initialCollapse={true}>
              <Vector3Display label={"x'"} vector={xp} className="green" />
              <span>{'dot'}</span>
              <Matrix33Display label={'F'} matrix={F} />
              <span>{'*'}</span>
              <Vector3Display label={'x'} vector={x} className="blue" />
              <span className="big">{'='}</span>
              <Vector3Display label={"x'"} vector={xp} className="green" />
              <span>{'dot'}</span>
              <Vector3Display label={"l'"} vector={lp} className="blue" />
              <span className="big">{'='}</span>
              <span>{limitDpHelper(testp)}</span>
            </MatrixEquation>

            <div className="body-text">
              <p>{'Or like this:'}</p>
            </div>

            <MatrixEquation initialCollapse={true}>
              <Vector3Display label={'x'} vector={x} className="blue" />
              <span>{'dot'}</span>
              <Matrix33Display label={'F\u1D40'} matrix={Ft} />
              <span>{'*'}</span>
              <Vector3Display label={"x'"} vector={xp} className="green" />
              <span className="big">{'='}</span>
              <Vector3Display label={'x'} vector={x} className="blue" />
              <span>{'dot'}</span>
              <Vector3Display label={'l'} vector={l} className="green" />
              <span className="big">{'='}</span>
              <span>{limitDpHelper(test)}</span>
            </MatrixEquation>

            <h2 id="conclusion" className="title-text">
              {'Conclusion'}
            </h2>

            <div className="body-text">
              <p>
                <strong>{'Congratulations!'}</strong>
              </p>
              <p>{'You made it through the most challenging concept in CSCI 1430 :)'}</p>
              <p>
                {'In this workshop, we used '}
                <strong>{'known camera matrices'}</strong>
                {' to get a fundamental matrix. Incidentally, this is just '}
                <strong>{'one'}</strong>
                {' way to do it, and probably the harder one!'}
              </p>
              <p>
                {'In HW3, you will implement a different way, one which involves '}
                {'using point correspondences to '}
                <em>{'guess'}</em>
                {' the fundamental matrix, instead. You will probably use '}
                <strong>{'linear least-squares regression'}</strong>
                {' or '}
                <strong>{'singular-value decomposition'}</strong>
                {'.'}
              </p>
              <p>{'All the best!'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
