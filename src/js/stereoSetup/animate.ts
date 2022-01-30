import Stats from 'three/examples/jsm/libs/stats.module'
import { DemoType } from './main'

// @ts-ignore
const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)
stats.dom.style.zIndex = '100000000000000'

export function animate(time: DOMHighResTimeStamp, demo: DemoType, forceRender?: boolean) {
  // Continue the animation loop
  demo.nextFrameReq = requestAnimationFrame((t) => animate(t, demo))

  stats.begin()
  if (demo.isPlaying) update(time, demo)
  if (demo.isPlaying || forceRender) render(time, demo)
  stats.end()
}

function update(time: DOMHighResTimeStamp, demo: DemoType): void {
  demo.prevTime = time

  // Update position of point
  demo.pointPosition.y = 2 + Math.sin(time * 0.0015) * 2
}

export function render(time: DOMHighResTimeStamp, demo: DemoType): void {
  // For each camera
  for (let i = 0; i < demo.cameraData.length; i++) {
    const data = demo.cameraData[i]

    // Get
    const renderer = data.renderer
    const camera = data.camera

    // Get new size
    const iw = data.container.clientWidth
    const ih = data.container.clientHeight
    camera.aspect = iw / ih
    camera.updateProjectionMatrix()
    renderer.setSize(iw, ih)

    // Move
    data.orbitControls.update()

    const linePosArray = data.line.geometry.attributes.position.array
    const lineDir = demo.pointPosition.clone().sub(data.camera.position)
    const startPos = data.camera.position.clone().add(lineDir.clone().multiplyScalar(-1000))
    const endPos = data.camera.position.clone().add(lineDir.clone().multiplyScalar(1000))
    // @ts-ignore
    linePosArray[0] = startPos.x // @ts-ignore
    linePosArray[1] = startPos.y // @ts-ignore
    linePosArray[2] = startPos.z // @ts-ignore
    linePosArray[3] = endPos.x // @ts-ignore
    linePosArray[4] = endPos.y // @ts-ignore
    linePosArray[5] = endPos.z
    data.line.geometry.attributes.position.needsUpdate = true

    // Render
    renderer.render(demo.scene, data.camera)
  }

  // Update GUI
  demo.updateGUIFunction(demo)
}
