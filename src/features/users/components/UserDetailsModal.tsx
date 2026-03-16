import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IUser } from "../types";
import UserActionsMenu from "./UserActionsMenu";
import CloseIcon from "@mui/icons-material/Close";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import InfoIcon from "@mui/icons-material/Info";

interface Props {
  user: IUser | null;
  onClose: () => void;
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
      month: "long", day: "numeric", year: "numeric",
    }).format(date);
  } catch { return "—"; }
};

const UserDetailsModal = ({ user, onClose }: Props) => {
  const [visible,  setVisible]  = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const actionsRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (user) setTimeout(() => setVisible(true), 10);
    else setVisible(false);
  }, [user]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setMenuOpen(false);
    setTimeout(onClose, 260);
  };

  if (!user) return null;

  const status = statusConfig[user.status ?? "active"];
  const role   = roleConfig[user.role ?? "user"];

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/25 backdrop-blur-md z-[300] transition-opacity duration-260 ease"
        style={{ opacity: visible ? 1 : 0 }} 
        onClick={handleClose} 
      />

      {/* Drawer */}
      <div 
        className="fixed top-0 right-0 bottom-0 w-[380px] max-w-[95vw] bg-white border-l border-[#e5e5ea] z-[301] transition-transform duration-260 cubic-bezier(0.32,0,0.15,1) flex flex-col overflow-y-auto font-[-apple-system,'DM_Sans',sans-serif] antialiased"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}
      >

        {/* Top bar */}
        <div className="flex items-center gap-3 p-4 border-b border-[#f5f5f7] sticky top-0 bg-white z-10 shrink-0">
          <button 
            className="w-7 h-7 rounded-full bg-[#f5f5f7] border border-[#e5e5ea] flex items-center justify-center text-[#aeaeb2] cursor-pointer transition-all duration-150 hover:bg-[#e5e5ea] hover:text-[#6e6e73] shrink-0"
            onClick={handleClose} 
            aria-label="Close"
          >
            <CloseIcon sx={{ fontSize: 14 }} />
          </button>
          <span className="flex-1 text-[13px] font-semibold text-[#aeaeb2] tracking-[0.2px]">
            User Details
          </span>
          <button
            ref={actionsRef}
            className="flex items-center gap-1.5 py-1.5 px-3.5 bg-[#fa243c] border-none rounded-full text-white text-[12.5px] font-semibold cursor-pointer transition-colors duration-150 hover:bg-[#fa243c]"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          >
            <MoreHorizIcon sx={{ fontSize: 13 }} />
            Actions
          </button>
        </div>

        {/* Hero */}
        <div className="flex items-start gap-4 p-5 pt-6">
          <div className="shrink-0">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="w-[66px] h-[66px] rounded-full object-cover" />
            ) : (
              <div className="w-[66px] h-[66px] rounded-full bg-[#fff0f3] border border-[#ffd1d9] flex items-center justify-center text-[26px] font-bold text-[#fa243c]">
                {(user.name || user.email || "?")[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5 min-w-0 pt-1">
            <h2 className="text-xl font-bold text-[#1d1d1f] tracking-[-0.4px] truncate m-0">
              {user.name || "Unnamed User"}
            </h2>
            <p className="text-[13px] text-[#aeaeb2] truncate m-0">
              {user.email}
            </p>
            <div className="flex gap-1.5 flex-wrap mt-0.5">
              {/* Role Pill */}
              <span 
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-semibold border"
                style={{ 
                  color: role.color, 
                  background: role.bg, 
                  borderColor: role.border 
                }}
              >
                {role.label}
              </span>
              {/* Status Pill */}
              <span 
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-semibold border"
                style={{ 
                  color: status.color, 
                  background: status.bg, 
                  borderColor: status.border 
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
                {status.label}
              </span>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#f5f5f7] mx-5" />

        {/* Info grid */}
        <div className="p-5">
          <p className="text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.7px] mb-3">
            Account Info
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "User ID",    value: user.uid.slice(0,20) + "…", mono: true },
              { label: "Role",       value: role.label, color: role.color },
              { label: "Joined",     value: formatDate(user.createdAt) },
              { label: "Last Login", value: user.lastLoginAt ? formatDate(user.lastLoginAt) : "—" },
              { label: "Status",     value: status.label, color: status.color },
              { label: "Email",      value: user.email, small: true },
            ].map((item) => (
              <div 
                key={item.label} 
                className="bg-[#fafafa] border border-[#f5f5f7] rounded-xl p-3 flex flex-col gap-1"
              >
                <span className="text-[10.5px] font-semibold text-[#aeaeb2] uppercase tracking-[0.5px]">
                  {item.label}
                </span>
                <span
                  className={`text-[13px] font-medium text-[#1d1d1f] truncate ${
                    item.mono ? "font-mono text-[11px]" : ""
                  } ${item.small ? "text-[11.5px]" : ""}`}
                  style={item.color ? { color: item.color } : undefined}
                  title={item.value}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hint */}
        <div className="mx-5 mb-6 flex items-start gap-2 p-3 bg-[#fafafa] border border-[#f5f5f7] rounded-lg text-xs text-[#aeaeb2] leading-relaxed">
          <InfoIcon sx={{ fontSize: 13, color: "#aeaeb2", flexShrink: 0, marginTop: "1px" }} />
          <span>
            Use <strong className="text-[#6e6e73] font-semibold">Actions</strong> above to change role, status, or delete.
          </span>
        </div>
      </div>

      {menuOpen && (
        <UserActionsMenu
          user={user}
          onClose={() => setMenuOpen(false)}
          anchorRef={actionsRef}
        />
      )}
    </>,
    document.body
  );
};

export default UserDetailsModal;