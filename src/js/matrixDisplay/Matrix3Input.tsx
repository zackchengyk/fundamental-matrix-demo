import * as THREE from 'three'
import { showNumber } from './common'

type Matrix3InputProps = {
  label: string
  matrix: THREE.Matrix3
  setMatrix: (m: THREE.Matrix3) => void
}

function Matrix3Input({ label, matrix, setMatrix }: Matrix3InputProps) {
  return (
    <div className="matrix">
      <div style={{ gridArea: 'a' }}>{label}</div>
      <div
        className="matrix-elements"
        style={{
          gridTemplate: 'repeat(3, 1fr) / repeat(3, auto)',
        }}>
        {matrix.elements.map((x, i) => (
          <span key={i} className="limited-decimal-places">
            {showNumber(x)}
          </span>
        ))}
      </div>
    </div>
  )
}

export default Matrix3Input
