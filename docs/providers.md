# Providers

OpenCode+ supports the upstream OpenCode provider model plus fork-focused documentation around custom endpoints and diagnostics.

## Provider Catalog

The application provider list is generated from provider integrations and model catalog data. The static guide in [../SUPPORTED_PROVIDERS.md](../SUPPORTED_PROVIDERS.md) describes the main families; the UI shows the exact providers available in your build.

## Built-In Providers

Common first-class families include:

- Anthropic
- OpenAI
- Google Gemini
- Google Vertex AI
- Azure OpenAI
- Amazon Bedrock
- OpenRouter
- GitHub Copilot
- xAI
- Mistral
- Groq
- Cerebras
- Cohere
- Together AI
- Perplexity
- Vercel AI Gateway

## Custom Endpoints

Use OpenAI-compatible providers for:

- local model servers;
- internal gateways;
- provider proxies;
- enterprise routing layers;
- model experiments outside the default catalog.

Check that your endpoint supports the API shape required by the model you select.

## Troubleshooting

| Symptom                  | Check                                                          |
| ------------------------ | -------------------------------------------------------------- |
| Provider does not appear | Confirm config syntax, provider ID, and build support.         |
| Model not found          | Verify the exact model ID and whether the provider exposes it. |
| Auth failure             | Reconnect the provider or rotate the API key.                  |
| Streaming stalls         | Check provider availability, proxy timeout, and network logs.  |
| Cost looks wrong         | Confirm provider metadata and catalog pricing for the model.   |

When opening an issue, include redacted provider details and a minimal reproduction.
