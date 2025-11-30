
// ================================
// FirePro One AI - Final Server.js
// نسخة جاهزة 100% ومتوافقة مع Render
// ================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// السماح بالوصول من كل النطاقات
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// OpenAI Client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =============================
// مسار فحص السيرفر
// =============================
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "FirePro One AI server is running",
    port: PORT,
  });
});

// =============================
// دالة معالجة طلبات المساعد
// =============================
async function handleAssistantRequest(req, res) {
  try {
    const { message, lang = "ar", mode = "chat", standard = "nfpa" } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "رسالة غير صالحة." });
    }

    // إعداد النظام
    const systemPrompt =
      lang === "ar"
        ? `أنت مساعد خبير في أنظمة إنذار الحريق. جاوب بإيجاز ووضوح.
استخدم المعايير (${standard.toUpperCase()}) عند الحاجة.`
        : `You are an expert assistant for fire alarm systems.
Provide clear and concise answers using safety code (${standard.toUpperCase()}).`;

    // إرسال الطلب إلى OpenAI
    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const replyText =
      completion.output?.[0]?.content?.[0]?.text ||
      (lang === "ar"
        ? "تم إنشاء الرد ولكن لم يتم العثور على نص مناسب."
        : "A reply was generated but no text was found.");

    return res.json({ reply: replyText });
  } catch (error) {
    console.error("❌ Error in /chat:", error);
    return res.status(500).json({
      error:
        "حدث خطأ داخلي أثناء الاتصال بنظام الذكاء الاصطناعي. يرجى المحاولة لاحقاً.",
    });
  }
}

// =============================
// مسار /chat الرسمي
// =============================
app.post("/chat", handleAssistantRequest);

// =============================
// تشغيل السيرفر
// =============================
app.listen(PORT, () => {
  console.log("======================================");
  console.log(🔥 FirePro One AI server running on: ${PORT});
  console.log("======================================");
});
