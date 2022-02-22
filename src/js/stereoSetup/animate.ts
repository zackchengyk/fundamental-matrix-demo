import Stats from 'three/examples/jsm/libs/stats.module'
import { DemoType } from './main'
import { updateScene, updateSize } from './update'

// @ts-ignore
const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)
stats.dom.style.zIndex = '100000000000000'

export function animate(time: DOMHighResTimeStamp, demo: DemoType, forceRender?: boolean) {
  // Continue the animation loop
  demo.nextFrameReq = requestAnimationFrame((t) => animate(t, demo))

  stats.begin()
  updateSize(time, demo)
  updateScene(time, demo)
  render(demo)
  stats.end()
}

export function render(demo: DemoType): void {
  renderToDisplays(demo)
  renderToGUI(demo)
}

function renderToDisplays(demo: DemoType): void {
  // For each camera
  demo.cameraData.forEach(({ renderer, camera }) => {
    renderer.render(demo.scene, camera)
  })
}

function renderToGUI(demo: DemoType): void {
  // Render to GUI
  demo.updateGUIFunction(demo)
}
