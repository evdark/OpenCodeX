import { onCleanup } from "solid-js"

export function createCopyAttributeFeedback() {
  const timers = new Set<ReturnType<typeof setTimeout>>()
  onCleanup(() => {
    for (const timer of timers) clearTimeout(timer)
  })

  return (element: Element, delay: number) => {
    element.setAttribute("data-copied", "")
    const timer = setTimeout(() => {
      timers.delete(timer)
      element.removeAttribute("data-copied")
    }, delay)
    timers.add(timer)
  }
}

export function createTimedReset(reset: () => void) {
  let timer: ReturnType<typeof setTimeout> | undefined
  onCleanup(() => {
    if (timer) clearTimeout(timer)
  })

  return (delay: number) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(reset, delay)
  }
}
