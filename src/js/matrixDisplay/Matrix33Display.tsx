import * as THREE from 'three'
import MatrixHelper from './MatrixHelper'

type Matrix33DisplayProps = {
  label: string
  matrix: THREE.Matrix3 | THREE.Matrix4
}

function Matrix33Display({ label, matrix }: Matrix33DisplayProps) {
  const a = matrix.elements
  const array = a.length === 16 ? [a[0], a[1], a[2], a[4], a[5], a[6], a[8], a[9], a[10]] : a
  return (
    <MatrixHelper
      label={label}
      array={array}
      style={{
        gridTemplate: 'repeat(3, 1fr) / repeat(3, auto)',
      }}
    />
  )
}

export default Matrix33Display
