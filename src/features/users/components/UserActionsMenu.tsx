import { useEffect, useRef, useState } from "react";
import { IUser } from "../types";
import {
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../services/userAdmin.service";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import DeleteIcon from "@mui/icons-material/Delete";
// import CloseIcon from "@mui/icons-material/Close";

interface Props {
  user: IUser;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

type ActionState = "idle" | "loading" | "confirm-delete";

const UserActionsMenu = ({ user, onClose, anchorRef }: Props) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos]               = useState({ top: 0, left: 0, ready: false });
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [activeAction, setActiveAction] = useState<string | null>(null);

  useEffect(() => {
    const place = () => {
      if (!anchorRef.current || !menuRef.current) return;
      const btn  = anchorRef.current.getBoundingClientRect();
      const menu = menuRef.current.getBoundingClientRect();
      const vw   = window.innerWidth;
      const vh   = window.innerHeight;

      let left = btn.right + 8;
      let top  = btn.top;

      if (left + menu.width > vw - 8) left = btn.left - menu.width - 8;
      if (left < 8)                    left = 8;
      if (top + menu.height > vh - 8) top  = vh - menu.height - 8;
      if (top < 8)                     top  = 8;

      setPos({ top, left, ready: true });
    };
    const t = setTimeout(place, 10);
    return () => clearTimeout(t);
  }, [anchorRef, actionState]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node))   return;
      if (anchorRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onClose, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onClose, true);
    };
  }, [onClose, anchorRef]);

  const run = async (key: string, fn: () => Promise<void>) => {
    setActiveAction(key);
    setActionState("loading");
    try { await fn(); onClose(); }
    catch (err) { console.error(err); }
    finally { setActionState("idle"); setActiveAction(null); }
  };

  const handleDelete = async () => {
    setActiveAction("delete");
    setActionState("loading");
    try { await deleteUser(user.uid); onClose(); }
    catch (err) { console.error(err); }
    finally { setActionState("idle"); setActiveAction(null); }
  };

  const isLoading = (key: string) => actionState === "loading" && activeAction === key;

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] w-[244px] bg-white border border-[#e5e5ea] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06),0_0_0_0.5px_rgba(0,0,0,0.04)] font-[-apple-system,'DM_Sans',sans-serif] antialiased transition-opacity duration-150 animate-[amPop_0.15s_cubic-bezier(0.2,0.9,0.3,1.1)]"
      style={{ top: pos.top, left: pos.left, opacity: pos.ready ? 1 : 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 p-3">
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#fff0f3] border border-[#ffd1d9] flex items-center justify-center text-[13px] font-bold text-[#fa243c] shrink-0">
            {(user.name || "?")[0].toUpperCase()}
          </div>
        )}
        <div className="flex flex-col gap-[1px] min-w-0">
          <span className="text-[12.5px] font-semibold text-[#1d1d1f] truncate">
            {user.name || "Unnamed"}
          </span>
          <span className="text-[11px] text-[#aeaeb2] truncate">
            {user.email}
          </span>
        </div>
      </div>

      <div className="h-px bg-[#f5f5f7] my-1" />

      {/* Role Section */}
      <p className="pt-1.5 px-3.5 pb-1 text-[10.5px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px]">
        Change Role
      </p>

      {/* Promote to Admin */}
      <button
        className={`w-full flex items-center gap-2 px-3.5 py-2 bg-none border-none cursor-pointer font-inherit text-[13px] font-medium text-left transition-colors duration-100 hover:bg-[#fafafa] disabled:opacity-35 disabled:cursor-not-allowed ${
          user.role === "admin" ? "text-[#1d1d1f]" : "text-[#1d1d1f]"
        }`}
        disabled={user.role === "admin" || isLoading("role-admin")}
        onClick={() => run("role-admin", () => updateUserRole(user.uid, "admin"))}
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-[7px] shrink-0 bg-[#faf5ff] text-[#af52de]">
          <AdminPanelSettingsIcon sx={{ fontSize: 14 }} />
        </span>
        <span className="flex-1">Promote to Admin</span>
        {isLoading("role-admin") && <span className="w-3 h-3 border-2 border-[#f5f5f7] border-t-[#fa243c] rounded-full animate-spin ml-auto shrink-0" />}
        {user.role === "admin" && (
          <span className="text-[#fa243c] flex items-center ml-auto">
            <CheckCircleIcon sx={{ fontSize: 14 }} />
          </span>
        )}
      </button>

      {/* Demote to User */}
      <button
        className={`w-full flex items-center gap-2 px-3.5 py-2 bg-none border-none cursor-pointer font-inherit text-[13px] font-medium text-left transition-colors duration-100 hover:bg-[#fafafa] disabled:opacity-35 disabled:cursor-not-allowed ${
          user.role === "user" ? "text-[#1d1d1f]" : "text-[#1d1d1f]"
        }`}
        disabled={user.role === "user" || isLoading("role-user")}
        onClick={() => run("role-user", () => updateUserRole(user.uid, "user"))}
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-[7px] shrink-0 bg-[#f5f5f7] text-[#6e6e73]">
          <PersonIcon sx={{ fontSize: 14 }} />
        </span>
        <span className="flex-1">Demote to User</span>
        {isLoading("role-user") && <span className="w-3 h-3 border-2 border-[#f5f5f7] border-t-[#fa243c] rounded-full animate-spin ml-auto shrink-0" />}
        {user.role === "user" && (
          <span className="text-[#fa243c] flex items-center ml-auto">
            <CheckCircleIcon sx={{ fontSize: 14 }} />
          </span>
        )}
      </button>

      <div className="h-px bg-[#f5f5f7] my-1" />

      {/* Status Section */}
      <p className="pt-1.5 px-3.5 pb-1 text-[10.5px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px]">
        Change Status
      </p>

      {/* Set Active */}
      <button
        className={`w-full flex items-center gap-2 px-3.5 py-2 bg-none border-none cursor-pointer font-inherit text-[13px] font-medium text-left transition-colors duration-100 hover:bg-[#fafafa] disabled:opacity-35 disabled:cursor-not-allowed ${
          user.status === "active" ? "text-[#1d1d1f]" : "text-[#1d1d1f]"
        }`}
        disabled={user.status === "active" || isLoading("status-active")}
        onClick={() => run("status-active", () => updateUserStatus(user.uid, "active"))}
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-[7px] shrink-0 bg-[#f0fdf4] text-[#34c759]">
          <CheckCircleIcon sx={{ fontSize: 14 }} />
        </span>
        <span className="flex-1">Set Active</span>
        {isLoading("status-active") && <span className="w-3 h-3 border-2 border-[#f5f5f7] border-t-[#fa243c] rounded-full animate-spin ml-auto shrink-0" />}
        {user.status === "active" && (
          <span className="text-[#fa243c] flex items-center ml-auto">
            <CheckCircleIcon sx={{ fontSize: 14 }} />
          </span>
        )}
      </button>

      {/* Suspend Account */}
      <button
        className={`w-full flex items-center gap-2 px-3.5 py-2 bg-none border-none cursor-pointer font-inherit text-[13px] font-medium text-left transition-colors duration-100 hover:bg-[#fafafa] disabled:opacity-35 disabled:cursor-not-allowed ${
          user.status === "suspended" ? "text-[#1d1d1f]" : "text-[#1d1d1f]"
        }`}
        disabled={user.status === "suspended" || isLoading("status-suspended")}
        onClick={() => run("status-suspended", () => updateUserStatus(user.uid, "suspended"))}
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-[7px] shrink-0 bg-[#fffbeb] text-[#ff9f0a]">
          <BlockIcon sx={{ fontSize: 14 }} />
        </span>
        <span className="flex-1">Suspend Account</span>
        {isLoading("status-suspended") && <span className="w-3 h-3 border-2 border-[#f5f5f7] border-t-[#fa243c] rounded-full animate-spin ml-auto shrink-0" />}
        {user.status === "suspended" && (
          <span className="text-[#fa243c] flex items-center ml-auto">
            <CheckCircleIcon sx={{ fontSize: 14 }} />
          </span>
        )}
      </button>

      {/* Ban Account */}
      <button
        className={`w-full flex items-center gap-2 px-3.5 py-2 bg-none border-none cursor-pointer font-inherit text-[13px] font-medium text-left transition-colors duration-100 hover:bg-[#fafafa] disabled:opacity-35 disabled:cursor-not-allowed ${
          user.status === "banned" ? "text-[#1d1d1f]" : "text-[#1d1d1f]"
        }`}
        disabled={user.status === "banned" || isLoading("status-banned")}
        onClick={() => run("status-banned", () => updateUserStatus(user.uid, "banned"))}
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-[7px] shrink-0 bg-[#fff0f3] text-[#fa243c]">
          <BlockIcon sx={{ fontSize: 14 }} />
        </span>
        <span className="flex-1">Ban Account</span>
        {isLoading("status-banned") && <span className="w-3 h-3 border-2 border-[#f5f5f7] border-t-[#fa243c] rounded-full animate-spin ml-auto shrink-0" />}
        {user.status === "banned" && (
          <span className="text-[#fa243c] flex items-center ml-auto">
            <CheckCircleIcon sx={{ fontSize: 14 }} />
          </span>
        )}
      </button>

      <div className="h-px bg-[#f5f5f7] my-1" />

      {/* Delete Section */}
      {actionState !== "confirm-delete" ? (
        <button
          className="w-full flex items-center gap-2 px-3.5 py-2 bg-none border-none cursor-pointer font-inherit text-[13px] font-medium text-left transition-colors duration-100 text-[#fa243c] hover:bg-[#fff0f3] disabled:opacity-35 disabled:cursor-not-allowed"
          disabled={isLoading("delete")}
          onClick={() => setActionState("confirm-delete")}
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-[7px] shrink-0 bg-[#fff0f3] text-[#fa243c]">
            <DeleteIcon sx={{ fontSize: 14 }} />
          </span>
          <span className="flex-1">Delete User</span>
        </button>
      ) : (
        <div className="p-3.5 pt-2.5 flex flex-col gap-2.5">
          <p className="text-xs text-[#6e6e73] leading-relaxed">
            Permanently delete this user?
          </p>
          <div className="flex gap-1.5">
            <button
              className="flex-1 py-2 px-2 rounded-full border border-[#e5e5ea] bg-white text-[#6e6e73] text-xs font-semibold cursor-pointer transition-all duration-150 hover:bg-[#fafafa] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setActionState("idle")}
            >
              Cancel
            </button>
            <button
              className="flex-1 py-2 px-2 rounded-full bg-[#fa243c] border border-[#fa243c] text-white text-xs font-semibold cursor-pointer transition-all duration-150 hover:bg-[#fa243c] hover:border-[#fa243c] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading("delete")}
              onClick={handleDelete}
            >
              {isLoading("delete") ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      )}

      {/* Animation Keyframes */}
      <style>{`
        @keyframes amPop {
          from { opacity: 0; transform: scale(0.95) translateY(-4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default UserActionsMenu;