import React, { useState, useEffect } from "react";
import { Volume2, Play, Square, Settings, Info } from "lucide-react";
import { speak, stopSpeaking } from "../utils/speech";

const AudioSettings = ({ audioConfig, setAudioConfig }) => {
  const [voices, setVoices] = useState([]);
  const [isTestSpeaking, setIsTestSpeaking] = useState(false);
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  useEffect(() => {
    // Tải danh sách giọng nói từ hệ thống
    const loadVoices = () => {
      const allVoices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
      const viVoices = allVoices.filter(v => v.lang.toLowerCase().includes("vi"));
      
      let finalVoices = [];

      // Nếu bật "Hiển thị tất cả ngôn ngữ"
      if (showAllLanguages) {
        finalVoices = allVoices;
      } else {
        finalVoices = viVoices;
      }

      setVoices(finalVoices);

      // Nếu chưa chọn giọng đọc
      if (!audioConfig.voiceURI && finalVoices.length > 0) {
        setAudioConfig(prev => ({ ...prev, voiceURI: finalVoices[0].voiceURI }));
      }
    };

    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [audioConfig.voiceURI, setAudioConfig, showAllLanguages]);

  const handleTestVoice = () => {
    if (isTestSpeaking) {
      stopSpeaking();
      setIsTestSpeaking(false);
      return;
    }

    setIsTestSpeaking(true);
    speak(
      "Xin chào, đây là giọng đọc thử nghiệm cho ứng dụng quản trò Ma Sói một đêm. Chúc các bạn chơi game vui vẻ!",
      audioConfig,
      null,
      () => setIsTestSpeaking(false)
    );
  };

  const handleSliderChange = (key, value) => {
    setAudioConfig(prev => ({ ...prev, [key]: parseFloat(value) }));
  };

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm bg-white">
      <div className="flex items-center gap-3 mb-5">
        <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-[#10b981]" />
        <h2 className="text-sm sm:text-lg font-extrabold tracking-wide text-slate-800 uppercase">CẤU HÌNH GIỌNG NÓI</h2>
      </div>

      <div className="space-y-4">
        {/* Chọn giọng đọc */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
              Giọng đọc (TTS Voice)
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-gray-500 font-bold select-none">
              <input
                type="checkbox"
                checked={showAllLanguages}
                onChange={(e) => setShowAllLanguages(e.target.checked)}
                className="rounded border-gray-300 text-[#10b981] focus:ring-[#10b981] w-3 h-3 cursor-pointer"
              />
              Tất cả ngôn ngữ
            </label>
          </div>
          
          <select
            value={audioConfig.voiceURI || ""}
            onChange={(e) => setAudioConfig(prev => ({ ...prev, voiceURI: e.target.value }))}
            className="w-full bg-white text-slate-800 border border-gray-250 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#10b981] transition-all cursor-pointer shadow-sm hover:border-gray-300"
          >
            {voices.map(voice => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang}) {voice.localService ? "[Offline]" : ""}
              </option>
            ))}
            {voices.length === 0 && (
              <option value="">Không có giọng nói nào</option>
            )}
          </select>
        </div>

        {/* Cấu hình các thanh trượt */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 sm:gap-5">
          {/* Tốc độ đọc (Rate) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">
              <span>Tốc độ đọc</span>
              <span className="font-mono text-[#059669]">{audioConfig.rate}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={audioConfig.rate}
              onChange={(e) => handleSliderChange("rate", e.target.value)}
              className="cursor-pointer"
            />
          </div>

          {/* Cao độ (Pitch) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">
              <span>Cao độ giọng</span>
              <span className="font-mono text-[#059669]">{audioConfig.pitch}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={audioConfig.pitch}
              onChange={(e) => handleSliderChange("pitch", e.target.value)}
              className="cursor-pointer"
            />
          </div>

          {/* Âm lượng (Volume) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider">
              <span>Âm lượng</span>
              <span className="font-mono text-[#059669]">{Math.round(audioConfig.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioConfig.volume}
              onChange={(e) => handleSliderChange("volume", e.target.value)}
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* Nút test giọng đọc */}
        <button
          onClick={handleTestVoice}
          className={`w-full py-2.5 sm:py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all active:scale-[0.99] shadow-sm ${
            isTestSpeaking
              ? "bg-[#ef4444] text-white hover:bg-opacity-90 border-none"
              : "bg-white text-[#10b981] border border-[#10b981] hover:bg-[#10b981] hover:text-white"
          }`}
        >
          {isTestSpeaking ? (
            <>
              <Square className="w-4 h-4 fill-current" /> DỪNG ĐỌC THỬ
            </>
          ) : (
            <>
              <Volume2 className="w-4.5 h-4.5" /> ĐỌC THỬ GIỌNG NÓI
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AudioSettings;
