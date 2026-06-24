export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

class OpenRouterError extends Error {
  statusCode: number;
  cause?: unknown;

  constructor(message: string, statusCode: number, cause?: unknown) {
    super(message);
    this.name = "OpenRouterError";
    this.statusCode = statusCode;
    this.cause = cause;
  }
}

export const askAI = async (messages: Message[]): Promise<string> => {
  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0)
      throw new Error("Message array is empty");

    if (!process.env.OPENROUTER_API_URL || !process.env.OPENROUTER_API_KEY)
      throw new Error("Internal Server Error");

    const response = await fetch(process.env.OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: messages,
      }),
    });

    const data: OpenRouterResponse = await response.json();

    if (!response.ok) {
      throw new OpenRouterError("OpenRouter API Error", response.status, data);
    }

    const content = data?.choices?.[0]?.message?.content;

    if (!content?.trim()) throw new Error("AI returned empty response.");

    return content;
  } catch (error) {
    if (error instanceof OpenRouterError)
      throw new OpenRouterError(
        error.message,
        error.statusCode === 429 ? 429 : 502,
        error,
      );

    throw new OpenRouterError("OpenRouter API Error", 502, error);
  }
};
