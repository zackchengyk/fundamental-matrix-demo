import * as THREE from 'three'
import MatrixHelper from './MatrixHelper'

type Matrix44DisplayProps = {
  label: string
  matrix: THREE.Matrix4
}

function Matrix44Display({ label, matrix }: Matrix44DisplayProps) {
  return (
    <MatrixHelper
      label={label}
      array={matrix.elements}
      style={{
        gridTemplate: 'repeat(4, 1fr) / repeat(4, auto)',
      }}
    />
  )
}

export default Matrix44Display
