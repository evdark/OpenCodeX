import { createSignal, onCleanup, Show, type JSX, type ParentProps } from "solid-js"
import { IconButton } from "@opencode-ai/ui/icon-button"

export type FloatingRect = {
  x: number
  y: number
  width: number
  height: number
}

const DEFAULT_RECT: FloatingRect = { x: 80, y: 80, width: 420, height: 320 }

/**
 * Photoshop-style detachable panel: drag title bar to move, edges to resize, re-dock button.
 */
export function FloatingPanel(
  props: ParentProps<{
    title: string
    detached: boolean
    rect?: FloatingRect
    onDetach: () => void
    onDock: () => void
    onRectChange: (rect: FloatingRect) => void
    minWidth?: number
    minHeight?: number
    class?: string
    headerExtra?: JSX.Element
  }>,
) {
  const minW = () => props.minWidth ?? 280
  const minH = () => props.minHeight ?? 180
  const rect = () => props.rect ?? DEFAULT_RECT
  const [dragging, setDragging] = createSignal<"move" | "resize" | undefined>()

  const onMoveStart = (event: PointerEvent) => {
    if (!props.detached) return
    event.preventDefault()
    const startX = event.clientX
    const startY = event.clientY
    const base = rect()
    setDragging("move")
    const onMove = (e: PointerEvent) => {
      props.onRectChange({
        ...base,
        x: Math.max(0, base.x + e.clientX - startX),
        y: Math.max(0, base.y + e.clientY - startY),
      })
    }
    const onUp = () => {
      setDragging(undefined)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  const onResizeStart = (event: PointerEvent) => {
    if (!props.detached) return
    event.preventDefault()
    event.stopPropagation()
    const startX = event.clientX
    const startY = event.clientY
    const base = rect()
    setDragging("resize")
    const onMove = (e: PointerEvent) => {
      props.onRectChange({
        ...base,
        width: Math.max(minW(), base.width + e.clientX - startX),
        height: Math.max(minH(), base.height + e.clientY - startY),
      })
    }
    const onUp = () => {
      setDragging(undefined)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  onCleanup(() => setDragging(undefined))

  return (
    <Show
      when={props.detached}
      fallback={
        <div class={props.class} data-component="floating-panel-docked">
          <div class="flex items-center gap-1 border-b border-border-weaker-base px-2 py-1">
            <span class="min-w-0 flex-1 truncate text-12-medium text-text-strong">{props.title}</span>
            {props.headerExtra}
            <IconButton
              icon="expand"
              size="small"
              variant="ghost"
              aria-label="Detach panel"
              onClick={props.onDetach}
            />
          </div>
          <div class="min-h-0 flex-1">{props.children}</div>
        </div>
      }
    >
      <div
        data-component="floating-panel"
        classList={{
          "fixed z-[80] flex flex-col overflow-hidden rounded-xl border border-border-weak-base bg-background-base shadow-2xl": true,
          "select-none": !!dragging(),
        }}
        style={{
          left: `${rect().x}px`,
          top: `${rect().y}px`,
          width: `${rect().width}px`,
          height: `${rect().height}px`,
        }}
      >
        <div
          class="flex cursor-grab items-center gap-1 border-b border-border-weaker-base bg-surface-base px-2 py-1.5 active:cursor-grabbing"
          onPointerDown={onMoveStart}
        >
          <span class="min-w-0 flex-1 truncate text-12-medium text-text-strong">{props.title}</span>
          {props.headerExtra}
          <IconButton
            icon="collapse"
            size="small"
            variant="ghost"
            aria-label="Dock panel"
            onClick={(e) => {
              e.stopPropagation()
              props.onDock()
            }}
          />
        </div>
        <div class="min-h-0 flex-1 overflow-hidden">{props.children}</div>
        <div
          class="absolute bottom-0 right-0 size-4 cursor-se-resize"
          onPointerDown={onResizeStart}
          aria-hidden
        />
      </div>
    </Show>
  )
}
