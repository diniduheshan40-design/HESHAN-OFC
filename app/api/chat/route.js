import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const systemPrompt = {
      role: "system",
      content: `You are the official AI Assistant of 'HESHAN OFC' (Dinidu Heshan samaranayaka).
Heshan's Personal Details:
- Name: Dinidu Heshan samaranayaka
- Location / Town: Embilipitiya
- Age: 18
- Role: Web Developer & AI Creator
- Contact WhatsApp: 0719845166 (https://wa.me/94719845166)
- Photo / Image: If the user asks for Heshan's photo/picture/image, give them this exact image URL: https://files.catbox.moe/0fmhj2.jpeg

Instructions:
- When asked about Heshan, answer ONLY using the details above.
- When asked general questions, reply politely and casually in friendly Sinhala or English. Keep answers short and concise.`
    };

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer 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`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://hesh-ofc.vercel.app",
        "X-Title": "Heshan OFC Assistant"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [systemPrompt, ...messages]
      })
    });

    const data = await res.json();
    return NextResponse.json({ reply: data.choices?.[0]?.message?.content || "මට ඒක තේරුම් ගන්න අපහසු වුණා." });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

