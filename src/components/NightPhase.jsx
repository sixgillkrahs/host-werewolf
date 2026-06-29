import React, { useState, useEffect, useRef } from "react";
import * as Icons from "lucide-react";
import { Play, Pause, SkipForward, X, Moon, Sun } from "lucide-react";
import {
  speak,
  stopSpeaking,
  pauseSpeaking,
  resumeSpeaking,
  playDeepBell,
  playChime,
  playTick
} from "../utils/speech";

const NightPhase = ({ selectedRoles, audioConfig, onExit, onFinished }) => {
  const wakingRoles = selectedRoles
    .filter(r => r.wakesUp)
    .sort((a, b) => a.defaultOrder - b.defaultOrder);

  // States
  const [currentRoleIndex, _setCurrentRoleIndex] = useState(-1); // -1 đại diện cho Bắt đầu (Intro)
  const [phaseState, _setPhaseState] = useState("intro"); // intro, role_wake, role_action, role_sleep, outro
  const [timeLeft, setTimeLeft] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);

  // Refs
  const currentRoleIndexRef = useRef(-1);
  const phaseStateRef = useRef("intro");
  const isPausedRef = useRef(false);

  const setCurrentRoleIndex = (index) => {
    currentRoleIndexRef.current = index;
    _setCurrentRoleIndex(index);
  };

  const setPhaseState = (state) => {
    phaseStateRef.current = state;
    _setPhaseState(state);
  };

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Timers Refs
  const timerRef = useRef(null);
  const introTimeoutRef = useRef(null);
  const nextRoleTimeoutRef = useRef(null);
  const wakeTimeoutRef = useRef(null);
  const sleepTimeoutRef = useRef(null);
  const outroTimeoutRef = useRef(null);
  const outroFinishedTimeoutRef = useRef(null);

  const clearAllTimeouts = () => {
    if (introTimeoutRef.current) clearTimeout(introTimeoutRef.current);
    if (nextRoleTimeoutRef.current) clearTimeout(nextRoleTimeoutRef.current);
    if (wakeTimeoutRef.current) clearTimeout(wakeTimeoutRef.current);
    if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current);
    if (outroTimeoutRef.current) clearTimeout(outroTimeoutRef.current);
    if (outroFinishedTimeoutRef.current) clearTimeout(outroFinishedTimeoutRef.current);
  };

  // Bắt đầu đêm khi mount
  useEffect(() => {
    startNight();
    return () => {
      stopSpeaking();
      clearAllTimeouts();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Bắt đầu đêm
  const startNight = () => {
    clearAllTimeouts();
    if (timerRef.current) clearInterval(timerRef.current);

    setPhaseState("intro");
    setCurrentRoleIndex(-1);
    
    playDeepBell();
    
    introTimeoutRef.current = setTimeout(() => {
      if (phaseStateRef.current !== "intro") return;
      
      speak(
        "Đã đến giờ đi ngủ. Xin mời mọi người hãy nhắm mắt lại.",
        audioConfig,
        () => setIsVoiceSpeaking(true),
        () => {
          setIsVoiceSpeaking(false);
          if (phaseStateRef.current === "intro") {
            nextRoleTimeoutRef.current = setTimeout(() => {
              if (phaseStateRef.current === "intro") {
                nextRole(0);
              }
            }, 2000);
          }
        }
      );
    }, 1500);
  };

  // Chuyển vai trò tiếp theo
  const nextRole = (index) => {
    clearAllTimeouts();
    if (timerRef.current) clearInterval(timerRef.current);

    if (index >= wakingRoles.length) {
      startOutro();
      return;
    }

    setCurrentRoleIndex(index);
    setPhaseState("role_wake");
    const role = wakingRoles[index];

    playChime();

    wakeTimeoutRef.current = setTimeout(() => {
      if (phaseStateRef.current !== "role_wake" || currentRoleIndexRef.current !== index) return;

      speak(
        role.wakeScript || `${role.name} hãy thức dậy và thực hiện hành động.`,
        audioConfig,
        () => setIsVoiceSpeaking(true),
        () => {
          setIsVoiceSpeaking(false);
          if (phaseStateRef.current === "role_wake" && currentRoleIndexRef.current === index) {
            startActionTimer(role, index);
          }
        }
      );
    }, 1000);
  };

  // Đếm ngược hành động
  const startActionTimer = (role, index) => {
    clearAllTimeouts();
    setPhaseState("role_action");
    setTimeLeft(role.defaultDuration);

    let currentSeconds = role.defaultDuration;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (isPausedRef.current) return;

      currentSeconds -= 1;
      setTimeLeft(currentSeconds);

      if (currentSeconds > 0) {
        playTick();
      }

      if (currentSeconds <= 0) {
        clearInterval(timerRef.current);
        if (phaseStateRef.current === "role_action" && currentRoleIndexRef.current === index) {
          sleepRole(role, index);
        }
      }
    }, 1000);
  };

  // Kêu đi ngủ
  const sleepRole = (role, index) => {
    clearAllTimeouts();
    setPhaseState("role_sleep");
    
    speak(
      role.sleepScript || `${role.name} hãy nhắm mắt lại.`,
      audioConfig,
      () => setIsVoiceSpeaking(true),
      () => {
        setIsVoiceSpeaking(false);
        if (phaseStateRef.current === "role_sleep" && currentRoleIndexRef.current === index) {
          sleepTimeoutRef.current = setTimeout(() => {
            if (phaseStateRef.current === "role_sleep" && currentRoleIndexRef.current === index) {
              nextRole(index + 1);
            }
          }, 2000);
        }
      }
    );
  };

  // Bình minh lên
  const startOutro = () => {
    clearAllTimeouts();
    if (timerRef.current) clearInterval(timerRef.current);

    setPhaseState("outro");
    setCurrentRoleIndex(wakingRoles.length);

    playDeepBell();

    outroTimeoutRef.current = setTimeout(() => {
      if (phaseStateRef.current !== "outro") return;

      speak(
        "Mọi người hãy mở mắt ra, trời đã sáng rồi! Hãy bắt đầu thảo luận tìm ra ma sói.",
        audioConfig,
        () => setIsVoiceSpeaking(true),
        () => {
          setIsVoiceSpeaking(false);
          if (phaseStateRef.current === "outro") {
            outroFinishedTimeoutRef.current = setTimeout(() => {
              if (phaseStateRef.current === "outro") {
                onFinished();
              }
            }, 1000);
          }
        }
      );
    }, 1500);
  };

  // Bỏ qua (Skip)
  const handleSkip = () => {
    if (isPaused) return;

    stopSpeaking();
    setIsVoiceSpeaking(false);
    clearAllTimeouts();

    const currentIndex = currentRoleIndexRef.current;

    if (phaseState === "intro") {
      nextRole(0);
    } else if (phaseState === "role_wake" || phaseState === "role_action") {
      const role = wakingRoles[currentIndex];
      sleepRole(role, currentIndex);
    } else if (phaseState === "role_sleep") {
      nextRole(currentIndex + 1);
    } else if (phaseState === "outro") {
      onFinished();
    }
  };

  // Tạm dừng / Tiếp tục
  const handleTogglePause = () => {
    if (isPaused) {
      resumeSpeaking();
      setIsPaused(false);
    } else {
      pauseSpeaking();
      setIsPaused(true);
    }
  };

  // Lấy vai trò hiện tại
  const currentRole = wakingRoles[currentRoleIndex];
  const IconComponent = currentRole ? Icons[currentRole.icon] : null;

  // Mô tả trạng thái
  const getDisplayStatus = () => {
    switch (phaseState) {
      case "intro":
        return "Bắt đầu đêm - Đi ngủ";
      case "role_wake":
        return `Đang gọi thức dậy: ${currentRole?.name}`;
      case "role_action":
        return `Hành động: ${currentRole?.name}`;
      case "role_sleep":
        return `Đang gọi đi ngủ: ${currentRole?.name}`;
      case "outro":
        return "Trời sáng - Mở mắt";
      default:
        return "";
    }
  };

  // Tính toán thông tin tiến trình văn bản chi tiết
  const getProgressDetails = () => {
    if (currentRoleIndex === -1) {
      return {
        stepText: "Chuẩn bị",
        currentName: "Mọi người đi ngủ",
        nextName: wakingRoles[0] ? wakingRoles[0].name : "Bình minh"
      };
    }
    if (currentRoleIndex === wakingRoles.length) {
      return {
        stepText: "Bình minh",
        currentName: "Mọi người thức dậy",
        nextName: "Thảo luận"
      };
    }
    
    return {
      stepText: `Bước ${currentRoleIndex + 1} / ${wakingRoles.length}`,
      currentName: wakingRoles[currentRoleIndex].name,
      nextName: wakingRoles[currentRoleIndex + 1] 
        ? wakingRoles[currentRoleIndex + 1].name 
        : "Trời sáng (Bình minh)"
    };
  };

  const progress = getProgressDetails();

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between p-4 sm:p-6 overflow-hidden select-none">
      {/* Background màu trắng tinh khiết */}
      <div className="absolute inset-0 bg-white" />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-[#10b981] animate-pulse" />
          <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-gray-500">
            Giai đoạn ban đêm
          </span>
        </div>
        <button
          onClick={onExit}
          className="bg-red-100 hover:bg-red-200 text-[#ef4444] border border-red-200 rounded-full p-2 hover:shadow-[0_2px_8px_rgba(239,68,68,0.2)] transition-all"
        >
          <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Vùng hiển thị trung tâm */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 my-4 sm:my-8">
        
        {/* Vòng tròn đếm ngược */}
        <div className="relative w-48 h-48 xs:w-56 xs:h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 flex items-center justify-center">
          
          {/* Wave hiệu ứng giọng nói khi quản trò đang nói */}
          {isVoiceSpeaking && !isPaused && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-[#10b981] opacity-20 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="absolute inset-3 sm:inset-4 rounded-full border border-[#10b981] opacity-40 animate-ping" style={{ animationDuration: "1.5s" }} />
              <div className="absolute inset-8 sm:inset-10 rounded-full bg-[#10b981] bg-opacity-5 animate-pulse" />
            </>
          )}

          {/* Vòng tròn viền phát sáng quay nhẹ */}
          <div
            className={`absolute inset-0 rounded-full border-2 sm:border-4 border-dashed transition-all duration-1000 ${
              phaseState === "role_action"
                ? "border-[#10b981] border-opacity-70 animate-[spin_60s_linear_infinite]"
                : "border-gray-300 border-opacity-60"
            }`}
          />

          {/* Mặt trăng / Biểu tượng trung tâm */}
          <div
            className={`w-36 h-36 xs:w-42 xs:h-42 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full flex flex-col items-center justify-center bg-gradient-to-br transition-all duration-500 shadow-[0_4px_20px_rgba(15,23,42,0.06)] relative ${
              phaseState === "intro" || phaseState === "outro"
                ? "from-white to-[#f8fafc] border border-gray-250"
                : currentRole?.team === "werewolf"
                ? "from-[#fef2f2] to-white border-2 border-[#ef4444] shadow-[0_4px_25px_rgba(239,68,68,0.18)]"
                : "from-[#ecfdf5] to-white border-2 border-[#10b981] shadow-[0_4px_25px_rgba(16,185,129,0.18)]"
            }`}
          >
            {/* Đếm ngược số */}
            {phaseState === "role_action" ? (
              <div className="text-center">
                <span className="font-mono text-4xl xs:text-5xl sm:text-7xl font-extrabold text-[#059669]">
                  {timeLeft}
                </span>
                <span className="text-[8px] sm:text-xs text-gray-550 block mt-0.5 uppercase font-bold tracking-widest">Giây</span>
              </div>
            ) : phaseState === "intro" ? (
              <Moon className="w-10 h-10 sm:w-16 sm:h-16 text-slate-400 animate-pulse" />
            ) : phaseState === "outro" ? (
              <Sun className="w-10 h-10 sm:w-16 sm:h-16 text-amber-500 animate-spin" style={{ animationDuration: "20s" }} />
            ) : IconComponent ? (
              <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                <IconComponent className={`w-10 h-10 sm:w-16 sm:h-16 ${currentRole?.team === "werewolf" ? "text-[#ef4444]" : "text-[#059669]"} animate-pulse`} />
                <span className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">{currentRole?.name}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Trạng thái hiển thị */}
        <div className="mt-6 sm:mt-8 text-center max-w-sm sm:max-w-lg px-4">
          <span className={`text-[10px] sm:text-xs uppercase font-extrabold tracking-widest px-2.5 py-0.5 sm:py-1 rounded-full ${
            currentRole?.team === "werewolf" ? "bg-red-100 text-[#dc2626]" : "bg-emerald-100 text-[#047857]"
          }`}>
            {getDisplayStatus()}
          </span>
          <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-slate-800 font-semibold min-h-10 sm:min-h-12 leading-relaxed">
            {isVoiceSpeaking
              ? "🔊 Quản trò đang hướng dẫn..."
              : phaseState === "role_action"
              ? `[${currentRole?.name}] hãy thực hiện hành động đêm.`
              : "Vui lòng giữ trật tự..."}
          </p>
        </div>
      </div>

      {/* Điều khiển chân trang & Tiến trình chi tiết */}
      <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-6 mb-2 sm:mb-4">
        
        {/* Thanh tiến trình chi tiết bằng chữ (UX Cực kỳ thân thiện) */}
        <div className="w-full max-w-xs sm:max-w-md bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <span>{progress.stepText}</span>
            {currentRoleIndex >= 0 && currentRoleIndex < wakingRoles.length && (
              <span className="text-[#10b981] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                Đang gọi
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between gap-4 mt-0.5">
            <div className="flex-1 min-w-0">
              <span className="text-[9px] text-gray-400 block font-bold uppercase tracking-wide">Hiện tại</span>
              <span className="text-sm sm:text-base font-extrabold text-[#0f172a] truncate block">{progress.currentName}</span>
            </div>
            
            <div className="w-px h-8 bg-gray-200" />
            
            <div className="flex-1 text-right min-w-0">
              <span className="text-[9px] text-gray-400 block font-bold uppercase tracking-wide">Kế tiếp</span>
              <span className="text-xs sm:text-sm font-bold text-gray-500 truncate block">{progress.nextName}</span>
            </div>
          </div>
        </div>

        {/* Cụm nút to */}
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <button
            onClick={handleTogglePause}
            className={`p-3 sm:p-4 rounded-full border transition-all ${
              isPaused
                ? "bg-[#10b981] text-white border-[#10b981] shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
                : "bg-white text-gray-500 border-gray-300 hover:text-gray-800"
            }`}
          >
            {isPaused ? <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />}
          </button>

          <button
            onClick={handleSkip}
            disabled={isPaused}
            className={`py-3 sm:py-4 px-6 sm:px-8 rounded-full font-bold flex items-center gap-2 text-sm sm:text-base transition-all ${
              isPaused
                ? "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300"
                : "bg-white text-[#10b981] border border-[#10b981] hover:bg-gray-50 shadow-sm"
            }`}
          >
            <SkipForward className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current" />
            Bỏ Qua (Skip)
          </button>
        </div>
      </div>
    </div>
  );
};

export default NightPhase;
