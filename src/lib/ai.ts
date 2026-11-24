export type ExtractedVehicle = {
  plaka?: string;
  marka?: string;
  model?: string;
  yil?: number;
};

function bufferToBase64(buffer: Buffer) {
  return buffer.toString("base64");
}

export async function geminiExtract(
  buffer: Buffer,
  mimeType: string
): Promise<ExtractedVehicle> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY yapılandırılmamış.");

  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Bu ruhsat fotoğrafından plaka, marka, model ve model yılını çıkar. Sadece JSON döndür: {\"plaka\":\"\",\"marka\":\"\",\"model\":\"\",\"yil\":0}. Bilinmiyorsa boş bırak.",
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: bufferToBase64(buffer),
                },
              },
            ],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini hata: ${res.status} ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : "{}");
}

export async function openaiExtract(
  buffer: Buffer,
  mimeType: string
): Promise<ExtractedVehicle> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY yapılandırılmamış.");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Bu ruhsat fotoğrafından plaka, marka, model ve model yılını çıkar. Sadece JSON döndür: {\"plaka\":\"\",\"marka\":\"\",\"model\":\"\",\"yil\":0}. Bilinmiyorsa boş bırak.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${bufferToBase64(buffer)}`,
              },
            },
          ],
        },
      ],
      max_tokens: 200,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI hata: ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "{}";
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : "{}");
}

export function providerForPlan(plan: string) {
  if (process.env.AI_PROVIDER === "openai") return "openai";
  if (process.env.AI_PROVIDER === "gemini") return "gemini";
  return plan === "PREMIUM" ? "openai" : "gemini";
}

export async function plakaExtract(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  // Gemini öncelikli (ücretsiz)
  if (apiKey) {
    const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Bu fotoğraftaki araç plakasını oku. Sadece plaka metnini döndür (ör. 34 ABC 123). Başka hiçbir şey yazma.",
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: buffer.toString("base64"),
                  },
                },
              ],
            },
          ],
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini hata: ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return text.trim().replace(/[^A-Z0-9 ]/gi, "").trim();
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Bu fotoğraftaki araç plakasını oku. Sadece plaka metnini döndür (ör. 34 ABC 123).",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${buffer.toString("base64")}`,
                },
              },
            ],
          },
        ],
        max_tokens: 50,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI hata: ${res.status}`);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";
    return text.trim().replace(/[^A-Z0-9 ]/gi, "").trim();
  }

  throw new Error("AI servisi yapılandırılmamış.");
}