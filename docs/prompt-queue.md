# Prompt Queue

Prompt Queue is the OpenCode+ direction for staging follow-up work during long-running sessions. It should make momentum visible without interrupting an active provider turn.

## Product Goal

Developers often think of the next request while the current one is still running. A queue lets them capture that follow-up, review it, and decide when it should run.

## Expected Workflow

| Step    | Behavior                                                                             |
| ------- | ------------------------------------------------------------------------------------ |
| Capture | A prompt entered during an active session can be staged instead of sent immediately. |
| Review  | Queued prompts remain visible near the composer.                                     |
| Edit    | Drafts can be refined before execution.                                              |
| Reorder | Users can choose which follow-up should run next.                                    |
| Run     | Manual or automatic modes decide when the next prompt is submitted.                  |

## Design Constraints

- Never surprise-send user text.
- Preserve attachments, selected model, agent, and relevant composer state.
- Keep queue controls compact.
- Make persistence explicit.
- Keep implementation isolated from upstream session orchestration where possible.

## Status

Prompt Queue documentation describes the intended OpenCode+ workflow. Builds should only present it as available when the corresponding runtime and settings are included.
