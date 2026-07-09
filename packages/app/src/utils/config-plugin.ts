/** Normalize config.plugin entries (string or [name, options] tuples) to package ids. */
export function configPluginIds(plugin: unknown): string[] {
  if (!Array.isArray(plugin)) return []
  return plugin.flatMap((item) => {
    if (typeof item === "string") return [item]
    if (Array.isArray(item) && typeof item[0] === "string") return [item[0]]
    return []
  })
}

export function configPluginIncludes(plugin: unknown, npm: string) {
  return configPluginIds(plugin).some((item) => item === npm || item.endsWith(`/${npm}`) || item.includes(npm))
}
