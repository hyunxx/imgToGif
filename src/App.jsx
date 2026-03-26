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
  const [errorMessage, setErrorMessage] = useState("");

  const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );

  const generateVideo = async () => {
    if (!file || !prompt) return alert("이미지와 프롬프트를 입력하세요!");
    setLoading(true);
    setVideoUrl("");
    setErrorMessage(""); 
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
    } catch (error) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      if (status === 402) {
        setErrorMessage("💰 크레딧 부족: 현재 서비스의 잔여 크레딧이 없습니다. 다브류에게 문의주세요 ㅠ.ㅠ");
      } 
      
      else if (status === 500 && errorData?.error === "영상을 만들었지만 주소를 못 찾음") {
        setErrorMessage("🔍 주소 추출 실패: 영상 생성은 완료되었으나 주소를 가져오지 못했습니다. 다브류에게 문의주세요");
      } 
      else if (status === 500) {
        setErrorMessage("⚠️ 생성 오류: AI 모델이 이미지를 처리하는 중 오류가 발생했습니다. 다브류에게 문의주세요");
      } 
      else {
        setErrorMessage("🌐 연결 오류: 서버와 통신이 원활하지 않습니다. 인터넷 연결을 확인해 주세요.");
      }
    
      console.error("에러 상세:", error.response?.data);
      alert(setErrorMessage);
      setStatus("에러 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>🎬 상영관 W</h1>
      <p style={{fontSize: "12px"}}>상영관 W에 오신것을 환영합니다! 이미지와 프롬프트를 넣어주시면 1-2분정도 소요 후 5초의 영상을 뽑아드립니다. <br /> 즐겁게 이용해주세요! </p>
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
        문제가 있을경우 다브류에게 연락주세요!
        가로 / 세로 모두 가능합니다. <br/>
        <strong>PC환경에서 사용을 권장합니다.</strong>
      </p>
    </div>
      <div style={{ marginBottom: "20px",display:"flex",justifyContent:"center",flexDirection:"column",alignItems:"center" }}>
        <div className="fileContainer">
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

      {errorMessage && (
        <div style={{
          backgroundColor: '#fff5f5',
          border: '1px solid #feb2b2',
          color: '#c53030',
          padding: '12px',
          borderRadius: '8px',
          margin: '20px auto',
          maxWidth: '500px',
          fontSize: '14px',
          textAlign: 'left'
        }}>
          <strong>알림:</strong> {errorMessage}
          
          {/* 주소 추출 실패 시에만 보여주는 특별 안내 */}
          {errorMessage.includes("주소 추출 실패") && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#742a2a' }}>
              * 생성 기록은 서버에 남아있을 수 있습니다. 새로고침 후 다시 시도하기 전 관리자에게 메시지를 남겨주세요.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;