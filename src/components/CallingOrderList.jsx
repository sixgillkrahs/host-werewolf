import React, { useState } from "react";
import * as Icons from "lucide-react";
import { ArrowUp, ArrowDown, Timer, Edit3, Check, RefreshCw } from "lucide-react";

const CallingOrderList = ({ selectedRoles, onUpdateRoleSettings, onResetOrder }) => {
  const [editingScriptId, setEditingScriptId] = useState(null);
  const [tempScripts, setTempScripts] = useState({ wakeScript: "", sleepScript: "" });

  // Lọc ra các vai trò có thức giấc ban đêm
  const wakingRoles = selectedRoles
    .filter(r => r.wakesUp)
    .sort((a, b) => a.defaultOrder - b.defaultOrder);

  const moveRole = (index, direction) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === wakingRoles.length - 1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const roleA = wakingRoles[index];
    const roleB = wakingRoles[newIndex];

    // Tráo đổi defaultOrder của 2 vai trò
    const tempOrder = roleA.defaultOrder;
    onUpdateRoleSettings(roleA.id, { defaultOrder: roleB.defaultOrder });
    onUpdateRoleSettings(roleB.id, { defaultOrder: tempOrder });
  };

  const handleDurationChange = (roleId, newDuration) => {
    const val = Math.max(3, Math.min(60, parseInt(newDuration) || 5));
    onUpdateRoleSettings(roleId, { defaultDuration: val });
  };

  const startEditingScript = (role) => {
    setEditingScriptId(role.id);
    setTempScripts({
      wakeScript: role.wakeScript || "",
      sleepScript: role.sleepScript || ""
    });
  };

  const saveScript = (roleId) => {
    onUpdateRoleSettings(roleId, {
      wakeScript: tempScripts.wakeScript,
      sleepScript: tempScripts.sleepScript
    });
    setEditingScriptId(null);
  };

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-[var(--color-neon-blue-dim)] shadow-[0_0_20px_rgba(102,252,241,0.1)]">
      <div className="flex justify-between items-center mb-5 gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-neon-blue)]" />
          <h2 className="text-sm sm:text-xl font-bold tracking-wide text-white uppercase">THỨ TỰ & THỜI GIAN</h2>
        </div>
        <button
          onClick={onResetOrder}
          className="text-[10px] sm:text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-1 sm:py-1.5 px-2 sm:px-3 rounded-lg flex items-center gap-1 border border-gray-700 hover:border-gray-500 transition-all"
        >
          <RefreshCw className="w-3 h-3" /> Mặc định
        </button>
      </div>

      {wakingRoles.length === 0 ? (
        <div className="text-center py-8 text-xs text-gray-500 border border-dashed border-gray-800 rounded-xl px-4">
          Chưa chọn vai trò nào thức dậy ban đêm.
          <br /> Hãy bật các vai trò thức giấc ở bảng danh sách.
        </div>
      ) : (
        <div className="space-y-2.5">
          {wakingRoles.map((role, index) => {
            const IconComponent = Icons[role.icon] || Icons.HelpCircle;
            const isEditing = editingScriptId === role.id;

            return (
              <div
                key={role.id}
                className="bg-[#1f2833] bg-opacity-30 border border-gray-850 rounded-xl p-3 sm:p-4 flex flex-col gap-2.5 hover:border-gray-700 transition-all"
              >
                {/* Header Dòng: Tên vai trò và Nút bấm điều khiển */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Cột Trái: Thứ tự & Tên */}
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[var(--color-neon-blue-dim)] text-[var(--color-neon-blue)] flex items-center justify-center font-mono font-bold text-xs sm:text-sm border border-[var(--color-neon-blue)] border-opacity-30">
                      {index + 1}
                    </span>
                    <div className="p-1.5 rounded-lg bg-gray-800 text-gray-300">
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs sm:text-base flex items-center gap-1.5">
                        {role.name}
                        <span className="text-[9px] sm:text-xs font-normal text-gray-500">({role.englishName})</span>
                      </h4>
                    </div>
                  </div>

                  {/* Cột Phải: Timer + Move Buttons (Tự động co giãn/xuống dòng trên mobile) */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-4 border-t border-gray-800 border-opacity-30 pt-2.5 sm:pt-0 sm:border-none">
                    
                    {/* Bộ chỉnh thời gian chạm (touch-friendly) */}
                    <div className="flex items-center gap-1 bg-gray-900 bg-opacity-50 border border-gray-850 rounded-lg p-0.5">
                      <span className="text-[9px] sm:text-xs text-gray-500 px-1 sm:px-1.5">Đợi:</span>
                      <button
                        onClick={() => handleDurationChange(role.id, role.defaultDuration - 1)}
                        className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={role.defaultDuration}
                        onChange={(e) => handleDurationChange(role.id, e.target.value)}
                        className="w-8 sm:w-10 bg-transparent text-center text-xs sm:text-sm font-bold text-[var(--color-neon-blue)] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-[9px] sm:text-xs text-gray-400 pr-1">s</span>
                      <button
                        onClick={() => handleDurationChange(role.id, role.defaultDuration + 1)}
                        className="w-5.5 h-5.5 sm:w-7 sm:h-7 rounded bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Mũi tên lên xuống */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveRole(index, "up")}
                        disabled={index === 0}
                        className={`p-1.5 sm:p-2 rounded bg-gray-900 border border-gray-850 text-gray-400 hover:bg-gray-800 hover:text-white transition-all ${
                          index === 0 ? "opacity-30 cursor-not-allowed" : ""
                        }`}
                        title="Di chuyển lên"
                      >
                        <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => moveRole(index, "down")}
                        disabled={index === wakingRoles.length - 1}
                        className={`p-1.5 sm:p-2 rounded bg-gray-900 border border-gray-850 text-gray-400 hover:bg-gray-800 hover:text-white transition-all ${
                          index === wakingRoles.length - 1 ? "opacity-30 cursor-not-allowed" : ""
                        }`}
                        title="Di chuyển xuống"
                      >
                        <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Edit Kịch bản lời thoại gọi vai trò (Responsive) */}
                <div className="border-t border-gray-850 border-opacity-50 pt-2">
                  {isEditing ? (
                    <div className="space-y-2 mt-1">
                      <div>
                        <label className="text-[8px] sm:text-[10px] text-gray-500 font-bold block mb-1">KỊCH BẢN THỨC GIẤC</label>
                        <textarea
                          rows="2"
                          value={tempScripts.wakeScript}
                          onChange={(e) => setTempScripts(prev => ({ ...prev, wakeScript: e.target.value }))}
                          className="w-full bg-[#0b0c10] border border-gray-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[var(--color-neon-blue)]"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] sm:text-[10px] text-gray-500 font-bold block mb-1">KỊCH BẢN ĐI NGỦ</label>
                        <textarea
                          rows="1"
                          value={tempScripts.sleepScript}
                          onChange={(e) => setTempScripts(prev => ({ ...prev, sleepScript: e.target.value }))}
                          className="w-full bg-[#0b0c10] border border-gray-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[var(--color-neon-blue)]"
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-1">
                        <button
                          onClick={() => setEditingScriptId(null)}
                          className="px-2 py-1 text-xs text-gray-400 hover:text-white"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => saveScript(role.id)}
                          className="px-2.5 py-1 text-xs bg-[var(--color-neon-blue)] text-[#0b0c10] font-bold rounded-md hover:bg-opacity-80 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3 mt-0.5">
                      <div className="text-[10px] sm:text-xs text-gray-400 flex-1 min-w-0">
                        <span className="text-[8px] sm:text-[10px] font-bold text-gray-600 block uppercase">Kịch bản thoại</span>
                        <p className="italic truncate">"{role.wakeScript}"</p>
                      </div>
                      <button
                        onClick={() => startEditingScript(role)}
                        className="text-gray-500 hover:text-[var(--color-neon-blue)] p-1 transition-all flex items-center gap-0.5 text-[9px] sm:text-[10px] flex-shrink-0"
                      >
                        <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Sửa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CallingOrderList;
