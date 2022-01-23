import * as THREE from 'three'
import { limitDpHelper } from './common'

type Matrix3DisplayProps = {
  label: string
  matrix: THREE.Matrix3
}

function Matrix3Display({ label, matrix }: Matrix3DisplayProps) {
  return (
    <div className="matrix">
      <div style={{ gridArea: 'a' }}>{label}</div>
      <div
        className="matrix-elements"
        style={{
          gridTemplate: 'repeat(3, 1fr) / repeat(3, auto)',
        }}>
        {matrix.elements.map((x, i) => (
          <span key={i} className="limit-dp">
            {limitDpHelper(x)}
          </span>
        ))}
      </div>
    </div>
  )
}

export default Matrix3Display
