import { limitDpHelper } from '../common'

type MatrixHelperProps = {
  label: string
  array: number[]
  className?: string
  style: React.CSSProperties
}

function MatrixHelper({ label, array, className, style }: MatrixHelperProps) {
  return (
    <div className={'matrix ' + className}>
      <div className="matrix-label">{label}</div>
      <div className="matrix-elements" style={style}>
        {array.map((x, i) => (
          <span key={i} className="limit-dp">
            {limitDpHelper(x)}
          </span>
        ))}
      </div>
    </div>
  )
}

export default MatrixHelper
