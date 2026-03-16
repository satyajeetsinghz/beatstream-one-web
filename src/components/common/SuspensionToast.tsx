import { useEffect, useState } from "react";
import { useSuspension } from "@/context/SuspensionContext";

const MESSAGES = [
  "Some features are unavailable while suspended.",
  "You're browsing in limited mode while suspended.",
  "Likes and playlists are disabled.",
  "Contact support to appeal your suspension.",
];

let messageIndex = 0;

const SuspensionToast = () => {
  const { showToast, dismissToast } = useSuspension();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(MESSAGES[0]);

  useEffect(() => {
    if (!showToast) {
      setVisible(false);
      return;
    }
    setMessage(MESSAGES[messageIndex % MESSAGES.length]);
    messageIndex++;
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [showToast]);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(dismissToast, 300);
    }, 6000);
    return () => clearTimeout(t);
  }, [showToast, dismissToast]);

  if (!showToast) return null;

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(dismissToast, 300);
  };

  return (
    <>
      <div
        className={`st-root ${visible ? "st-in" : "st-out"}`}
        role="alert"
        aria-live="polite"
      >
        {/* Icon */}
        <div className="st-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="#ff375f" strokeWidth="1.4" />
            <path d="M8 5v4M8 11v.3"
              stroke="#ff375f" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Text */}
        <div className="st-body">
          <p className="st-title">Account Suspended</p>
          <p className="st-msg">{message}</p>
        </div>

        {/* Actions */}
        <div className="st-right">
          <a href="mailto:support@beatstream.com" className="st-appeal">
            Appeal
          </a>
          <button className="st-close" onClick={handleDismiss} aria-label="Dismiss">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 2l6 6M8 2l-6 6"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className={`st-bar ${visible ? "st-bar-run" : ""}`} />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .st-root {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          width: 340px;
          background: #ffffff;
          border: 1px solid #e5e5ea;
          border-radius: 16px;
          overflow: hidden;
          font-family: -apple-system, 'DM Sans', BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
          box-shadow:
            0 4px 24px rgba(0,0,0,0.08),
            0 1px 4px rgba(0,0,0,0.04),
            0 0 0 0.5px rgba(0,0,0,0.04);
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 14px 16px;
          transition:
            transform 0.28s cubic-bezier(0.22,1,0.36,1),
            opacity 0.22s ease;
        }

        .st-in  { transform: translateY(0) scale(1); opacity: 1; }
        .st-out { transform: translateY(10px) scale(0.97); opacity: 0; pointer-events: none; }

        /* Icon box */
        .st-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #fff0f3;
          border: 1px solid #ffd1d9;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* Text */
        .st-body { flex: 1; min-width: 0; }
        .st-title {
          font-size: 13px;
          font-weight: 600;
          color: #1d1d1f;
          margin: 0 0 3px;
          letter-spacing: -0.1px;
        }
        .st-msg {
          font-size: 12.5px;
          color: #6e6e73;
          margin: 0;
          line-height: 1.5;
        }

        /* Right */
        .st-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* Appeal — red pill */
        .st-appeal {
          display: inline-flex;
          align-items: center;
          padding: 5px 14px;
          border-radius: 980px;
          font-size: 12px;
          font-weight: 600;
          font-family: inherit;
          background: #ff375f;
          color: #ffffff;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.13s;
          -webkit-font-smoothing: antialiased;
        }
        .st-appeal:hover { background: #e02650; }

        /* Dismiss — ghost circle */
        .st-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: transparent;
          border: 1px solid #e5e5ea;
          color: #aeaeb2;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.12s, color 0.12s;
        }
        .st-close:hover { background: #f5f5f7; color: #6e6e73; }

        /* Progress bar */
        .st-bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: #f5f5f7;
          transform-origin: left;
          transform: scaleX(0);
        }
        .st-bar-run {
          background: #ff375f;
          animation: stDrain 6s linear forwards;
        }
        @keyframes stDrain {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }

        @media (max-width: 400px) {
          .st-root { width: calc(100vw - 32px); right: 16px; bottom: 16px; }
        }
      `}</style>
    </>
  );
};

export default SuspensionToast;