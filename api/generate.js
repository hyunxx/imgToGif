import { GoogleGenerativeAI } from "@google/generative-ai";
import { fal } from "@fal-ai/client";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { imageUrl, userPrompt } = req.body;

  try {
    // 1. Gemini로 프롬프트 고도화 (3초 분량의 묘사 포함)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const promptRefiner = `
      입력된 이미지와 사용자의 의도를 바탕으로 Kling AI용 영어 프롬프트를 작성하세요.
      이미지는 시작 프레임입니다. 3초 동안 자연스럽고 역동적인 움직임이 있도록 묘사하세요.
      사용자 의도: ${userPrompt}
    `;
    const geminiResult = await model.generateContent(promptRefiner);
    const refinedPrompt = geminiResult.response.text();

    // 2. fal.ai Kling 2.6 Pro 호출
    const result = await fal.subscribe("fal-ai/kling-video/v2.6/pro/image-to-video", {
      input: {
        image_url: imageUrl,
        prompt: refinedPrompt,
        duration: "3", // 모델 사양에 따라 5초가 기본일 수 있음
        aspect_ratio: "16:9"
      },
    });

    res.status(200).json({ videoUrl: result.video.url, refinedPrompt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}