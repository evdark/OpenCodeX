# Supported Providers

OpenCode+ uses the upstream-compatible provider architecture and model catalog. The exact model list changes as provider SDKs and catalog data evolve, so the application UI is the source of truth for available models in a given build.

## First-Class Provider Families

| Provider family   | Notes                                                                              |
| ----------------- | ---------------------------------------------------------------------------------- |
| Anthropic         | Claude models through the Anthropic provider.                                      |
| OpenAI            | Chat and Responses API models through the OpenAI provider.                         |
| OpenAI-compatible | Local models, hosted gateways, and custom endpoints that follow OpenAI-style APIs. |
| Google Gemini     | Gemini models through Google Generative AI.                                        |
| Google Vertex AI  | Vertex-hosted Google and Anthropic model paths where configured.                   |
| Azure OpenAI      | Azure resource-based OpenAI deployments.                                           |
| Amazon Bedrock    | Bedrock and Bedrock Mantle model access.                                           |
| OpenRouter        | Multi-model routing through OpenRouter.                                            |
| GitHub Copilot    | Copilot model access where authenticated.                                          |
| xAI               | Grok models through the xAI provider.                                              |
| Mistral           | Mistral-hosted models.                                                             |
| Groq              | Groq-hosted inference.                                                             |
| Cerebras          | Cerebras-hosted inference.                                                         |
| Cohere            | Cohere models.                                                                     |
| Together AI       | Together-hosted models.                                                            |
| Perplexity        | Perplexity models and agent endpoints where available.                             |
| Vercel AI Gateway | Gateway-backed model routing.                                                      |

Additional providers may appear in the model catalog or through OpenAI-compatible configuration.

## Custom OpenAI-Compatible Providers

Use a custom provider when you have:

- a local model server;
- an internal model gateway;
- a provider proxy;
- a hosted endpoint that implements OpenAI-compatible chat or responses APIs.

Typical values:

| Field        | Meaning                                       |
| ------------ | --------------------------------------------- |
| Display name | Human-readable provider name shown in the UI. |
| Base URL     | Endpoint root for the provider API.           |
| API key      | Secret used by the provider or gateway.       |
| Models       | Model IDs exposed by the endpoint.            |
| Headers      | Optional provider-specific headers.           |

## Choosing A Provider

| Goal                          | Good starting point                                                 |
| ----------------------------- | ------------------------------------------------------------------- |
| Highest coding quality        | Anthropic, OpenAI, Google, or current frontier models in OpenRouter |
| Low latency                   | Groq, Cerebras, or a nearby OpenAI-compatible gateway               |
| Local/private experimentation | Ollama, LM Studio, vLLM, or another OpenAI-compatible local server  |
| Enterprise cloud controls     | Azure OpenAI, Amazon Bedrock, or Google Vertex AI                   |
| Broad model comparison        | OpenRouter or Vercel AI Gateway                                     |

## Secrets

Prefer environment variables, OS keychain integrations, or provider auth flows over checking secrets into configuration files. Never commit API keys.

## Provider Issues

When reporting provider problems, include:

- provider ID;
- model ID;
- OpenCode+ version or commit;
- whether the provider is built in or custom;
- redacted request or error details;
- whether the same key works outside OpenCode+.
