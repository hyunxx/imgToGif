import { GoogleGenerativeAI } from "@google/generative-ai";
import { fal } from "@fal-ai/client";


export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { imageUrl, userPrompt } = req.body;
  console.log("--- 백엔드 수신 데이터 ---");
  console.log("이미지 URL:", imageUrl);
  console.log("사용자 프롬프트:", userPrompt);

  try {

    console.log("Kling 호출 시작...");
    const result = await fal.subscribe("fal-ai/kling-video/v2.5-turbo/pro/image-to-video", {
      input: {
        image_url: imageUrl,
        prompt: `STRICT STYLE ADHERENCE: Maintain the exact art style and character design. Action: ${userPrompt}`,
        duration: "5",
        generate_audio: false,
      },
      logs: true,
    });

    const finalVideoUrl = result.data?.video?.url || result.video?.url || result.video_url || result.url;

    if (!finalVideoUrl) {
      console.error("!!! 주소 추출 실패 !!! 전체 데이터:", JSON.stringify(result, null, 2));
      return res.status(500).json({ error: "영상을 만들었지만 주소를 못 찾음" });
    }

    console.log("최종 영상 URL:", finalVideoUrl);
    return res.status(200).json({ videoUrl: finalVideoUrl });

  } catch (error) {

      if (error.message.includes("billing") || error.status === 402) {
        return res.status(402).json({ code: "NO_CREDIT", error: "크레딧 부족" });
      }

      return res.status(500).json({ code: "GEN_ERROR", error: "비디오 생성 실패" });
  }
}