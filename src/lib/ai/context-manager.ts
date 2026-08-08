import type { Message } from "ai";

/**
 * Trims the context window by replacing raw tool invocation outputs
 * older than `maxToolAge` turns with a single summary message.
 * This prevents the context window from being blown up by verbose
 * JSON tool results from earlier in the conversation.
 */
export function trimContextWindow(
  messages: Message[],
  maxToolAge: number = 4
): Message[] {
  if (messages.length <= maxToolAge) {
    return messages;
  }

  const cutoffIndex = messages.length - maxToolAge;

  return messages.map((message, index) => {
    // Only process messages that are older than the cutoff
    if (index >= cutoffIndex) {
      return message;
    }

    // Check if this message has tool invocations with results
    if (message.toolInvocations && message.toolInvocations.length > 0) {
      const hasResults = message.toolInvocations.some(
        (inv) => inv.state === "result"
      );

      if (hasResults) {
        // Replace with a summary message, stripping the heavy tool data
        return {
          ...message,
          toolInvocations: message.toolInvocations.map((inv) => {
            if (inv.state === "result") {
              return {
                ...inv,
                result: "Tools executed successfully",
              };
            }
            return inv;
          }),
        };
      }
    }

    return message;
  });
}
