import { useEffect, useRef, useState } from 'react'

const useScrollWatcher = (options?: IntersectionObserverInit): [React.MutableRefObject<any>, boolean] => {
  const containerRef = useRef<any>(null)
  const [isVisible, setIsVisible] = useState<boolean>(false)

  const callbackFunction: IntersectionObserverCallback = (entries) => {
    const [entry] = entries
    const topBound: number = entry.rootBounds?.top || 0
    setIsVisible(entry.isIntersecting || entry.boundingClientRect.top - topBound < 0)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(callbackFunction, options)
    if (containerRef.current) observer.observe(containerRef.current)

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current)
    }
  }, [containerRef, options])

  return [containerRef, isVisible]
}

export default useScrollWatcher
