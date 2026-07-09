import { expect, test } from "bun:test"
import type { Configuration } from "electron-builder"

const channels = [
  { channel: "dev", appId: "ai.opencodex.desktop.dev", productName: "OpenCodeX Dev" },
  { channel: "beta", appId: "ai.opencodex.desktop.beta", productName: "OpenCodeX Beta" },
  { channel: "prod", appId: "ai.opencodex.desktop", productName: "OpenCodeX" },
] as const

for (const channel of channels) {
  test(`uses one Linux desktop identity for ${channel.channel}`, async () => {
    const previous = process.env.OPENCODE_CHANNEL
    process.env.OPENCODE_CHANNEL = channel.channel

    const module = await import(`./electron-builder.config.ts?channel=${channel.channel}`)
    const config = module.default as Configuration

    if (previous === undefined) delete process.env.OPENCODE_CHANNEL
    else process.env.OPENCODE_CHANNEL = previous

    expect(config.appId).toBe(channel.appId)
    expect(config.extraMetadata?.desktopName).toBe(`${channel.appId}.desktop`)
    expect(config.linux?.executableName).toBe(channel.appId)
    expect(config.linux?.desktop?.entry?.StartupWMClass).toBe(channel.appId)
    expect(config.productName).toBe(channel.productName)
    expect(config.artifactName).toBe("opencodex-desktop-${os}-${arch}.${ext}")
  })
}

test("uses fork release repository when configured", async () => {
  const previousChannel = process.env.OPENCODE_CHANNEL
  const previousOwner = process.env.OPENCODE_RELEASE_OWNER
  const previousRepo = process.env.OPENCODE_RELEASE_REPO
  process.env.OPENCODE_CHANNEL = "prod"
  process.env.OPENCODE_RELEASE_OWNER = "evdark"
  process.env.OPENCODE_RELEASE_REPO = "OpenCodeX"

  const module = await import("./electron-builder.config.ts?fork=prod")
  const config = module.default as Configuration

  if (previousChannel === undefined) delete process.env.OPENCODE_CHANNEL
  else process.env.OPENCODE_CHANNEL = previousChannel
  if (previousOwner === undefined) delete process.env.OPENCODE_RELEASE_OWNER
  else process.env.OPENCODE_RELEASE_OWNER = previousOwner
  if (previousRepo === undefined) delete process.env.OPENCODE_RELEASE_REPO
  else process.env.OPENCODE_RELEASE_REPO = previousRepo

  expect(config.publish).toEqual({ provider: "github", owner: "evdark", repo: "OpenCodeX", channel: "latest" })
})

test("keeps mac signing optional for fork release builds", async () => {
  const previousCscLink = process.env.CSC_LINK
  const previousCscKeyPassword = process.env.CSC_KEY_PASSWORD
  const previousAppleApiKey = process.env.APPLE_API_KEY
  const previousAppleApiKeyId = process.env.APPLE_API_KEY_ID
  const previousAppleApiIssuer = process.env.APPLE_API_ISSUER

  delete process.env.CSC_LINK
  delete process.env.CSC_KEY_PASSWORD
  delete process.env.APPLE_API_KEY
  delete process.env.APPLE_API_KEY_ID
  delete process.env.APPLE_API_ISSUER
  const unsignedModule = await import("./electron-builder.config.ts?mac=unsigned")
  const unsignedConfig = unsignedModule.default as Configuration

  process.env.CSC_LINK = "certificate"
  process.env.CSC_KEY_PASSWORD = "password"
  process.env.APPLE_API_KEY = "api-key.p8"
  process.env.APPLE_API_KEY_ID = "key-id"
  process.env.APPLE_API_ISSUER = "issuer"
  const signedModule = await import("./electron-builder.config.ts?mac=signed")
  const signedConfig = signedModule.default as Configuration

  if (previousCscLink === undefined) delete process.env.CSC_LINK
  else process.env.CSC_LINK = previousCscLink
  if (previousCscKeyPassword === undefined) delete process.env.CSC_KEY_PASSWORD
  else process.env.CSC_KEY_PASSWORD = previousCscKeyPassword
  if (previousAppleApiKey === undefined) delete process.env.APPLE_API_KEY
  else process.env.APPLE_API_KEY = previousAppleApiKey
  if (previousAppleApiKeyId === undefined) delete process.env.APPLE_API_KEY_ID
  else process.env.APPLE_API_KEY_ID = previousAppleApiKeyId
  if (previousAppleApiIssuer === undefined) delete process.env.APPLE_API_ISSUER
  else process.env.APPLE_API_ISSUER = previousAppleApiIssuer

  expect(unsignedConfig.mac?.notarize).toBe(false)
  expect(unsignedConfig.mac?.identity).toBe("-")
  expect(unsignedConfig.mac?.hardenedRuntime).toBe(false)
  expect(unsignedConfig.dmg?.sign).toBe(false)
  expect(signedConfig.mac?.notarize).toBe(true)
  expect(signedConfig.mac?.identity).toBe(undefined)
  expect(signedConfig.mac?.hardenedRuntime).toBe(true)
  expect(signedConfig.dmg?.sign).toBe(true)
})
