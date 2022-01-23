import * as THREE from 'three'
import { showNumber } from './common'

type Vector3InputProps = {
  label: string
  vector: THREE.Vector3
  setVector: (m: THREE.Vector3) => void
}

function Vector3Input({ label, vector, setVector }: Vector3InputProps) {
  return (
    <div className="matrix">
      <div style={{ gridArea: 'a' }}>{label}</div>
      <div
        className="matrix-elements"
        style={{
          gridTemplate: 'repeat(3, 1fr) / auto',
        }}>
        {vector.toArray().map((x, i) => (
          <span key={i} className="limited-decimal-places">
            {showNumber(x)}
          </span>
        ))}
      </div>
    </div>
  )
}

export default Vector3Input
