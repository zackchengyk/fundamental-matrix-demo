import React, { useState } from 'react'
import * as THREE from 'three'
import { primitiveArrayEquals } from '../common'
import MatrixHelper from './MatrixHelper'

type MatrixEquationProps = {
  initialCollapse?: boolean
  children: React.ReactNode
}

const MatrixEquation = React.forwardRef<HTMLDivElement, MatrixEquationProps>(
  ({ initialCollapse = false, children }, ref) => {
    const [collapsed, setCollapsed] = useState<boolean>(initialCollapse)
    return (
      <div
        className={'matrix-equation collapsible ' + (collapsed ? 'collapsed' : '')}
        onClick={() => setCollapsed((prev) => !prev)}
        ref={ref}>
        {children}
      </div>
    )
  }
)

export default MatrixEquation
