import { useState } from "react";
import { IUser } from "../types";
import UserRow from "./UserRow";
import UserDetailsModal from "./UserDetailsModal";
import PersonIcon from "@mui/icons-material/Person";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

interface Props {
  users: IUser[];
  loading: boolean;
}

type SortKey = "name" | "role" | "status" | "createdAt";
type SortDir = "asc" | "desc";

const UserTable = ({ users, loading }: Props) => {
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [sortKey, setSortKey]           = useState<SortKey>("createdAt");
  const [sortDir, setSortDir]           = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sorted = [...users].sort((a, b) => {
    let av: any, bv: any;
    if (sortKey === "createdAt") {
      av = a.createdAt?.toDate?.()?.getTime() ?? 0;
      bv = b.createdAt?.toDate?.()?.getTime() ?? 0;
    } else {
      av = (a[sortKey] ?? "").toString().toLowerCase();
      bv = (b[sortKey] ?? "").toString().toLowerCase();
    }
    if (av < bv) return sortDir === "asc" ? -1 :  1;
    if (av > bv) return sortDir === "asc" ?  1 : -1;
    return 0;
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    const active = sortKey === col;
    if (!active) return <PersonIcon sx={{ fontSize: 11, color: "#d1d1d6" }} />;
    
    return sortDir === "asc" ? (
      <ArrowUpwardIcon sx={{ fontSize: 11, color: "#fa243c" }} />
    ) : (
      <ArrowDownwardIcon sx={{ fontSize: 11, color: "#fa243c" }} />
    );
  };

  return (
    <>
      <div className="bg-white border border-[#e5e5ea] rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)] font-[-apple-system,'DM_Sans',sans-serif]">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3.5 py-[72px] px-6">
            <div className="w-6 h-6 border-2 border-[#f5f5f7] border-t-[#fa243c] rounded-full animate-spin" />
            <span className="text-sm text-[#aeaeb2]">Loading users…</span>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3.5 py-[72px] px-6">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="#e5e5ea" strokeWidth="1.5"/>
              <circle cx="20" cy="15" r="5.5" stroke="#d1d1d6" strokeWidth="1.3"/>
              <path d="M7 34c0-7.18 5.82-10 13-10s13 2.82 13 10" stroke="#d1d1d6" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <span className="text-sm text-[#aeaeb2]">No users found</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-[#f5f5f7] bg-[#fafafa]">
                  <th className="py-3 px-4 text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px] text-left whitespace-nowrap min-w-[220px]">
                    <button 
                      className="inline-flex items-center gap-1 bg-none border-none text-inherit font-inherit text-[11px] font-semibold uppercase tracking-[0.6px] cursor-pointer p-0 whitespace-nowrap transition-colors duration-150 hover:text-[#6e6e73]"
                      onClick={() => handleSort("name")}
                    >
                      User <SortIcon col="name" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px] text-left whitespace-nowrap">
                    <button 
                      className="inline-flex items-center gap-1 bg-none border-none text-inherit font-inherit text-[11px] font-semibold uppercase tracking-[0.6px] cursor-pointer p-0 whitespace-nowrap transition-colors duration-150 hover:text-[#6e6e73]"
                      onClick={() => handleSort("role")}
                    >
                      Role <SortIcon col="role" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px] text-left whitespace-nowrap">
                    <button 
                      className="inline-flex items-center gap-1 bg-none border-none text-inherit font-inherit text-[11px] font-semibold uppercase tracking-[0.6px] cursor-pointer p-0 whitespace-nowrap transition-colors duration-150 hover:text-[#6e6e73]"
                      onClick={() => handleSort("status")}
                    >
                      Status <SortIcon col="status" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-[11px] font-semibold text-[#aeaeb2] uppercase tracking-[0.6px] text-left whitespace-nowrap">
                    <button 
                      className="inline-flex items-center gap-1 bg-none border-none text-inherit font-inherit text-[11px] font-semibold uppercase tracking-[0.6px] cursor-pointer p-0 whitespace-nowrap transition-colors duration-150 hover:text-[#6e6e73]"
                      onClick={() => handleSort("createdAt")}
                    >
                      Joined <SortIcon col="createdAt" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-[11px] font-semibold text-[#c7c7cc] uppercase tracking-[0.6px] text-left whitespace-nowrap">
                    Last Login
                  </th>
                  <th className="py-3 px-4 w-8" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((user) => (
                  <UserRow
                    key={user.uid}
                    user={user}
                    onSelect={setSelectedUser}
                    isSelected={selectedUser?.uid === user.uid}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserDetailsModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </>
  );
};

export default UserTable;