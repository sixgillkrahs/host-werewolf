import React, { useState, useEffect } from "react";
import { Volume2, Play, Square, Settings, Info } from "lucide-react";
import { getVietnameseVoices, speak, stopSpeaking } from "../utils/speech";

const AudioSettings = ({ audioConfig, setAudioConfig }) => {
  const [voices, setVoices] = useState([]);
  const [isTestSpeaking, setIsTestSpeaking] = useState(false);

  useEffect(() => {
    // Tải danh sách giọng nói tiếng Việt
    const loadVoices = () => {
      const allVoices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
      // Lọc tiếng Việt hoặc hiển thị tất cả nếu không thấy tiếng Việt để người dùng tự chọn
      const viVoices = allVoices.filter(v => v.lang.toLowerCase().includes("vi"));
      if (viVoices.length > 0) {
        setVoices(viVoices);
        // Chọn giọng tiếng Việt đầu tiên làm mặc định nếu chưa chọn
        if (!audioConfig.voiceURI) {
          setAudioConfig(prev => ({ ...prev, voiceURI: viVoices[0].voiceURI }));
        }
      } else {
        // Fallback hiển thị tất cả các giọng nói có sẵn
        setVoices(allVoices);
        if (!audioConfig.voiceURI && allVoices.length > 0) {
          setAudioConfig(prev => ({ ...prev, voiceURI: allVoices[0].voiceURI }));
        }
      }
    };

    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [audioConfig.voiceURI, setAudioConfig]);

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
    <div className="glass-panel p-6 rounded-2xl border border-[var(--color-neon-blue-dim)] shadow-[0_0_20px_rgba(102,252,241,0.1)]">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-[var(--color-neon-blue)]" />
        <h2 className="text-xl font-bold tracking-wide text-white">CẤU HÌNH GIỌNG NÓI</h2>
      </div>

      <div className="space-y-5">
        {/* Chọn giọng đọc */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-400 flex items-center justify-between">
            <span>Giọng đọc (TTS Voice)</span>
            {voices.length === 0 && (
              <span className="text-xs text-amber-500 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Không thấy giọng tiếng Việt mặc định
              </span>
            )}
          </label>
          <select
            value={audioConfig.voiceURI || ""}
            onChange={(e) => setAudioConfig(prev => ({ ...prev, voiceURI: e.target.value }))}
            className="w-full bg-[#1f2833] text-white border border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:border-[var(--color-neon-blue)] transition-all cursor-pointer"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Tốc độ đọc (Rate) */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Tốc độ đọc</span>
              <span className="font-mono text-[var(--color-neon-blue)]">{audioConfig.rate}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={audioConfig.rate}
              onChange={(e) => handleSliderChange("rate", e.target.value)}
              className="accent-[var(--color-neon-blue)] cursor-pointer"
            />
          </div>

          {/* Cao độ (Pitch) */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Cao độ giọng</span>
              <span className="font-mono text-[var(--color-neon-blue)]">{audioConfig.pitch}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={audioConfig.pitch}
              onChange={(e) => handleSliderChange("pitch", e.target.value)}
              className="accent-[var(--color-neon-blue)] cursor-pointer"
            />
          </div>

          {/* Âm lượng (Volume) */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Âm lượng</span>
              <span className="font-mono text-[var(--color-neon-blue)]">{Math.round(audioConfig.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioConfig.volume}
              onChange={(e) => handleSliderChange("volume", e.target.value)}
              className="accent-[var(--color-neon-blue)] cursor-pointer"
            />
          </div>
        </div>

        {/* Nút test giọng đọc */}
        <button
          onClick={handleTestVoice}
          className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
            isTestSpeaking
              ? "bg-[var(--color-neon-red)] text-white hover:bg-opacity-80 shadow-[0_0_15px_rgba(255,75,92,0.4)]"
              : "bg-transparent text-[var(--color-neon-blue)] border border-[var(--color-neon-blue)] hover:bg-[var(--color-neon-blue)] hover:text-[#0b0c10] shadow-[inset_0_0_10px_rgba(102,252,241,0.1)]"
          }`}
        >
          {isTestSpeaking ? (
            <>
              <Square className="w-4 h-4 fill-current" /> Dừng Đọc Thử
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" /> Phát Thử Giọng Nói
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AudioSettings;
