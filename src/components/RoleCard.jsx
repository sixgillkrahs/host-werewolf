import React from "react";
import * as Icons from "lucide-react";

const RoleCard = ({ role, isSelected, onToggle }) => {
  // Lấy icon động từ lucide-react
  const IconComponent = Icons[role.icon] || Icons.HelpCircle;

  // Lấy class chính xác dựa trên việc thẻ được chọn hay chưa và thuộc phe nào
  const getSelectedClass = () => {
    if (!isSelected) return "role-card-custom";
    switch (role.team) {
      case "werewolf":
        return "role-card-selected-werewolf";
      case "tanner":
        return "role-card-selected-tanner";
      case "villager":
      default:
        return "role-card-selected-villager";
    }
  };

  const selectedClass = getSelectedClass();

  return (
    <div
      onClick={onToggle}
      className={`relative cursor-pointer rounded-2xl p-4 sm:p-5 flex flex-col justify-between select-none ${selectedClass}`}
    >
      <div>
        {/* Phần đầu: Icon và Nhãn Phe */}
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white border border-gray-200 shadow-sm role-icon-wrapper text-gray-400">
            <IconComponent className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5" />
          </div>
          <span className="text-[8px] sm:text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full border border-gray-200 role-badge text-gray-500 bg-gray-50">
            {role.team === "werewolf" ? "Phe Sói" : role.team === "tanner" ? "Phe Chán Đời" : "Phe Dân Làng"}
          </span>
        </div>

        {/* Thông tin vai trò */}
        <h3 className="text-sm sm:text-base font-extrabold tracking-wide mb-1 flex items-baseline gap-1.5 role-title text-[#1e293b]">
          <span>{role.name}</span>
          <span className="text-[9px] sm:text-xs font-normal font-mono text-gray-400">({role.englishName})</span>
        </h3>
        <p className="text-[10px] sm:text-xs leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 role-desc text-[#64748b]">
          {role.description}
        </p>
      </div>

      {/* Footer: Trạng thái thức dậy ban đêm */}
      <div className="flex items-center border-t border-gray-100 pt-2.5 sm:pt-3">
        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 role-title text-gray-500">
          {role.wakesUp ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
              Đêm
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              Ngủ
            </>
          )}
        </span>
      </div>
    </div>
  );
};

export default RoleCard;
