import * as THREE from 'three'
import { limitDpHelper } from './common'

type Matrix4DisplayProps = {
  label: string
  matrix: THREE.Matrix4
}

function Matrix4Display({ label, matrix }: Matrix4DisplayProps) {
  return (
    <div className="matrix">
      <div style={{ gridArea: 'a' }}>{label}</div>
      <div
        className="matrix-elements"
        style={{
          gridTemplate: 'repeat(4, 1fr) / repeat(4, auto)',
        }}>
        {matrix.elements.map((x, i) => (
          <span key={i} className="limit-dp" style={{ maxWidth: limitDpHelper(x) }}>
            {x}
          </span>
        ))}
      </div>
    </div>
  )
}

export default Matrix4Display
