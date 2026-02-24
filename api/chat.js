import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://your-vercel-domain.vercel.app",
        "X-Title": "SheetSnap"
      }
    });

    const { messages } = req.body;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages,
      temperature: 0.3
    });

    res.status(200).json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("OpenRouter Error:", error);
    res.status(500).json({ error: "AI error" });
  }
}