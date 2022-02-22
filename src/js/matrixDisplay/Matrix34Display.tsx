import React from 'react'
import * as THREE from 'three'
import MatrixHelper from './MatrixHelper'

type Matrix34DisplayProps = {
  label: string
  matrix: THREE.Matrix4
  className?: string
}

function Matrix34Display_({ label, matrix, className }: Matrix34DisplayProps) {
  const a = matrix.elements
  const array = [a[0], a[1], a[2], a[4], a[5], a[6], a[8], a[9], a[10], a[12], a[13], a[14]]
  return (
    <MatrixHelper
      label={label}
      array={array}
      className={className}
      style={{
        gridTemplate: 'repeat(3, 1fr) / repeat(4, auto)',
      }}
    />
  )
}

function propsAreEqual(prev: Matrix34DisplayProps, next: Matrix34DisplayProps) {
  return prev.label === next.label && prev.matrix.equals(next.matrix)
}

const Matrix34Display = React.memo(Matrix34Display_, propsAreEqual)

export default Matrix34Display
