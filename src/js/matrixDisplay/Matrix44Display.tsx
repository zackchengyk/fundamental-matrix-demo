import React from 'react'
import * as THREE from 'three'
import MatrixHelper from './MatrixHelper'

type Matrix44DisplayProps = {
  label: string
  matrix: THREE.Matrix4
}

function Matrix44Display_({ label, matrix }: Matrix44DisplayProps) {
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

function propsAreEqual(prev: Matrix44DisplayProps, next: Matrix44DisplayProps) {
  return prev.label === next.label && prev.matrix.equals(next.matrix)
}

const Matrix44Display = React.memo(Matrix44Display_, propsAreEqual)

export default Matrix44Display
