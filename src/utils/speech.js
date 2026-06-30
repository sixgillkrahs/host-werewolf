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

  const { voiceURI, rate = 1.0, pitch = 1.0, volume = 1.0 } = options;

  // 1. Sử dụng dịch vụ Google Translate TTS Online miễn phí
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

// 3. Âm thanh nền ban đêm (Night Ambient Music) tự tổng hợp bằng Web Audio API
let ambientSource = null;
let ambientGain = null;

export const startNightAmbient = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    // Dừng âm thanh nền cũ nếu đang chạy
    stopNightAmbient();

    // A. TẠO TIẾNG GIÓ HÚ (White Noise + Bandpass Filter + LFO)
    const bufferSize = ctx.sampleRate * 2; // 2 giây buffer
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    // Bộ lọc gió (Filter) để tạo tiếng rầm rì ấm áp
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "lowpass";
    windFilter.frequency.setValueAtTime(280, ctx.currentTime);
    windFilter.Q.setValueAtTime(3.0, ctx.currentTime); // Hơi vang nhẹ tạo cảm giác gió rít

    // LFO điều chỉnh tần số lọc để tạo hiệu ứng gió thổi mạnh yếu ngẫu nhiên
    const windFilterLfo = ctx.createOscillator();
    windFilterLfo.type = "sine";
    windFilterLfo.frequency.setValueAtTime(0.08, ctx.currentTime); // 1 chu kỳ ~ 12 giây
    const windFilterLfoGain = ctx.createGain();
    windFilterLfoGain.gain.setValueAtTime(120, ctx.currentTime);

    windFilterLfo.connect(windFilterLfoGain);
    windFilterLfoGain.connect(windFilter.frequency);

    // Điều khiển âm lượng gió bằng một LFO khác
    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.03, ctx.currentTime);

    const windGainLfo = ctx.createOscillator();
    windGainLfo.type = "sine";
    windGainLfo.frequency.setValueAtTime(0.15, ctx.currentTime); // Dao động âm lượng nhanh hơn một chút
    const windGainLfoGain = ctx.createGain();
    windGainLfoGain.gain.setValueAtTime(0.015, ctx.currentTime);

    windGainLfo.connect(windGainLfoGain);
    windGainLfoGain.connect(windGain.gain);

    noiseNode.connect(windFilter);
    windFilter.connect(windGain);

    // B. TẠO TIẾNG RUNG MA QUÁI (Detuned Low Oscillators + Lowpass Filter)
    const droneOsc1 = ctx.createOscillator();
    droneOsc1.type = "sawtooth";
    droneOsc1.frequency.setValueAtTime(55.0, ctx.currentTime); // Nốt A1 (~55Hz) tạo độ trầm

    const droneOsc2 = ctx.createOscillator();
    droneOsc2.type = "triangle";
    droneOsc2.frequency.setValueAtTime(55.6, ctx.currentTime); // Lệch tần số một chút để tạo chorus tự nhiên

    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = "lowpass";
    droneFilter.frequency.setValueAtTime(100, ctx.currentTime); // Chỉ giữ dải trầm cực sâu

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.06, ctx.currentTime);

    droneOsc1.connect(droneFilter);
    droneOsc2.connect(droneFilter);
    droneFilter.connect(droneGain);

    // C. KẾT NỐI VÀO MASTER GAIN
    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0.0, ctx.currentTime);
    // Tăng âm lượng từ từ (Fade in) trong 3 giây để chuyển cảnh mượt mà
    ambientGain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 3.0);

    windGain.connect(ambientGain);
    droneGain.connect(ambientGain);
    ambientGain.connect(ctx.destination);

    // Khởi động các nguồn phát âm thanh
    noiseNode.start(0);
    windFilterLfo.start(0);
    windGainLfo.start(0);
    droneOsc1.start(0);
    droneOsc2.start(0);

    // Lưu trữ các nodes để tắt sau này
    ambientSource = {
      noiseNode,
      windFilterLfo,
      windGainLfo,
      droneOsc1,
      droneOsc2
    };
  } catch (e) {
    console.error("Lỗi khi phát âm thanh nền ban đêm:", e);
  }
};

export const stopNightAmbient = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx || !ambientGain) return;

    const time = ctx.currentTime;
    // Giảm âm lượng từ từ (Fade out) trong 1.8 giây
    ambientGain.gain.setValueAtTime(ambientGain.gain.value, time);
    ambientGain.gain.linearRampToValueAtTime(0.0, time + 1.8);

    const oldSource = ambientSource;
    const oldGain = ambientGain;

    ambientSource = null;
    ambientGain = null;

    // Dọn dẹp tài nguyên sau khi fade out hoàn tất
    setTimeout(() => {
      if (oldSource) {
        try {
          oldSource.noiseNode.stop();
          oldSource.windFilterLfo.stop();
          oldSource.windGainLfo.stop();
          oldSource.droneOsc1.stop();
          oldSource.droneOsc2.stop();
        } catch (e) {}
      }
      if (oldGain) {
        try {
          oldGain.disconnect();
        } catch (e) {}
      }
    }, 2000);
  } catch (e) {
    console.error("Lỗi khi dừng âm thanh nền ban đêm:", e);
  }
};

// Điều tiết âm lượng nhạc nền (Audio Ducking)
export const duckNightAmbient = (isDucked) => {
  try {
    const ctx = getAudioContext();
    if (!ctx || !ambientGain) return;

    const time = ctx.currentTime;
    ambientGain.gain.setValueAtTime(ambientGain.gain.value, time);
    // Nhỏ đi khi có giọng quản trò (duck về 0.15) và to lên khi quản trò im lặng (về lại 0.7)
    ambientGain.gain.linearRampToValueAtTime(isDucked ? 0.15 : 0.7, time + 0.8);
  } catch (e) {
    console.error("Lỗi điều tiết âm lượng nhạc nền ban đêm:", e);
  }
};
