import { useMemo, useState, useCallback, useTransition } from "react";
import { useUsers } from "../hooks/useUsers";
import { IUser } from "../types";
import UserTable from "../components/UserTable";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

type FilterRole   = "all" | "user" | "admin";
type FilterStatus = "all" | "active" | "suspended" | "banned";

const UserManagementPage = () => {
  const { users, loading } = useUsers();

  const [search,       setSearch]       = useState("");
  const [filterRole,   setFilterRole]   = useState<FilterRole>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const [isPending, startTransition] = useTransition();

  const [deferredSearch,  setDeferredSearch]  = useState("");
  const [deferredRole,    setDeferredRole]    = useState<FilterRole>("all");
  const [deferredStatus,  setDeferredStatus]  = useState<FilterStatus>("all");

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    startTransition(() => setDeferredSearch(value));
  }, []);

  const handleRoleChange = useCallback((value: FilterRole) => {
    setFilterRole(value);
    startTransition(() => setDeferredRole(value));
  }, []);

  const handleStatusChange = useCallback((value: FilterStatus) => {
    setFilterStatus(value);
    startTransition(() => setDeferredStatus(value));
  }, []);

  const clearFilters = useCallback(() => {
    setSearch(""); setFilterRole("all"); setFilterStatus("all");
    startTransition(() => {
      setDeferredSearch(""); setDeferredRole("all"); setDeferredStatus("all");
    });
  }, []);

  const summary = useMemo(() => ({
    total:     users.length,
    active:    users.filter((u) => (u.status ?? "active") === "active").length,
    suspended: users.filter((u) => u.status === "suspended").length,
    banned:    users.filter((u) => u.status === "banned").length,
    admins:    users.filter((u) => u.role === "admin").length,
  }), [users]);

  const filtered = useMemo<IUser[]>(() => {
    if (!deferredSearch.trim() && deferredRole === "all" && deferredStatus === "all") {
      return users;
    }
    const q = deferredSearch.trim().toLowerCase();
    return users.filter((u) => {
      if (q) {
        const hit =
          (u.name?.toLowerCase().includes(q)  ?? false) ||
          (u.email?.toLowerCase().includes(q) ?? false) ||
          u.uid.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (deferredRole   !== "all" && u.role                    !== deferredRole)   return false;
      if (deferredStatus !== "all" && (u.status ?? "active")    !== deferredStatus) return false;
      return true;
    });
  }, [users, deferredSearch, deferredRole, deferredStatus]);

  const hasActiveFilters =
    search.trim() !== "" || filterRole !== "all" || filterStatus !== "all";

  const statCards = [
    { key: "all",       label: "All Users",  value: summary.total,     accent: "#1d1d1f", isRole: false },
    { key: "active",    label: "Active",     value: summary.active,    accent: "#34c759", isRole: false },
    { key: "suspended", label: "Suspended",  value: summary.suspended, accent: "#ff9f0a", isRole: false },
    { key: "banned",    label: "Banned",     value: summary.banned,    accent: "#fa243c", isRole: false },
    { key: "admin",     label: "Admins",     value: summary.admins,    accent: "#af52de", isRole: true  },
  ];

  return (
    // ── Root: matches SectionManager exactly ──────────────────────────────────
    <div className="flex flex-col gap-7">
      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[clamp(24px,2.8vw,34px)] font-bold text-[#1d1d1f] tracking-[-0.7px] leading-[1.08] mb-1.5">
            User Management
          </h1>
          <p className="text-[15px] text-[#6e6e73] m-0">
            Monitor and control accounts in real‑time
          </p>
        </div>
        <span className="text-[15px] font-medium text-[#6e6e73] whitespace-nowrap pb-[3px]">
          {summary.total} users
        </span>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        {statCards.map((card) => {
          const isActive = card.isRole
            ? filterRole === "admin"
            : filterStatus === card.key;

          return (
            <button
              key={card.key}
              className="bg-white border border-[#e5e5ea] rounded-[18px] p-[20px_18px_18px] flex flex-col items-start gap-1 cursor-pointer font-inherit shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-[2px]"
              style={isActive ? {
                borderColor: card.accent,
                boxShadow: `0 0 0 3px ${card.accent}1e, 0 1px 4px rgba(0,0,0,0.04)`,
              } : undefined}
              onClick={() =>
                card.isRole
                  ? handleRoleChange(filterRole === "admin" ? "all" : "admin")
                  : handleStatusChange(card.key as FilterStatus)
              }
            >
              <span className="text-[28px] font-bold tracking-[-1px] leading-none" style={{ color: card.accent }}>
                {card.value}
              </span>
              <span className="text-[12px] font-medium text-[#6e6e73]">{card.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main card ── */}
      <div className="bg-white rounded-[18px] border border-[#e5e5ea] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">

        {/* Filter bar inside card header */}
        <div className="px-5 py-4 border-b border-[#f5f5f7] flex items-center gap-2 flex-wrap">

          {/* Search */}
          <div className="flex-1 min-w-[200px] relative flex items-center">
            <SearchIcon className="absolute left-3 text-[#aeaeb2] pointer-events-none" sx={{ fontSize: 14 }} />
            <input
              className="w-full py-2.5 pl-9 pr-9 bg-white border border-[#e5e5ea] rounded-lg text-[13px] text-[#1d1d1f] outline-none shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-150 focus:border-[#fa243c] focus:shadow-[0_0_0_3px_rgba(255,55,95,0.1)] placeholder:text-[#aeaeb2]"
              type="text"
              placeholder="Search by name, email or UID…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button
                className="absolute right-2 w-5 h-5 bg-[#f5f5f7] rounded-full flex items-center justify-center text-[#aeaeb2] hover:bg-[#e5e5ea] hover:text-[#6e6e73] transition-all"
                onClick={() => handleSearch("")}
                aria-label="Clear search"
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </button>
            )}
          </div>

          {/* Role */}
          <select
            className="py-2.5 px-3 bg-white border border-[#e5e5ea] rounded-lg text-[13px] text-[#1d1d1f] outline-none cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-150 focus:border-[#fa243c] focus:shadow-[0_0_0_3px_rgba(255,55,95,0.1)]"
            value={filterRole}
            onChange={(e) => handleRoleChange(e.target.value as FilterRole)}
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>

          {/* Status */}
          <select
            className="py-2.5 px-3 bg-white border border-[#e5e5ea] rounded-lg text-[13px] text-[#1d1d1f] outline-none cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-150 focus:border-[#fa243c] focus:shadow-[0_0_0_3px_rgba(255,55,95,0.1)]"
            value={filterStatus}
            onChange={(e) => handleStatusChange(e.target.value as FilterStatus)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              className="py-2.5 px-5 rounded-full bg-white border border-[#ffd1d9] text-[#fa243c] text-[13px] font-semibold cursor-pointer whitespace-nowrap transition-all duration-150 hover:bg-[#fff0f3] hover:border-[#fa243c]"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}

          {/* Result count */}
          <span
            className="text-[13px] text-[#aeaeb2] ml-auto whitespace-nowrap tabular-nums transition-opacity duration-150"
            style={{ opacity: isPending ? 0.4 : 1 }}
          >
            {filtered.length} of {summary.total}
          </span>
        </div>

        {/* Table */}
        <div className="transition-opacity duration-150" style={{ opacity: isPending ? 0.65 : 1 }}>
          <UserTable users={filtered} loading={loading} />
        </div>

        {/* Footer */}
        {!loading && users.length > 0 && (
          <div className="px-5 py-3.5 border-t border-[#f5f5f7] bg-[#fafafa] flex items-center justify-between">
            <p className="text-[12px] text-[#aeaeb2]">
              {filtered.length} {filtered.length === 1 ? "user" : "users"}
              {hasActiveFilters && filtered.length !== summary.total && (
                <span> · filtered from {summary.total} total</span>
              )}
            </p>
            <p className="text-[12px] text-[#aeaeb2]">
              {summary.active} active · {summary.suspended} suspended · {summary.banned} banned
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;