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
    <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-[#10b981]" />
          <h2 className="text-sm sm:text-lg font-extrabold tracking-wide text-slate-800 uppercase">THỨ TỰ & THỜI GIAN</h2>
        </div>
        <button
          onClick={onResetOrder}
          className="text-[10px] sm:text-xs bg-white hover:bg-gray-50 text-gray-500 font-bold py-1.5 px-3 rounded-xl flex items-center gap-1 border border-gray-250 transition-all shadow-sm"
        >
          <RefreshCw className="w-3 h-3" /> Mặc định
        </button>
      </div>

      {wakingRoles.length === 0 ? (
        <div className="text-center py-10 text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl px-4">
          Chưa chọn vai trò nào thức dậy ban đêm.
          <br /> Hãy bật các vai trò có gắn nhãn "Đêm" ở danh sách.
        </div>
      ) : (
        <div className="space-y-3">
          {wakingRoles.map((role, index) => {
            const IconComponent = Icons[role.icon] || Icons.HelpCircle;
            const isEditing = editingScriptId === role.id;

            return (
              <div
                key={role.id}
                className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 hover:border-gray-300 transition-all hover:bg-white"
              >
                {/* Header Dòng: Tên vai trò và Nút bấm điều khiển */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Cột Trái: Thứ tự & Tên */}
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#ecfdf5] text-[#059669] flex items-center justify-center font-mono font-bold text-xs sm:text-sm border border-emerald-200">
                      {index + 1}
                    </span>
                    <div className="p-2 rounded-xl bg-white border border-gray-200 text-slate-500 shadow-sm">
                      <IconComponent className="w-4.5 h-4.5 sm:w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#0f172a] text-xs sm:text-base flex items-baseline gap-1.5">
                        <span>{role.name}</span>
                        <span className="text-[9px] sm:text-xs font-normal text-gray-450">({role.englishName})</span>
                      </h4>
                    </div>
                  </div>

                  {/* Cột Phải: Timer + Move Buttons (Co giãn/xuống dòng trên mobile) */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-4 border-t border-gray-200 pt-2.5 sm:pt-0 sm:border-none">
                    
                    {/* Bộ chỉnh thời gian chạm (touch-friendly) */}
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                      <span className="text-[9px] sm:text-xs text-gray-400 px-1 sm:px-1.5 font-bold">Giây:</span>
                      <button
                        onClick={() => handleDurationChange(role.id, role.defaultDuration - 1)}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 flex items-center justify-center font-bold text-xs active:scale-95 transition-all"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={role.defaultDuration}
                        onChange={(e) => handleDurationChange(role.id, e.target.value)}
                        className="w-8 sm:w-10 bg-transparent text-center text-xs sm:text-sm font-extrabold text-[#059669] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => handleDurationChange(role.id, role.defaultDuration + 1)}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 flex items-center justify-center font-bold text-xs active:scale-95 transition-all"
                      >
                        +
                      </button>
                    </div>

                    {/* Mũi tên lên xuống */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveRole(index, "up")}
                        disabled={index === 0}
                        className={`p-1.5 sm:p-2 rounded-xl bg-white border border-gray-250 text-gray-500 hover:bg-gray-55 hover:text-gray-800 shadow-sm transition-all ${
                          index === 0 ? "opacity-30 cursor-not-allowed" : ""
                        }`}
                        title="Di chuyển lên"
                      >
                        <ArrowUp className="w-3.5 h-3.5 sm:w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveRole(index, "down")}
                        disabled={index === wakingRoles.length - 1}
                        className={`p-1.5 sm:p-2 rounded-xl bg-white border border-gray-250 text-gray-500 hover:bg-gray-55 hover:text-gray-800 shadow-sm transition-all ${
                          index === wakingRoles.length - 1 ? "opacity-30 cursor-not-allowed" : ""
                        }`}
                        title="Di chuyển xuống"
                      >
                        <ArrowDown className="w-3.5 h-3.5 sm:w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Edit Kịch bản lời thoại gọi vai trò */}
                <div className="border-t border-gray-200 border-opacity-70 pt-2.5">
                  {isEditing ? (
                    <div className="space-y-2.5 mt-1">
                      <div>
                        <label className="text-[8px] sm:text-[9px] text-gray-400 font-extrabold block mb-1 uppercase tracking-wider">KỊCH BẢN THỨC GIẤC</label>
                        <textarea
                          rows="2"
                          value={tempScripts.wakeScript}
                          onChange={(e) => setTempScripts(prev => ({ ...prev, wakeScript: e.target.value }))}
                          className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#10b981] shadow-sm transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] sm:text-[9px] text-gray-400 font-extrabold block mb-1 uppercase tracking-wider">KỊCH BẢN ĐI NGỦ</label>
                        <textarea
                          rows="1"
                          value={tempScripts.sleepScript}
                          onChange={(e) => setTempScripts(prev => ({ ...prev, sleepScript: e.target.value }))}
                          className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#10b981] shadow-sm transition-all"
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-1">
                        <button
                          onClick={() => setEditingScriptId(null)}
                          className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 font-bold"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => saveScript(role.id)}
                          className="px-3.5 py-1.5 text-xs bg-[#10b981] text-white font-bold rounded-xl hover:bg-opacity-90 flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" /> Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3 mt-0.5">
                      <div className="text-[10px] sm:text-xs text-gray-500 flex-1 min-w-0">
                        <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 block uppercase tracking-wider mb-0.5">Kịch bản thoại</span>
                        <p className="italic truncate text-slate-700">"{role.wakeScript}"</p>
                      </div>
                      <button
                        onClick={() => startEditingScript(role)}
                        className="text-gray-400 hover:text-[#10b981] p-1.5 transition-all flex items-center gap-0.5 text-[10px] font-bold flex-shrink-0 bg-white border border-gray-200 rounded-lg hover:shadow-sm"
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
