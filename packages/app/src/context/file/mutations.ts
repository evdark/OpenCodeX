import type { OpencodeClient } from "@opencode-ai/sdk/v2/client"

type HttpClient = {
  post: (options: {
    url: string
    body?: unknown
    headers?: Record<string, string>
  }) => Promise<{ data?: { path?: string }; error?: unknown }>
  delete: (options: {
    url: string
    query?: Record<string, string>
  }) => Promise<{ data?: { path?: string }; error?: unknown }>
}

function http(client: OpencodeClient): HttpClient {
  return (client as unknown as { client: HttpClient }).client
}

export function createFileMutations(client: OpencodeClient) {
  const request = http(client)

  return {
    rename(from: string, to: string) {
      return request.post({
        url: "/file/rename",
        body: { from, to },
        headers: { "Content-Type": "application/json" },
      })
    },
    remove(path: string) {
      return request.delete({
        url: "/file",
        query: { path },
      })
    },
    copy(path: string, to?: string) {
      return request.post({
        url: "/file/copy",
        body: to ? { path, to } : { path },
        headers: { "Content-Type": "application/json" },
      })
    },
  }
}
