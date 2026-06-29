import React, { useState, useEffect } from "react";
import { defaultRoles } from "./utils/defaultRoles";
import RoleCard from "./components/RoleCard";
import CallingOrderList from "./components/CallingOrderList";
import AudioSettings from "./components/AudioSettings";
import NightPhase from "./components/NightPhase";
import DaylightPhase from "./components/DaylightPhase";
import { ShieldAlert, Play, Info, Users } from "lucide-react";

// LocalStorage Keys
const STORAGE_ROLES_KEY = "masoi1dem_roles";
const STORAGE_AUDIO_KEY = "masoi1dem_audio";

const App = () => {
  // Game Phase: "setup", "night", "daylight"
  const [gamePhase, setGamePhase] = useState("setup");

  // Danh sách các vai trò
  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem(STORAGE_ROLES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return defaultRoles.map((role) => {
          const savedRole = parsed.find((p) => p.id === role.id);
          let selected = false;
          if (savedRole) {
            selected =
              savedRole.selected !== undefined
                ? savedRole.selected
                : savedRole.count > 0;
          } else {
            const defaultSelection = [
              "werewolf1",
              "werewolf2",
              "seer",
              "robber",
              "troublemaker",
              "drunk",
              "insomniac",
              "villager1",
              "villager2",
            ];
            selected = defaultSelection.includes(role.id);
          }
          return {
            ...role,
            selected,
          };
        });
      } catch (e) {
        console.error("Lỗi đọc dữ liệu roles từ localStorage:", e);
      }
    }
    const defaultSelection = [
      "werewolf1",
      "werewolf2",
      "seer",
      "robber",
      "troublemaker",
      "drunk",
      "insomniac",
      "villager1",
      "villager2",
    ];
    return defaultRoles.map((role) => ({
      ...role,
      selected: defaultSelection.includes(role.id),
    }));
  });

  // Cấu hình âm thanh giọng nói
  const [audioConfig, setAudioConfig] = useState(() => {
    const saved = localStorage.getItem(STORAGE_AUDIO_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Lỗi đọc dữ liệu audio từ localStorage:", e);
      }
    }
    return {
      voiceURI: "",
      rate: 0.95,
      pitch: 0.9,
      volume: 1.0,
    };
  });

  // Lưu cấu hình vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem(STORAGE_ROLES_KEY, JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_AUDIO_KEY, JSON.stringify(audioConfig));
  }, [audioConfig]);

  // Bật/tắt vai trò
  const handleToggleRole = (roleId) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, selected: !r.selected } : r)),
    );
  };

  // Cập nhật cấu hình vai trò
  const handleUpdateRoleSettings = (roleId, newSettings) => {
    const role = roles.find((r) => r.id === roleId);
    const groupId = role?.roleGroupId || roleId;

    setRoles((prev) =>
      prev.map((r) => {
        const rGroupId = r.roleGroupId || r.id;
        if (rGroupId === groupId) {
          return { ...r, ...newSettings };
        }
        return r;
      }),
    );
  };

  // Áp dụng cấu hình gợi ý nhanh (Player Presets)
  const applyPreset = (count) => {
    let presetList = [];
    if (count === 3) {
      presetList = [
        "werewolf1",
        "werewolf2",
        "seer",
        "robber",
        "troublemaker",
        "villager1",
      ];
    } else if (count === 5) {
      presetList = [
        "werewolf1",
        "werewolf2",
        "minion",
        "seer",
        "robber",
        "troublemaker",
        "drunk",
        "insomniac",
        "villager1",
      ];
    } else if (count === 7) {
      presetList = [
        "werewolf1",
        "werewolf2",
        "minion",
        "seer",
        "robber",
        "troublemaker",
        "drunk",
        "insomniac",
        "mason1",
        "mason2",
        "villager1",
      ];
    }

    setRoles((prev) =>
      prev.map((r) => ({
        ...r,
        selected: presetList.includes(r.id),
      })),
    );
  };

  // Kiểm tra preset nào đang khớp với cấu hình hiện tại
  const getActivePreset = () => {
    const activeSelectedIds = roles
      .filter((r) => r.selected)
      .map((r) => r.id)
      .sort();

    const preset3 = [
      "werewolf1",
      "werewolf2",
      "seer",
      "robber",
      "troublemaker",
      "villager1",
    ].sort();
    const preset5 = [
      "werewolf1",
      "werewolf2",
      "minion",
      "seer",
      "robber",
      "troublemaker",
      "drunk",
      "insomniac",
      "villager1",
    ].sort();
    const preset7 = [
      "werewolf1",
      "werewolf2",
      "minion",
      "seer",
      "robber",
      "troublemaker",
      "drunk",
      "insomniac",
      "mason1",
      "mason2",
      "villager1",
    ].sort();

    if (JSON.stringify(activeSelectedIds) === JSON.stringify(preset3)) return 3;
    if (JSON.stringify(activeSelectedIds) === JSON.stringify(preset5)) return 5;
    if (JSON.stringify(activeSelectedIds) === JSON.stringify(preset7)) return 7;
    return null;
  };

  // Khôi phục mặc định
  const handleResetOrder = () => {
    setRoles((prev) =>
      prev.map((r) => {
        const original = defaultRoles.find((orig) => orig.id === r.id);
        const defaultSelection = [
          "werewolf1",
          "werewolf2",
          "seer",
          "robber",
          "troublemaker",
          "drunk",
          "insomniac",
          "villager1",
          "villager2",
        ];
        const defaultSelected = defaultSelection.includes(r.id);
        if (original) {
          return {
            ...original,
            selected: defaultSelected,
          };
        }
        return r;
      }),
    );
  };

  const getWakingRolesGroup = (selectedList) => {
    const list = [];
    const seen = new Set();

    selectedList.forEach((r) => {
      const gid = r.roleGroupId || r.id;
      if (!seen.has(gid)) {
        seen.add(gid);
        const baseName = r.name.replace(/\s\d+$/, "");
        list.push({
          ...r,
          name: baseName,
        });
      }
    });
    return list;
  };

  const selectedCount = roles.filter((r) => r.selected).length;
  const estimatedPlayers = Math.max(0, selectedCount - 3);

  const selectedWakingRolesList = getWakingRolesGroup(
    roles.filter((r) => r.selected),
  );
  const selectedWakingRolesCount = selectedWakingRolesList.filter(
    (r) => r.wakesUp,
  ).length;

  const werewolfTeam = roles.filter((r) => r.team === "werewolf");
  const villagerTeam = roles.filter((r) => r.team === "villager");
  const tannerTeam = roles.filter((r) => r.team === "tanner");

  const activePreset = getActivePreset();

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Header chính */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 border border-red-200 text-[#ef4444] shadow-sm">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-wider text-gray-900">
                MA SÓI MỘT ĐÊM
              </h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center sm:text-left">
                Trợ Lý Quản Trò Chuyên Nghiệp
              </p>
            </div>
          </div>

          {gamePhase === "setup" && (
            <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-2xl py-2 px-4 shadow-sm">
              <div className="text-center px-3 border-r border-gray-200">
                <span className="block font-mono text-lg font-bold text-[#10b981]">
                  {selectedCount}
                </span>
                <span className="text-[9px] font-bold text-gray-400 uppercase">
                  {" "}
                  Tổng Lá Bài
                </span>
              </div>
              <div className="text-center px-3">
                <span className="block font-mono text-lg font-bold text-gray-900">
                  {estimatedPlayers > 0 ? estimatedPlayers : 0}
                </span>
                <span className="text-[9px] font-bold text-gray-400 uppercase">
                  {" "}
                  Số Người Chơi
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Nội dung chính dựa trên Game Phase */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {gamePhase === "setup" && (
          <div className="space-y-6">
            {/* Thanh hướng dẫn */}
            <div className="glass-panel p-4 rounded-2xl border border-gray-200 flex items-start gap-3 bg-opacity-40">
              <Info className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
              <div className="text-xs md:text-sm text-gray-555">
                <span className="font-bold text-gray-900 block mb-0.5">
                  Quy tắc thiết lập ván chơi:
                </span>
                Mỗi ván game Ma Sói Một Đêm sẽ có tổng số lá bài bằng{" "}
                <strong className="text-gray-900">
                  Số người chơi + 3 lá bài dư đặt ở giữa bàn
                </strong>
                . Hãy chọn các vai trò tham gia dưới đây để ứng dụng tự động sắp
                xếp kịch bản gọi ban đêm phù hợp nhất.
              </div>
            </div>

            {/* Thanh chọn nhanh Preset số người chơi (UX Cải tiến vượt trội) */}
            <div className="glass-panel p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-gray-700">
                <Users className="w-5 h-5 text-[#10b981]" />
                <span>CHỌN BÀN CHƠI KHUYẾN NGHỊ:</span>
              </div>
              <div className="flex flex-wrap gap-2.5 justify-center">
                <button
                  onClick={() => applyPreset(3)}
                  className={`preset-btn border ${
                    activePreset === 3
                      ? "border-[#10b981] bg-[#e6fbf3] text-[#059669] shadow-[0_2px_8px_rgba(16,185,129,0.15)]"
                      : "bg-white"
                  }`}
                >
                  3-4 Người chơi (6 lá)
                </button>
                <button
                  onClick={() => applyPreset(5)}
                  className={`preset-btn border ${
                    activePreset === 5
                      ? "border-[#10b981] bg-[#e6fbf3] text-[#059669] shadow-[0_2px_8px_rgba(16,185,129,0.15)]"
                      : "bg-white"
                  }`}
                >
                  5-6 Người chơi (9 lá)
                </button>
                <button
                  onClick={() => applyPreset(7)}
                  className={`preset-btn border ${
                    activePreset === 7
                      ? "border-[#10b981] bg-[#e6fbf3] text-[#059669] shadow-[0_2px_8px_rgba(16,185,129,0.15)]"
                      : "bg-white"
                  }`}
                >
                  7-8 Người chơi (11 lá)
                </button>
              </div>
            </div>

            {/* Layout cột đôi */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Cột trái: Danh sách chọn vai trò phân loại theo Phe */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Phe Ma Sói */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-red-200 pb-2">
                    <span className="w-1.5 h-4.5 bg-[#ef4444] rounded-full shadow-sm" />
                    <h3 className="text-xs sm:text-sm font-extrabold tracking-wider text-[#ef4444] uppercase">
                      Phe Ma Sói (
                      {werewolfTeam.filter((r) => r.selected).length} /{" "}
                      {werewolfTeam.length} lá)
                    </h3>
                  </div>
                  <div className="layout-grid-roles">
                    {werewolfTeam.map((role) => (
                      <RoleCard
                        key={role.id}
                        role={role}
                        isSelected={role.selected}
                        onToggle={() => handleToggleRole(role.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* 2. Phe Dân Làng */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-green-200 pb-2">
                    <span className="w-1.5 h-4.5 bg-[#059669] rounded-full shadow-sm" />
                    <h3 className="text-xs sm:text-sm font-extrabold tracking-wider text-[#059669] uppercase">
                      Phe Dân Làng (
                      {villagerTeam.filter((r) => r.selected).length} /{" "}
                      {villagerTeam.length} lá)
                    </h3>
                  </div>
                  <div className="layout-grid-roles">
                    {villagerTeam.map((role) => (
                      <RoleCard
                        key={role.id}
                        role={role}
                        isSelected={role.selected}
                        onToggle={() => handleToggleRole(role.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* 3. Phe Độc Lập */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
                    <span className="w-1.5 h-4.5 bg-[#d97706] rounded-full shadow-sm" />
                    <h3 className="text-xs sm:text-sm font-extrabold tracking-wider text-[#d97706] uppercase">
                      Phe Độc Lập ({tannerTeam.filter((r) => r.selected).length}{" "}
                      / {tannerTeam.length} lá)
                    </h3>
                  </div>
                  <div className="layout-grid-roles">
                    {tannerTeam.map((role) => (
                      <RoleCard
                        key={role.id}
                        role={role}
                        isSelected={role.selected}
                        onToggle={() => handleToggleRole(role.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Cột phải: Thứ tự gọi + Cấu hình âm thanh */}
              <div className="lg:col-span-5 space-y-6">
                {/* Cấu hình giọng nói */}
                <AudioSettings
                  audioConfig={audioConfig}
                  setAudioConfig={setAudioConfig}
                />

                {/* Thứ tự & Thời gian đếm ngược */}
                <CallingOrderList
                  selectedRoles={selectedWakingRolesList}
                  onUpdateRoleSettings={handleUpdateRoleSettings}
                  onResetOrder={handleResetOrder}
                />
              </div>
            </div>

            {/* Khoảng đệm */}
            <div className="h-24"></div>

            {/* Nút Khởi động Đêm */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 p-4 flex justify-center shadow-[0_-4px_15px_rgba(15,23,42,0.03)]">
              <button
                onClick={() => setGamePhase("night")}
                disabled={selectedWakingRolesCount === 0}
                className={`w-full max-w-xl py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2.5 transition-all duration-300 ${
                  selectedWakingRolesCount === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300 shadow-none"
                    : "bg-gradient-to-r from-[#ef4444] to-[#f59e0b] text-white hover:shadow-[0_6px_22px_rgba(239,68,68,0.22)] hover:scale-[1.01] transform active:scale-[0.99] border-none"
                }`}
              >
                <Play className="w-5 h-5 fill-current" />
                {selectedWakingRolesCount === 0
                  ? "Hãy chọn ít nhất 1 vai trò thức giấc đêm"
                  : "BẮT ĐẦU VÁN ĐẤU (PHÂN ĐÊM)"}
              </button>
            </div>
          </div>
        )}

        {/* Chạy ban đêm */}
        {gamePhase === "night" && (
          <NightPhase
            selectedRoles={selectedWakingRolesList}
            audioConfig={audioConfig}
            onExit={() => setGamePhase("setup")}
            onFinished={() => setGamePhase("daylight")}
          />
        )}

        {/* Thảo luận ban ngày */}
        {gamePhase === "daylight" && (
          <DaylightPhase onBackToSetup={() => setGamePhase("setup")} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400 bg-white">
        <p>
          © 2026 Werewolf Host Assistant. Phát triển cho game Ma Sói Một Đêm.
        </p>
      </footer>
    </div>
  );
};

export default App;
