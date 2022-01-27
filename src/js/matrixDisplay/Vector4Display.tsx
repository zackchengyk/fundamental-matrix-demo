import * as THREE from 'three'
import MatrixHelper from './MatrixHelper'

type Vector4DisplayProps = {
  label: string
  vector: THREE.Vector4
  className?: string
}

function Vector4Display({ label, vector, className }: Vector4DisplayProps) {
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

export default Vector4Display
