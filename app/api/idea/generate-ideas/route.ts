import { askAI, Message } from "@/services/openrouter";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, has } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const canUseAI = has({ plan: "pro" }) || has({ plan: "premium" });
    if (!canUseAI)
      return NextResponse.json(
        { error: "AI idea generation requires Pro or Premium plan" },
        { status: 403 },
      );

    const { businessType, targetAudience } = await req.json();
    if (!businessType || !targetAudience)
      return NextResponse.json(
        { error: "Missing businessType or targetAudience" },
        { status: 400 },
      );

    const messages: Message[] = [
      {
        role: "system",
        content: `You are a social media content ideation assistant.
                    Return only valid JSON.
                    The response must be an object with an "ideas" array.
                    Each item must have: "title" and "description".
                    Generate 3 ideas.
                    Keep titles catchy.
                    Keep descriptions practical and specific.
                    Do not use markdown formatting like **, *, #, or backticks.
                    Return plain text only inside the JSON strings.`,
      },
      {
        role: "user",
        content: `Business type: ${businessType}. Target audience: ${targetAudience}.`,
      },
    ];

    const aiResponse = await askAI(messages);

    const cleaned = aiResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned) as {
      ideas?: { title: string; description: string }[];
    };

    const ideas = Array.isArray(parsed.ideas) ? parsed.ideas.slice(0, 3) : [];

    return NextResponse.json({ ideas });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate ideas" },
      { status: 500 },
    );
  }
}
