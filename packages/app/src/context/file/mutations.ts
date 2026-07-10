import type { OpencodeClient } from "@opencode-ai/sdk/v2/client"

type HttpClient = {
  post: (options: {
    url: string
    body?: unknown
    headers?: Record<string, string>
    throwOnError?: boolean
  }) => Promise<{ data?: { path?: string }; error?: unknown }>
  delete: (options: {
    url: string
    query?: Record<string, string>
    throwOnError?: boolean
  }) => Promise<{ data?: { path?: string }; error?: unknown }>
}

function http(client: OpencodeClient): HttpClient {
  return (client as unknown as { client: HttpClient }).client
}

function mutationError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === "string" && error) return error
  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message) return message
  }
  return fallback
}

export function createFileMutations(client: OpencodeClient) {
  const request = http(client)

  return {
    async rename(from: string, to: string) {
      const result = await request.post({
        url: "/file/rename",
        body: { from, to },
        headers: { "Content-Type": "application/json" },
      })
      if (result.error) throw new Error(mutationError(result.error, "Rename failed"))
      return result
    },
    async remove(path: string) {
      const result = await request.delete({
        url: "/file",
        query: { path },
      })
      if (result.error) throw new Error(mutationError(result.error, "Delete failed"))
      return result
    },
    async copy(path: string, to?: string) {
      const result = await request.post({
        url: "/file/copy",
        body: to ? { path, to } : { path },
        headers: { "Content-Type": "application/json" },
      })
      if (result.error) throw new Error(mutationError(result.error, "Copy failed"))
      return result
    },
  }
}
