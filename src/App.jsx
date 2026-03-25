import { useState } from "react";
import axios from "axios";

function App() {
  const [image, setImage] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // 이미지 파일 선택 시 미리보기 처리 (여기서는 단순하게 URL로 가정하거나 클라우드 업로드 필요)
  // 테스트를 위해 직접 이미지 URL을 입력받거나 외부 호스팅을 권장합니다.
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result); // Base64 변환
    reader.readAsDataURL(file);
  };

  const generateVideo = async () => {
    if (!image || !prompt) return alert("이미지와 프롬프트를 입력하세요!");
    setLoading(true);
    try {
      // 로컬 테스트 시 /api/generate 호출이 404가 나면 'vercel dev'로 실행하세요.
      const res = await axios.post("/api/generate", {
        imageUrl: image,
        userPrompt: prompt,
      });
      setVideoUrl(res.data.videoUrl);
    } catch (err) {
      console.error(err);
      alert("생성 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h2>🎬 Kling 2.6 AI Video Maker</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
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