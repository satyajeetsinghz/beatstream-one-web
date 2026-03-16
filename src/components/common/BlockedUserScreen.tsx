import { logoutUser } from "@/features/auth/services/auth.service";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { LockOutlineRounded } from "@mui/icons-material";

interface Props {
  reason?: string;
}

// ── Option Card ───────────────────────────────────────────────────────────────

interface CardProps {
  tag: string;
  title: string;
  description: string;
  buttonLabel: string;
  icon: React.ReactNode;
  onClick: () => void;
  delay: string;
  primary?: boolean;
}

const OptionCard = ({
  tag, title, description, buttonLabel, icon, onClick, delay, primary,
}: CardProps) => (
  <div 
    className="bg-white rounded-[20px] p-[30px_26px_26px] flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.05),0_0_0_0.5px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.06)] hover:-translate-y-[3px] animate-[cardIn_0.45s_cubic-bezier(0.22,1,0.36,1)_both]"
    style={{ animationDelay: delay }}
  >
    <span className="inline-flex items-center gap-[6px] text-[13px] font-semibold text-[#fa243c] mb-[14px] tracking-[0.05px]">
      <span className="flex items-center shrink-0 text-[#fa243c]">{icon}</span>
      {tag}
    </span>
    <h3 className="text-2xl font-bold text-[#1d1d1f] tracking-[-0.5px] leading-[1.15] mb-[10px]">
      {title}
    </h3>
    <p className="text-[15px] text-[#6e6e73] leading-[1.6] mb-[28px] flex-1">
      {description}
    </p>
    <button
      className={`inline-flex items-center justify-center px-6 py-1.5 rounded-[980px] text-[15px] font-semibold cursor-pointer border-none self-start tracking-[-0.1px] transition-all duration-150 active:scale-[0.97] ${
        primary 
          ? 'bg-[#fa243c] text-white hover:bg-[#d93025]' 
          : 'bg-[#1d1d1f] text-white hover:bg-[#3a3a3c]'
      }`}
      onClick={onClick}
    >
      {buttonLabel}
    </button>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────

const BlockedUserScreen = ({ reason }: Props) => {
  const handleSignOut = async () => {
    await logoutUser();
    window.location.href = "/";
  };

  const handleSupport = () => {
    window.location.href = "mailto:support@beatstream.com";
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center px-8 py-[52px] pb-11 antialiased">
      
      {/* Header */}
      <div className="w-full max-w-[1040px] flex items-end justify-between gap-5 mb-7 animate-[fadeUp_0.4s_cubic-bezier(0.22,1,0.36,1)_both]">
        <div>
          <h1 className="text-[clamp(30px,3.8vw,46px)] font-bold text-[#1d1d1f] tracking-[-1px] leading-[1.08] mb-[10px]">
            Your account has been locked.
          </h1>
          {reason && (
            <p className="text-[15px] text-[#6e6e73] leading-[1.5] max-w-[520px]">
              <span className="font-semibold text-[#fa243c]">Reason: </span>
              {reason}
            </p>
          )}
        </div>
        <a 
          href="mailto:support@beatstream.com" 
          className="text-[17px] font-medium text-[#fa243c] whitespace-nowrap shrink-0 pb-3 hover:opacity-65 transition-opacity"
        >
          Appeal decision ›
        </a>
      </div>

      {/* Cards Grid */}
      <div className="w-full max-w-[1040px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <OptionCard
          tag="Locked"
          icon={<LockOutlineRounded sx={{ fontSize: 18 }} />}
          title="Access permanently restricted"
          description="This account has been locked and no longer has access to BeatStream. All features and data have been locked."
          buttonLabel="Learn more"
          onClick={handleSupport}
          delay="0ms"
          primary
        />
        <OptionCard
          tag="Support"
          icon={<HelpOutlineIcon sx={{ fontSize: 18 }} />}
          title="Contact Support"
          description="If you believe this is a mistake, reach out to our team. We'll review your case and respond within 48 hours."
          buttonLabel="Get help"
          onClick={handleSupport}
          delay="55ms"
        />
        <OptionCard
          tag="Exit"
          icon={<ExitToAppIcon sx={{ fontSize: 18 }} />}
          title="Sign out"
          description="Return to the login screen. Your appeal can be submitted any time via our support team."
          buttonLabel="Sign out"
          onClick={handleSignOut}
          delay="110ms"
        />
      </div>

      {/* Footer */}
      <p className="mt-7 text-xs text-[#aeaeb2] tracking-[0.2px] animate-[fadeUp_0.4s_0.2s_cubic-bezier(0.22,1,0.36,1)_both]">
        BeatStream · Account Access Restricted
      </p>

      {/* Keyframes */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default BlockedUserScreen;