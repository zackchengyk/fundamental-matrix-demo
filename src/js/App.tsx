import { useEffect, useRef, useState } from 'react'
import '../css/App.scss'
import '../css/Matrix.scss'

import * as THREE from 'three'
import Matrix4Display from './matrixDisplay/Matrix4Display'
import Vector4Display from './matrixDisplay/Vector4Display'
import { limitDpHelper } from './matrixDisplay/common'
import { DemoType, main } from './main'

function App() {
  const [matA, setMatA] = useState<THREE.Matrix4>(
    new THREE.Matrix4().fromArray([4, 3, 2, 5, 4, 3, 6, 5, 4, 1, 2, 3, 4, 5, 6, 7])
  )
  const [matB, setMatB] = useState<THREE.Matrix4>(
    new THREE.Matrix4().fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 2, 3, 1, 6, 2, 5])
  )
  const [vecA, setVecA] = useState<THREE.Vector4>(new THREE.Vector4(0, 0, 0, 1))

  const matMul = matA.clone().multiply(matB)
  const result = vecA.clone().applyMatrix4(matMul)
  const homogenizedResult = result.clone().divideScalar(result.z)

  const containerRef = useRef<any>()
  const canvasRef = useRef<any>()
  const demoRef = useRef<DemoType>()

  useEffect(() => {
    demoRef.current = main(containerRef.current, canvasRef.current)

    setMatA(demoRef.current.intrinsicMatrix)
    setMatB(demoRef.current.extrinsicMatrix)

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
      <div id="container" ref={containerRef}>
        <canvas id="canvas" ref={canvasRef} />
        <div
          id="target"
          style={{
            transform: `translate(${homogenizedResult.x * 50}%, ${-homogenizedResult.y * 50}%) scale(0.02)`,
          }}
        />
      </div>

      <div className="matrix-equation">
        <Matrix4Display label={'intrinsic matrix'} matrix={matA} />
        <span>{'*'}</span>
        <Matrix4Display label={'extrinsic matrix'} matrix={matB} />
        <span>{'*'}</span>
        <Vector4Display label={'point'} vector={vecA} />
        <span>{'='}</span>
        <Vector4Display label={'result'} vector={result} />
        <span>{'='}</span>
        <span className="limit-dp">{limitDpHelper(result.z)}</span>
        <Vector4Display label={'factorized result'} vector={homogenizedResult} />
      </div>
    </div>
  )
}

export default App
