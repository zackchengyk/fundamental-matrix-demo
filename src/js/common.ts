import * as THREE from 'three'

export enum SceneCommand {
  nothing,
  setPointToOrigin,
}

export enum CameraCommand {
  nothing,
  setLookPositionToOrigin,
  setRotationToIdentity,
  resetTransforms,
  useStandardViewX,
  useStandardViewY,
  useStandardViewZ,
  setRotationToMatchC1,
  setRotationToMatchC2,
  setPositionToMatchC1,
  setPositionToMatchC2,
}

const charWidth = 5
const regex = /^(-?)0(\.)/

// Helper to display a float either as zero, or with up to charWidth number of characters (including ellipses)
// - Rounds towards zero, due to use of string truncation
// - If the number is larger than can be represented, it will be displayed with enough characters
//   to show the first decimal place: e.g. -12345.678 --> -12345.6…
export function limitDpHelper(n: string | number): string {
  if (typeof n === 'string') return n
  if (Math.abs(n) < 0.0001) return '0'
  const roundedN = Math.round(n * 1000) / 1000
  const s: string = roundedN.toString().replace(regex, '$1$2')
  const c = Math.max(s.indexOf('.') + 3, charWidth)
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

// Helper to check if two arrays of numbers/strings are equal
export function primitiveArrayEquals(a: (number | string)[], b: (number | string)[]) {
  return a.length === b.length && a.every((val, index) => val === b[index])
}

// Helper to check if two vector3s are equal to some precision
export function vector3Equals(v1: THREE.Vector3, v2: THREE.Vector3, epsilon: number) {
  return Math.abs(v1.x - v2.x) < epsilon && Math.abs(v1.y - v2.y) < epsilon && Math.abs(v1.z - v2.z) < epsilon
}

// Helper to check if two quaternions are equal to some precision
export function quaternionEquals(v1: THREE.Quaternion, v2: THREE.Quaternion, epsilon: number) {
  return (
    Math.abs(v1.x - v2.x) < epsilon &&
    Math.abs(v1.y - v2.y) < epsilon &&
    Math.abs(v1.z - v2.z) < epsilon &&
    Math.abs(v1.w - v2.w) < epsilon
  )
}
