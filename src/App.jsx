import { useState } from "react";
import axios from "axios";
import { fal } from "@fal-ai/client";
import "./App.css"
fal.config({
  credentials: import.meta.env.VITE_FAL_KEY,
});
function App() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );

  const generateVideo = async () => {
    if (!file || !prompt) return alert("이미지와 프롬프트를 입력하세요!");
    setLoading(true);
    setVideoUrl("");
    setStatus("이미지를 업로드 중입니다...");

    try {
      // 1. 이미지 업로드
      const uploadedUrl = await fal.storage.upload(file);
      
      setStatus("영상을 생성 중입니다 (약 1~2분 소요)...");

      // 2. 서버 API 호출
      const res = await axios.post("/api/generate", {
        imageUrl: uploadedUrl,
        userPrompt: prompt,
      });

      // 3. 결과 URL 저장
      setVideoUrl(res.data.videoUrl);
      setStatus("생성 완료!");
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
      setStatus("에러 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>🎬 움직이는 짤뽑하기</h1>
      <div 
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        backgroundColor: "#fff3cd", // 연한 노란색 (주의/팁 배경)
        border: "1px solid #ffeeba",
        color: "#856404", // 짙은 갈색 (글자색)
        padding: "10px",
        borderRadius: "5px",
        margin: "15px auto", // 중앙 정렬
        textAlign: "left",
        fontSize: "12px",
        maxWidth: "60%",
      }}
    >

      <WarningIcon color="#856404" />
      
      <p style={{ margin: 0, lineHeight: 1.4 }}>
        <strong>팁:</strong> 한 번에 너무 많은 동작을 요구할 경우,
        그림체가 뭉개지거나 원하는대로 출력이 안 될 수 있습니다. <br />
        비율을 16:9 고정입니다 ^__^ 언젠간 업데이트 하면 바뀔수도.. <br />
        문제가 있을경우 다브류에게 연락주세요
      </p>
    </div>
      <div style={{ marginBottom: "20px",display:"flex",justifyContent:"center",flexDirection:"column",alignItems:"center" }}>
        <div class="fileContainer">
          <p>이미지를 업로드 해주세요</p>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        </div>
        
        <textarea 
          placeholder="움직임 묘사 (예: smiling, walking slowly...)" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ width: "60%", height: "60px" }}
        />
        <br /><br />
        <button onClick={generateVideo} disabled={loading} style={{ padding: "10px 20px" }}>
          {loading ? "생성 중..." : "영상 만들기"}
        </button>
      </div>

      <p>{status}</p>

      {/* 영상 출력 및 다운로드 영역 */}
      {videoUrl && (
        <div style={{ marginTop: "30px" }}>
          <h3>결과 영상</h3>
          <video 
            src={videoUrl} 
            controls 
            style={{ maxWidth: "100%", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}
          />
          <br /><br />
          <a 
            href={videoUrl} 
            download="generated_video.mp4" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              backgroundColor: "#007bff",
              color: "white",
              padding: "10px 20px",
              borderRadius: "5px",
              fontWeight: "bold"
            }}
          >
            📥 영상 다운로드
          </a>
        </div>
      )}
    </div>
  );
}

export default App;