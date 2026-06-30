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
let currentOnlineAudio = null; // Quản lý phát âm thanh trực tuyến
let activeUtterances = []; // Giữ tham chiếu để tránh bị Garbage Collected trong Chrome/Safari

// Lấy danh sách các giọng nói hỗ trợ tiếng Việt
export const getVietnameseVoices = () => {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  
  const voices = window.speechSynthesis.getVoices();
  // Lọc giọng nói tiếng Việt (mã ngôn ngữ vi-VN hoặc vi)
  return voices.filter(voice => 
    voice.lang.toLowerCase().includes("vi")
  );
};

// Hàm fallback dùng Web Speech API (hệ thống)
const fallbackToSpeechSynthesis = (text, options, onStart, onEnd) => {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    if (onStart) onStart();
    setTimeout(() => {
      if (onEnd) onEnd();
    }, 1000);
    return;
  }

  const { voiceURI, rate = 1.0, pitch = 1.0, volume = 1.0 } = options;

  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;

  // Lưu tham chiếu để tránh Garbage Collection gây mất sự kiện
  activeUtterances.push(utterance);
  if (activeUtterances.length > 10) {
    activeUtterances.shift();
  }

  const voices = window.speechSynthesis.getVoices();
  const selectedVoice = voices.find(v => v.voiceURI === voiceURI);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  } else {
    const viVoices = voices.filter(v => v.lang.toLowerCase().includes("vi"));
    if (viVoices.length > 0) {
      utterance.voice = viVoices[0];
    }
  }

  let finished = false;
  let failsafeTimer = null;

  const handleEnd = () => {
    if (finished) return;
    finished = true;
    if (failsafeTimer) clearTimeout(failsafeTimer);
    
    const idx = activeUtterances.indexOf(utterance);
    if (idx > -1) activeUtterances.splice(idx, 1);
    
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    handleEnd();
  };

  utterance.onerror = (e) => {
    console.error("Lỗi phát giọng nói hệ thống:", e);
    handleEnd();
  };

  currentUtterance = utterance;

  const estimatedDuration = (text.length * (90 / rate)) + 6000;
  failsafeTimer = setTimeout(() => {
    console.warn("Failsafe offline kích hoạt.");
    handleEnd();
  }, estimatedDuration);

  window.speechSynthesis.speak(utterance);

  setTimeout(() => {
    if (!window.speechSynthesis.speaking || window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, 100);
};

// Đọc một câu thoại với cấu hình tùy chọn
export const speak = (text, options = {}, onStart = null, onEnd = null) => {
  // Hủy âm thanh đang phát trước đó (cả offline và online)
  stopSpeaking();

  const { voiceURI, viettelToken, rate = 1.0, pitch = 1.0, volume = 1.0 } = options;

  // 1. Sử dụng dịch vụ Viettel AI TTS Online
  if (voiceURI && voiceURI.startsWith("viettel-")) {
    const viettelVoiceCode = voiceURI.replace("viettel-", "");
    
    if (!viettelToken) {
      console.warn("Chưa cấu hình Viettel AI Token, chuyển sang Google Online.");
      speak(text, { ...options, voiceURI: "google-translate-online" }, onStart, onEnd);
      return;
    }

    try {
      const url = "https://viettelai.vn/tts/speech_synthesis";
      let viettelSpeed = 1.0;
      if (rate) {
        viettelSpeed = Math.min(Math.max(rate, 0.8), 1.2);
      }

      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "*/*"
        },
        body: JSON.stringify({
          token: viettelToken,
          text: text,
          voice: viettelVoiceCode,
          speed: viettelSpeed,
          tts_return_option: 3
        })
      })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errData = await response.json();
          throw new Error(errData.vi_message || errData.en_message || "Lỗi API Viettel AI");
        }
        
        return response.blob();
      })
      .then((blob) => {
        const audioUrl = URL.createObjectURL(blob);
        currentOnlineAudio = new Audio(audioUrl);
        currentOnlineAudio.volume = volume;

        if (onStart) {
          currentOnlineAudio.onplay = onStart;
        }

        let finished = false;
        let failsafeTimer = null;

        const handleAudioEnd = () => {
          if (finished) return;
          finished = true;
          if (failsafeTimer) clearTimeout(failsafeTimer);
          currentOnlineAudio = null;
          URL.revokeObjectURL(audioUrl);
          if (onEnd) onEnd();
        };

        currentOnlineAudio.onended = handleAudioEnd;
        currentOnlineAudio.onerror = (e) => {
          console.error("Lỗi phát file âm thanh Viettel AI:", e);
          handleAudioEnd();
        };

        failsafeTimer = setTimeout(() => {
          console.warn("Failsafe Viettel AI kích hoạt do hết thời gian chờ.");
          handleAudioEnd();
        }, 25000);

        currentOnlineAudio.play().catch(err => {
          console.error("Trình duyệt chặn tự động phát audio Viettel, dùng Google online:", err);
          handleAudioEnd();
        });
      })
      .catch((err) => {
        console.error("Lỗi gọi API Viettel AI:", err.message);
        speak(text, { ...options, voiceURI: "google-translate-online" }, onStart, onEnd);
      });
      return;
    } catch (e) {
      console.error("Lỗi khởi tạo Viettel AI TTS:", e);
      speak(text, { ...options, voiceURI: "google-translate-online" }, onStart, onEnd);
      return;
    }
  }

  // 2. Sử dụng dịch vụ Google Translate TTS Online miễn phí
  if (voiceURI === "google-translate-online") {
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(text)}`;
      currentOnlineAudio = new Audio(url);
      currentOnlineAudio.playbackRate = rate;
      currentOnlineAudio.volume = volume;

      if (onStart) {
        currentOnlineAudio.onplay = onStart;
      }

      let finished = false;
      let failsafeTimer = null;

      const handleAudioEnd = () => {
        if (finished) return;
        finished = true;
        if (failsafeTimer) clearTimeout(failsafeTimer);
        currentOnlineAudio = null;
        if (onEnd) onEnd();
      };

      currentOnlineAudio.onended = handleAudioEnd;
      currentOnlineAudio.onerror = (e) => {
        console.error("Lỗi phát giọng nói Google Online:", e);
        handleAudioEnd();
      };

      failsafeTimer = setTimeout(() => {
        console.warn("Failsafe Google TTS kích hoạt do hết thời gian chờ.");
        handleAudioEnd();
      }, 20000);

      currentOnlineAudio.play().catch(err => {
        console.error("Trình duyệt chặn tự động phát audio Google, chuyển sang offline:", err);
        fallbackToSpeechSynthesis(text, options, onStart, onEnd);
      });
      return;
    } catch (e) {
      console.error("Lỗi khởi tạo Google TTS:", e);
      fallbackToSpeechSynthesis(text, options, onStart, onEnd);
      return;
    }
  }

  // Mặc định chạy giọng đọc hệ thống
  fallbackToSpeechSynthesis(text, options, onStart, onEnd);
};

// Hủy phát giọng nói hiện tại
export const stopSpeaking = () => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (currentOnlineAudio) {
    currentOnlineAudio.pause();
    currentOnlineAudio = null;
  }
  currentUtterance = null;
};

// Tạm dừng phát giọng nói
export const pauseSpeaking = () => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.pause();
  }
  if (currentOnlineAudio) {
    currentOnlineAudio.pause();
  }
};

// Tiếp tục phát giọng nói
export const resumeSpeaking = () => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.resume();
  }
  if (currentOnlineAudio) {
    currentOnlineAudio.play().catch(e => console.error("Lỗi tiếp tục phát audio online:", e));
  }
};
