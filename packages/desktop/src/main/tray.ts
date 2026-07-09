import { app, Tray, Menu, nativeImage } from "electron"
import { join } from "path"
import { restoreMainWindows, getLastFocusedWindow } from "./windows"
import { isFirstLaunchOnboardingPending } from "./onboarding"
import { sendDeepLinks } from "./ipc"

let tray: Tray | null = null

const TRAY_ICON_SIZE = 16

export function isTrayActive() {
  return tray !== null
}

export function initTray() {
  if (tray) return

  try {
    const isWin = process.platform === "win32"
    const isMac = process.platform === "darwin"
    // Prefer raster sizes for tray; icns/ico are unreliable with nativeImage here.
    const fallbackIconName = isMac ? "32x32.png" : isWin ? "icon.png" : "icon.png"

    const iconPath = app.isPackaged
      ? join(process.resourcesPath, "icons", fallbackIconName)
      : join(__dirname, "../../resources/icons", fallbackIconName)

    const icon = nativeImage.createFromPath(iconPath)
    const trayIcon = icon.resize({ width: TRAY_ICON_SIZE, height: TRAY_ICON_SIZE })
    if (isMac) trayIcon.setTemplateImage(true)

    tray = new Tray(trayIcon)

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Open OpenCodeX",
        click: () => {
          if (!isFirstLaunchOnboardingPending()) restoreMainWindows()
        },
      },
      {
        label: "New Session",
        click: () => {
          if (isFirstLaunchOnboardingPending()) return
          restoreMainWindows()
          const win = getLastFocusedWindow()
          if (win) sendDeepLinks(win, ["opencode://new-session"])
        },
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => {
          app.quit()
        },
      },
    ])

    tray.setToolTip("OpenCodeX")
    tray.setContextMenu(contextMenu)
    tray.on("click", () => {
      if (!isFirstLaunchOnboardingPending()) restoreMainWindows()
    })
  } catch (error) {
    console.error("Failed to initialize tray:", error)
  }
}

export function destroyTray() {
  if (!tray) return
  tray.destroy()
  tray = null
}
