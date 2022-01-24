import * as THREE from 'three'
import { limitDpHelper } from './common'

type Vector4DisplayProps = {
  label: string
  vector: THREE.Vector4
  className?: string
}

function Vector4Display({ label, vector, className }: Vector4DisplayProps) {
  return (
    <div className={'matrix ' + className}>
      <div className="matrix-label">{label}</div>
      <div
        className="matrix-elements"
        style={{
          gridTemplate: 'repeat(4, 1fr) / auto',
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

export default Vector4Display
