import * as THREE from 'three'
import MatrixHelper from './MatrixHelper'

type Matrix34DisplayProps = {
  label: string
  matrix: THREE.Matrix4
}

function Matrix34Display({ label, matrix }: Matrix34DisplayProps) {
  const a = matrix.elements
  const array = [a[0], a[1], a[2], a[4], a[5], a[6], a[8], a[9], a[10], a[12], a[13], a[14]]
  return (
    <MatrixHelper
      label={label}
      array={array}
      style={{
        gridTemplate: 'repeat(3, 1fr) / repeat(4, auto)',
      }}
    />
  )
}

export default Matrix34Display
