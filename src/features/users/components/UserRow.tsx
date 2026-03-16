import { IUser } from "../types";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface Props {
  user: IUser;
  onSelect: (user: IUser) => void;
  isSelected: boolean;
}

const statusConfig = {
  active:    { label: "Active",    color: "#34c759", bg: "#f0fdf4", border: "#bbf7d0" },
  suspended: { label: "Suspended", color: "#ff9f0a", bg: "#fffbeb", border: "#fed7aa" },
  banned:    { label: "Banned",    color: "#fa243c", bg: "#fff0f3", border: "#ffd1d9" },
};

const roleConfig = {
  admin: { label: "Admin", color: "#af52de", bg: "#faf5ff", border: "#e9d5ff" },
  user:  { label: "User",  color: "#6e6e73", bg: "#f5f5f7", border: "#e5e5ea" },
};

const formatDate = (ts: any): string => {
  if (!ts) return "—";
  try {
    const date = ts?.toDate?.() ?? new Date(ts);
    return new Intl.DateTimeFormat("en-US", {
      month: "short", day: "numeric", year: "numeric",
    }).format(date);
  } catch { return "—"; }
};

const UserRow = ({ user, onSelect, isSelected }: Props) => {
  const status = statusConfig[user.status ?? "active"];
  const role   = roleConfig[user.role ?? "user"];

  return (
    <tr
      className={`border-b border-[#f5f5f7] last:border-none cursor-pointer transition-colors duration-100 hover:bg-[#fafafa] ${
        isSelected ? "bg-[#fff0f3]" : ""
      }`}
      onClick={() => onSelect(user)}
    >
      {/* Avatar + Identity */}
      <td className="py-3 px-4 align-middle whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="w-9 h-9 rounded-full object-cover block" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#fff0f3] border border-[#ffd1d9] flex items-center justify-center text-sm font-bold text-[#fa243c]">
                {(user.name || user.email || "?")[0].toUpperCase()}
              </div>
            )}
            <span 
              className="absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white"
              style={{ background: status.color }}
            />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[13px] font-semibold text-[#1d1d1f] tracking-[-0.1px] truncate max-w-[180px]">
              {user.name || "Unnamed User"}
            </span>
            <span className="text-[11.5px] text-[#aeaeb2] truncate max-w-[180px]">
              {user.email}
            </span>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="py-3 px-4 align-middle whitespace-nowrap">
        <span 
          className="inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-semibold border whitespace-nowrap"
          style={{ color: role.color, background: role.bg, borderColor: role.border }}
        >
          {role.label}
        </span>
      </td>

      {/* Status */}
      <td className="py-3 px-4 align-middle whitespace-nowrap">
        <span 
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-semibold border whitespace-nowrap"
          style={{ color: status.color, background: status.bg, borderColor: status.border }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
          {status.label}
        </span>
      </td>

      {/* Joined */}
      <td className="py-3 px-4 align-middle whitespace-nowrap text-[13px] text-[#6e6e73] tabular-nums">
        {formatDate(user.createdAt)}
      </td>

      {/* Last Login */}
      <td className="py-3 px-4 align-middle whitespace-nowrap text-[13px] text-[#aeaeb2] tabular-nums">
        {formatDate(user.lastLoginAt)}
      </td>

      {/* Chevron */}
      <td className="py-3 px-4 align-middle whitespace-nowrap w-8">
        <ChevronRightIcon 
          sx={{ 
            fontSize: 18,
            color: isSelected ? '#fa243c' : '#d1d1d6',
            transform: isSelected ? 'rotate(90deg)' : 'rotate(0)',
            transition: 'transform 0.2s, color 0.15s'
          }}
          className="group-hover:text-[#aeaeb2]"
        />
      </td>
    </tr>
  );
};

export default UserRow;