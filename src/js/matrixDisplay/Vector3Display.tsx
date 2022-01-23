import * as THREE from 'three'
import { limitDpHelper } from './common'

type Vector3DisplayProps = {
  label: string
  vector: THREE.Vector3
  className?: string
}

function Vector3Display({ label, vector, className }: Vector3DisplayProps) {
  return (
    <div className={'matrix ' + className}>
      <div style={{ gridArea: 'a' }}>{label}</div>
      <div
        className="matrix-elements"
        style={{
          gridTemplate: 'repeat(3, 1fr) / auto',
        }}>
        {vector.toArray().map((x, i) => (
          <span key={i} className="limit-dp">
            {limitDpHelper(x)}
          </span>
        ))}
      </div>
    </div>
  )
}

export default Vector3Display
