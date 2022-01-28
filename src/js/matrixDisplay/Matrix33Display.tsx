import React from 'react'
import * as THREE from 'three'
import { primitiveArrayEquals } from '../common'
import MatrixHelper from './MatrixHelper'

type Matrix33DisplayProps = {
  label: string
  matrix: THREE.Matrix3 | THREE.Matrix4
}

function Matrix33Display_({ label, matrix }: Matrix33DisplayProps) {
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

function propsAreEqual(prev: Matrix33DisplayProps, next: Matrix33DisplayProps) {
  return prev.label === next.label && primitiveArrayEquals(prev.matrix.elements, next.matrix.elements)
}

const Matrix33Display = React.memo(Matrix33Display_, propsAreEqual)

export default Matrix33Display
