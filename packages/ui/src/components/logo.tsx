import { type ComponentProps } from "solid-js"

/** OpenCodeX monogram: O with X inside. Flat, uses currentColor. */
export const Mark = (props: { class?: string }) => {
  return (
    <svg
      data-component="logo-mark"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        data-slot="logo-mark-o"
        cx="16"
        cy="16"
        r="9.25"
        stroke="currentColor"
        stroke-width="2.5"
      />
      <path
        data-slot="logo-mark-x"
        d="M11.5 11.5 L20.5 20.5 M20.5 11.5 L11.5 20.5"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
      />
    </svg>
  )
}

export const Splash = (props: Pick<ComponentProps<"svg">, "ref" | "class">) => {
  return (
    <svg
      ref={props.ref}
      data-component="logo-splash"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="40" cy="40" r="23" stroke="currentColor" stroke-width="6" />
      <path
        d="M28.5 28.5 L51.5 51.5 M51.5 28.5 L28.5 51.5"
        stroke="currentColor"
        stroke-width="6"
        stroke-linecap="round"
      />
    </svg>
  )
}

/** Compact wordmark: monogram + OpenCodeX type */
export const Logo = (props: { class?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 168 32"
      fill="none"
      classList={{ [props.class ?? ""]: !!props.class }}
      aria-label="OpenCodeX"
    >
      <circle cx="16" cy="16" r="9.25" stroke="currentColor" stroke-width="2.5" />
      <path
        d="M11.5 11.5 L20.5 20.5 M20.5 11.5 L11.5 20.5"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
      />
      <text
        x="36"
        y="21.5"
        fill="currentColor"
        font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
        font-size="15"
        font-weight="600"
        letter-spacing="-0.02em"
      >
        OpenCodeX
      </text>
    </svg>
  )
}
