import * as THREE from 'three'

const c = 7

// Helper to display a float with a fixed number (c) of characters (including ellipses)
export function limitDpHelper(n: number): string {
  if (Math.abs(n) < 0.0001) return '0'
  const s: string = n.toString()
  return s.length > c ? s.slice(0, c - 1) + '\u2026' : s.slice(0, c)
}

// Helper to convert a vector cross product (t) into matrix form (t_x), such that cross(t, X) === t_x * X
export function crossProductMatrixHelper(t: THREE.Vector3): THREE.Matrix3 {
  return new THREE.Matrix3().fromArray([0, -t.z, t.y, t.z, 0, -t.x, -t.y, t.x, 0])
}

// Helper to extract 3x3 matrix from 4x4 matrix, and flip the sign of the bottom-right element
export function intrinsicHelper(input: THREE.Matrix4): THREE.Matrix3 {
  const i = input.elements
  return new THREE.Matrix3().fromArray([i[0], i[1], i[2], i[4], i[5], i[6], i[8], i[9], -i[10], 0, 0, 0])
}
