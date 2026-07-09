import { type ComponentProps } from "solid-js"

/**
 * OpenCodeX wordmark for empty / new-session states.
 * Flat monogram (O + X) — no 3D, no gradients, follows currentColor.
 */
export function WordmarkV2(props: Pick<ComponentProps<"svg">, "class">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 72"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      classList={{ [props.class ?? ""]: !!props.class }}
      aria-label="OpenCodeX"
    >
      {/* monogram */}
      <circle cx="36" cy="36" r="22" stroke="currentColor" stroke-width="5" />
      <path
        d="M25 25 L47 47 M47 25 L25 47"
        stroke="currentColor"
        stroke-width="5"
        stroke-linecap="round"
      />
      {/* type */}
      <text
        x="76"
        y="46"
        fill="currentColor"
        font-family="ui-sans-serif, system-ui, -apple-system, 'SF Pro Display', Segoe UI, sans-serif"
        font-size="28"
        font-weight="600"
        letter-spacing="-0.03em"
      >
        OpenCodeX
      </text>
    </svg>
  )
}
