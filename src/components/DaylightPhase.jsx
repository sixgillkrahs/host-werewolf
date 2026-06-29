import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RefreshCw, Sun, AlertTriangle, ArrowLeft } from "lucide-react";
import { playGong, playTick } from "../utils/speech";

const DaylightPhase = ({ onBackToSetup }) => {
  const [totalSeconds, setTotalSeconds] = useState(300); // 5 phút mặc định
  const [timeLeft, setTimeLeft] = useState(300);
  const [isActive, setIsActive] = useState(true); // Tự động chạy khi bắt đầu ngày
  
  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsActive(false);
            playGong();
            return 0;
          }
          if (prev <= 11) {
            playTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(totalSeconds);
  };

  const handleTimePreset = (minutes) => {
    const seconds = minutes * 60;
    setTotalSeconds(seconds);
    setTimeLeft(seconds);
    setIsActive(false);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const progressPercent = (timeLeft / totalSeconds) * 100;

  return (
    <div className="min-h-[75vh] sm:min-h-[80vh] flex flex-col justify-between items-center py-6 sm:py-10 px-4 select-none">
      
      {/* Nút quay lại Setup */}
      <div className="w-full max-w-xl flex justify-start">
        <button
          onClick={onBackToSetup}
          className="text-[10px] sm:text-xs bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-800 font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl flex items-center gap-1.5 border border-gray-250 transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Thiết lập
        </button>
      </div>

      {/* Vùng đếm ngược trung tâm */}
      <div className="flex flex-col items-center justify-center my-4 sm:my-6">
        
        {/* Vòng tròn đếm ngược */}
        <div className="relative w-48 h-48 xs:w-56 xs:h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center">
          
          {/* Vòng tròn tiến trình SVG */}
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="43%"
              className="stroke-gray-200 fill-none"
              strokeWidth="4"
            />
            <circle
              cx="50%"
              cy="50%"
              r="43%"
              className="stroke-[#10b981] fill-none transition-all duration-1000"
              strokeWidth="5"
              strokeDasharray="270%"
              strokeDashoffset={`${270 - (270 * progressPercent) / 100}%`}
              strokeLinecap="round"
            />
          </svg>

          {/* Nội dung bên trong vòng tròn */}
          <div className="relative flex flex-col items-center justify-center text-center">
            <Sun className={`w-8 h-8 sm:w-12 sm:h-12 text-amber-500 mb-1 sm:mb-2 ${isActive ? "animate-pulse" : ""}`} />
            <span className="font-mono text-4xl xs:text-5xl sm:text-6xl font-extrabold text-slate-800 drop-shadow-sm">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[8px] sm:text-[10px] text-gray-400 uppercase tracking-widest mt-1 sm:mt-2 font-bold">
              Thảo luận ban ngày
            </span>
          </div>
        </div>

        {/* Thiết lập nhanh thời gian */}
        <div className="mt-6 sm:mt-8 flex justify-center gap-1.5 sm:gap-2.5">
          {[3, 5, 8, 10].map(mins => (
            <button
              key={mins}
              onClick={() => handleTimePreset(mins)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all border ${
                totalSeconds === mins * 60
                  ? "bg-green-50 text-[#059669] border-[#10b981] border-opacity-50"
                  : "bg-white text-gray-500 border-gray-250 hover:bg-gray-50"
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>

      {/* Điều khiển */}
      <div className="w-full max-w-md flex flex-col items-center gap-4 sm:gap-6">
        {timeLeft === 0 && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center gap-2 animate-bounce shadow-sm">
            <AlertTriangle className="w-4 h-4 text-[#ef4444] flex-shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold text-red-700">Hết giờ! Hãy bắt đầu biểu quyết treo cổ sói.</span>
          </div>
        )}

        <div className="flex items-center gap-4 sm:gap-5">
          {/* Nút Đặt lại */}
          <button
            onClick={handleReset}
            className="p-3 sm:p-4 rounded-full bg-white border border-gray-250 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Nút Bắt đầu / Tạm dừng */}
          <button
            onClick={handleToggle}
            className={`py-3 sm:py-4 px-8 sm:px-10 rounded-full font-bold flex items-center gap-2 text-sm sm:text-base transition-all ${
              isActive
                ? "bg-white text-[#10b981] border border-[#10b981] hover:bg-gray-50 shadow-sm"
                : "bg-[#10b981] text-white shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:bg-opacity-95"
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> Tạm Dừng
              </>
            ) : (
              <>
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> Bắt Đầu
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DaylightPhase;
