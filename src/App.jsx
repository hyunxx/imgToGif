import { useState } from "react";
import axios from "axios";
import { fal } from "@fal-ai/client";
fal.config({
  credentials: import.meta.env.VITE_FAL_KEY,
});

// 클라이언트 측에서도 fal 키를 일시적으로 사용해야 할 수 있습니다.
// (Vite 환경변수: VITE_FAL_KEY)
function App() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  

  const generateVideo = async () => {
    if (!file || !prompt) return alert("이미지와 프롬프트를 입력하세요!");
    setLoading(true);

    try {
      // 1. fal.ai 서버에 로컬 파일을 먼저 업로드하고 URL을 받습니다.
      // 이 함수가 로컬 파일을 fal.ai의 CDN 주소로 바꿔줍니다.
      const uploadResult = await fal.storage.upload(file);
      const imageUrl = uploadResult; 
      console.log("업로드된 이미지 URL:", imageUrl);
      console.log("업로드 결과 전체 데이터:", uploadResult);

      // 2. 이제 서버(/api/generate)에는 이미지 파일이 아닌 'URL 문자열'만 보냅니다.
      const res = await axios.post("/api/generate", {
        imageUrl: imageUrl, // 문자열 전달
        userPrompt: prompt,
      });

      setVideoUrl(res.data.videoUrl);
    } catch (err) {
      console.error(err);
      alert("생성 실패!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h2>🎬 Kling 2.6 AI Video Maker</h2>
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
      <br /><br />
      <textarea 
        placeholder="어떤 움직임을 주고 싶나요?" 
        value={prompt} 
        onChange={(e) => setPrompt(e.target.value)}
        style={{ width: "100%", height: "100px" }}
      />
      <br />
      <button onClick={generateVideo} disabled={loading} style={{ padding: "10px 20px" }}>
        {loading ? "영상 생성 중 (약 1~2분 소요)..." : "영상 만들기"}
      </button>

      {videoUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>결과 영상:</h3>
          <video src={videoUrl} controls width="600" />
        </div>
      )}
    </div>
  );
}

export default App;