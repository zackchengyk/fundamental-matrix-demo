import React from 'react'
import * as THREE from 'three'
import MatrixHelper from './MatrixHelper'

type Vector4DisplayProps = {
  label: string
  vector: THREE.Vector4
  className?: string
}

function Vector4Display_({ label, vector, className }: Vector4DisplayProps) {
  return (
    <MatrixHelper
      label={label}
      array={vector.toArray()}
      className={className}
      style={{
        gridTemplate: 'repeat(4, 1fr) / auto',
      }}
    />
  )
}

function propsAreEqual(prev: Vector4DisplayProps, next: Vector4DisplayProps) {
  return prev.label === next.label && prev.vector.equals(next.vector)
}

const Vector4Display = React.memo(Vector4Display_, propsAreEqual)

export default Vector4Display
