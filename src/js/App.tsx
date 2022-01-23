import { useState } from 'react'
import logo from '../logo.svg'
import '../css/App.scss'
import '../css/Matrix.scss'

import * as THREE from 'three'
import Matrix3Input from './matrixDisplay/Matrix3Input'
import Vector3Input from './matrixDisplay/Vector3Input'

function App() {
  const [matA, setMatA] = useState<THREE.Matrix3>(new THREE.Matrix3().fromArray([4, 3, 2, 5, 4, 3, 6, 5, 4]))
  const [matB, setMatB] = useState<THREE.Matrix3>(new THREE.Matrix3().fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9]))
  const [vecA, setVecA] = useState<THREE.Vector3>(new THREE.Vector3(10, 20, 30))

  const result = vecA.clone().applyMatrix3(matA.clone().multiply(matB))
  const homogenizedResult = result.clone().divideScalar(result.z)

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>
        <div className="matrix-equation">
          <Matrix3Input label={'intrinsic'} matrix={matA} setMatrix={setMatA} />
          <span>{'*'}</span>
          <Matrix3Input label={'extrinsic'} matrix={matB} setMatrix={setMatB} />
          <span>{'*'}</span>
          <Vector3Input label={'point'} vector={vecA} setVector={setVecA} />
          <span>{'='}</span>
          <Vector3Input label={'result'} vector={result} setVector={(x) => {}} />
          <span>{'='}</span>
          <span>{result.z}</span>
          <Vector3Input label={'result'} vector={homogenizedResult} setVector={(x) => {}} />
        </div>
      </header>
    </div>
  )
}

export default App
