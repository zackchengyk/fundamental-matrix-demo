import { useState } from 'react'
import logo from '../logo.svg'
import '../css/App.scss'
import '../css/Matrix.scss'

import * as THREE from 'three'
import Matrix4Display from './matrixDisplay/Matrix4Display'
import Vector4Display from './matrixDisplay/Vector4Display'
import { limitDpHelper } from './matrixDisplay/common'

function App() {
  const [matA, setMatA] = useState<THREE.Matrix4>(
    new THREE.Matrix4().fromArray([4, 3, 2, 5, 4, 3, 6, 5, 4, 1, 2, 3, 4, 5, 6, 7])
  )
  const [matB, setMatB] = useState<THREE.Matrix4>(
    new THREE.Matrix4().fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 2, 3, 1, 6, 2, 5])
  )
  const [vecA, setVecA] = useState<THREE.Vector4>(new THREE.Vector4(101234.21351251, 20, 30, 1))

  const result = vecA.clone().applyMatrix4(matA.clone().multiply(matB))
  const homogenizedResult = result.clone().divideScalar(result.z)

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>
        <div className="matrix-equation">
          <Matrix4Display label={'intrinsic'} matrix={matA} />
          <span>{'*'}</span>
          <Matrix4Display label={'extrinsic'} matrix={matB} />
          <span>{'*'}</span>
          <Vector4Display label={'point'} vector={vecA} />
          <span>{'='}</span>
          <Vector4Display label={'result'} vector={result} />
          <span>{'='}</span>
          <span className="limit-dp" style={{ maxWidth: limitDpHelper(result.z) }}>
            {result.z}
          </span>
          <Vector4Display label={'factorized result'} vector={homogenizedResult} />
        </div>
      </header>
    </div>
  )
}

export default App
