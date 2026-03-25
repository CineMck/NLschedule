import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const { prompt, size, style, quality } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "A prompt is required" },
        { status: 400 }
      );
    }

    if (prompt.length > 4000) {
      return NextResponse.json(
        { error: "Prompt must be under 4000 characters" },
        { status: 400 }
      );
    }

    const validSizes = ["1024x1024", "1792x1024", "1024x1792"] as const;
    const validStyles = ["vivid", "natural"] as const;
    const validQualities = ["standard", "hd"] as const;

    const imageSize = validSizes.includes(size) ? size : "1024x1024";
    const imageStyle = validStyles.includes(style) ? style : "vivid";
    const imageQuality = validQualities.includes(quality) ? quality : "standard";

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt.trim(),
      n: 1,
      size: imageSize,
      style: imageStyle,
      quality: imageQuality,
    });

    const imageUrl = response.data?.[0]?.url;
    const revisedPrompt = response.data?.[0]?.revised_prompt;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image was generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: imageUrl,
      revisedPrompt,
    });
  } catch (error: unknown) {
    console.error("Image generation error:", error);

    if (error instanceof OpenAI.APIError) {
      const status = error.status || 500;
      const message =
        status === 429
          ? "Rate limit reached. Please wait a moment and try again."
          : status === 400
            ? "Your prompt was rejected by the content policy. Please try a different description."
            : "Failed to generate image. Please try again.";
      return NextResponse.json({ error: message }, { status });
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
