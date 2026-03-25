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
    const result = await fal.subscribe("fal-ai/kling-video/v2.6/pro/image-to-video", {
      input: {
        image_url: imageUrl,
        prompt: `STRICT STYLE ADHERENCE: Maintain the exact art style and character design. Action: ${userPrompt}`,
        duration: "5",
      },
      logs: true,
    });

    // 3. [해결] 로그를 바탕으로 수정한 확실한 URL 추출 로직
    const finalVideoUrl = result.data?.video?.url || result.video?.url || result.video_url || result.url;

    if (!finalVideoUrl) {
      console.error("!!! 주소 추출 실패 !!! 전체 데이터:", JSON.stringify(result, null, 2));
      return res.status(500).json({ error: "영상을 만들었지만 주소를 못 찾음" });
    }

    console.log("최종 영상 URL:", finalVideoUrl);
    return res.status(200).json({ videoUrl: finalVideoUrl });

  } catch (error) {
    console.error("!!! SERVER ERROR !!!", error);
    return res.status(500).json({ error: error.message });
  }
}