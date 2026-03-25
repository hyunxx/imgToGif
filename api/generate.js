import { GoogleGenerativeAI } from "@google/generative-ai";
import { fal } from "@fal-ai/client";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // 1. 데이터가 잘 들어왔는지 확인 (터미널 로그 확인용)
  const { imageUrl, userPrompt } = req.body;
  console.log("--- 백엔드 수신 데이터 ---");
  console.log("이미지 URL:", imageUrl);
  console.log("사용자 프롬프트:", userPrompt);

  if (!imageUrl || !userPrompt) {
    return res.status(400).json({ error: "데이터가 누락되었습니다." });
  }

  try {
    // 2. Gemini 호출
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const promptRefiner = `Write a cinematic English prompt for Kling AI video model based on this description: ${userPrompt}. The image is the start frame.`;
    const geminiResult = await model.generateContent(promptRefiner);
    const refinedPrompt = geminiResult.response.text();
    console.log("Gemini 강화 프롬프트:", refinedPrompt);

    // 3. fal.ai Kling 2.6 Pro 호출 (안전하게 duration "5" 사용)
    const result = await fal.subscribe("fal-ai/kling-video/v2.6/pro/image-to-video", {
      input: {
        image_url: imageUrl,
        prompt: refinedPrompt,
        duration: "5", // 3 대신 5로 고정
      },
    });

    console.log("Kling 생성 완료!");
    return res.status(200).json({ videoUrl: result.video.url });

  } catch (error) {
    // 🔥 터미널에 에러 내용을 아주 자세히 찍습니다.
    console.error("!!! SERVER ERROR !!!");
    console.error(error); 
    return res.status(500).json({ error: error.message });
  }
}