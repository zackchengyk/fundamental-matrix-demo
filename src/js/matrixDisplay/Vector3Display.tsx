import * as THREE from 'three'
import MatrixHelper from './MatrixHelper'

type Vector3DisplayProps = {
  label: string
  vector: THREE.Vector3 | THREE.Vector4
  className?: string
}

function Vector3Display({ label, vector, className }: Vector3DisplayProps) {
  const a = vector.toArray()
  const array = a.length === 4 ? [a[0], a[1], a[2]] : a
  return (
    <MatrixHelper
      label={label}
      array={array}
      className={className}
      style={{
        gridTemplate: 'repeat(3, 1fr) / auto',
      }}
    />
  )
}

export default Vector3Display
