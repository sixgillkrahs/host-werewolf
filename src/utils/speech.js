// Tiện ích giọng nói và âm thanh cho Ma Sói Một Đêm

// 1. Web Audio API - Bộ tạo âm thanh nhạc cụ
let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  return audioCtx;
};

// Phát tiếng chuông cảnh báo (Gong rùng rợn) bắt đầu đêm
export const playDeepBell = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const time = ctx.currentTime;
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(110, time); // A2
    osc.frequency.linearRampToValueAtTime(55, time + 2.5);

    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(55, time); // A1
    subOsc.frequency.linearRampToValueAtTime(27.5, time + 2.5);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(200, time);

    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 2.5);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    subOsc.start(time);
    osc.stop(time + 2.5);
    subOsc.stop(time + 2.5);
  } catch (e) {
    console.error("Lỗi âm thanh bell:", e);
  }
};

// Phát tiếng chuông thanh mảnh (Chime) khi đổi vai trò
export const playChime = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const time = ctx.currentTime;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, time); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, time + 0.8);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(659.25, time); // E5
    osc2.frequency.exponentialRampToValueAtTime(1318.51, time + 0.8);

    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc2.start(time);
    osc.stop(time + 0.8);
    osc2.stop(time + 0.8);
  } catch (e) {
    console.error("Lỗi âm thanh chime:", e);
  }
};

// Phát âm thanh tích tắc đồng hồ (khi đếm ngược)
export const playTick = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const time = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, time);
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.05);
  } catch (e) {
    console.error("Lỗi âm thanh tick:", e);
  }
};

// Phát tiếng còi kết thúc thảo luận
export const playGong = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const time = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(110, time + 1.2);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 1.2);
  } catch (e) {
    console.error("Lỗi âm thanh gong:", e);
  }
};

// 2. Text-to-Speech Engine
let currentUtterance = null;

// Lấy danh sách các giọng nói hỗ trợ tiếng Việt
export const getVietnameseVoices = () => {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  
  const voices = window.speechSynthesis.getVoices();
  // Lọc giọng nói tiếng Việt (mã ngôn ngữ vi-VN hoặc vi)
  return voices.filter(voice => 
    voice.lang.toLowerCase().includes("vi")
  );
};

// Đọc một câu thoại với cấu hình tùy chọn
export const speak = (text, options = {}, onStart = null, onEnd = null) => {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    // Nếu không hỗ trợ TTS, tự động hoàn thành ngay lập tức
    if (onStart) onStart();
    setTimeout(() => {
      if (onEnd) onEnd();
    }, 1000);
    return;
  }

  // Hủy âm thanh đang phát trước đó
  window.speechSynthesis.cancel();

  const { voiceURI, rate = 1.0, pitch = 1.0, volume = 1.0 } = options;

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.rate = rate;
  currentUtterance.pitch = pitch;
  currentUtterance.volume = volume;

  // Tìm giọng nói tương ứng
  const voices = window.speechSynthesis.getVoices();
  const selectedVoice = voices.find(v => v.voiceURI === voiceURI);
  if (selectedVoice) {
    currentUtterance.voice = selectedVoice;
  } else {
    // Fallback: Tìm giọng tiếng Việt đầu tiên
    const viVoices = voices.filter(v => v.lang.toLowerCase().includes("vi"));
    if (viVoices.length > 0) {
      currentUtterance.voice = viVoices[0];
    }
  }

  if (onStart) {
    currentUtterance.onstart = onStart;
  }

  currentUtterance.onend = (event) => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  currentUtterance.onerror = (event) => {
    console.error("Lỗi phát giọng nói:", event);
    currentUtterance = null;
    if (onEnd) onEnd(); // Vẫn gọi để tránh tắc nghẽn game loop
  };

  window.speechSynthesis.speak(currentUtterance);
};

// Hủy phát giọng nói hiện tại
export const stopSpeaking = () => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
};

// Tạm dừng phát giọng nói
export const pauseSpeaking = () => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.pause();
  }
};

// Tiếp tục phát giọng nói
export const resumeSpeaking = () => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.resume();
  }
};
