import { describe, expect, test } from "bun:test"
import { dict as en } from "./en"
import { dict as ru } from "./ru"

const enKeys = Object.keys(en).sort()
const ruKeys = Object.keys(ru).sort()

describe("i18n parity", () => {
  test("Russian and English expose the same app translation keys", () => {
    expect(ruKeys).toEqual(enKeys)
  })

  test("Russian translates targeted unseen session keys", () => {
    for (const key of ["command.session.previous.unseen", "command.session.next.unseen"] as const) {
      expect(ru[key]).toBeDefined()
      expect(ru[key]).not.toBe(en[key])
    }
  })
})
