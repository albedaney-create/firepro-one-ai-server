
// =============== FirePro One - AI Assistant (Clean Server) ===============
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const OpenAI = require("openai");

// ==== تهيئة عميل OpenAI ====
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ==== إعداد السيرفر ====
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==== دالة المساعد ====
async function handleAssistantRequest(req, res) {
  try {
    const body = req.body || {};

    const message =
      body.message ||
      body.prompt ||
      body.text ||
      body.input ||
      body.question;

    const mode = body.mode || body.standard || body.code || "nfpa"; // nfpa أو saudi

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "الرسالة مطلوبة لإتمام رد المساعد.",
      });
    }

    let systemPrompt =
      "أنت مساعد ذكي متخصص في أنظمة إنذار ومكافحة الحريق، تجيب باللغة العربية المبسطة.";

    if (mode === "nfpa") {
      systemPrompt =
        "أنت خبير في أنظمة إنذار ومكافحة الحريق وفق معيار NFPA 72. تجاوب بالعربية المبسطة، وتوضح المتطلبات الفنية قدر الإمكان.";
    } else if (mode === "saudi") {
      systemPrompt =
        "أنت خبير في الكود السعودي للحماية من الحريق والسلامة. تجاوب بالعربية المبسطة، وتوضح المتطلبات النظامية قدر الإمكان.";
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.4,
    });

    const answer = completion.choices?.[0]?.message?.content || "";
    return res.json({ answer });
  } catch (error) {
    console.error("Error in assistant handler:", error);
    return res.status(500).json({
      error: "حدث خطأ أثناء معالجة طلب المساعد.",
    });
  }
}

// ==== مسار الـ API ====
app.post("/api/chat", handleAssistantRequest);

// ==== تشغيل السيرفر ====
app.listen(PORT, () => {
  console.log("FirePro One server running on port:", PORT);
});

