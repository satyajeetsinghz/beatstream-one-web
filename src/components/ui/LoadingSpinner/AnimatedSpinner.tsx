interface AnimatedSpinnerProps {
  size?: number;
  color?: string;
  secondaryColor?: string;
  className?: string;
}

const AnimatedSpinner = ({ 
  size = 16, 
  color = "#ff375f", 
  secondaryColor = "#D9D9D9",
  className = "" 
}: AnimatedSpinnerProps) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; fill: ${secondaryColor}; }
          50% { opacity: 1; fill: ${color}; }
        }
        .bar1 { animation: pulse 1.2s ease-in-out infinite; }
        .bar2 { animation: pulse 1.2s ease-in-out 0.1s infinite; }
        .bar3 { animation: pulse 1.2s ease-in-out 0.2s infinite; }
        .bar4 { animation: pulse 1.2s ease-in-out 0.3s infinite; }
        .bar5 { animation: pulse 1.2s ease-in-out 0.4s infinite; }
        .bar6 { animation: pulse 1.2s ease-in-out 0.5s infinite; }
        .bar7 { animation: pulse 1.2s ease-in-out 0.6s infinite; }
        .bar8 { animation: pulse 1.2s ease-in-out 0.7s infinite; }
      `}</style>
      
      {/* Top */}
      <rect x="22" width="4" height="12" rx="2" fill={secondaryColor} className="bar1" />
      
      {/* Bottom */}
      <rect x="22" y="36" width="4" height="12" rx="2" fill={secondaryColor} className="bar5" />
      
      {/* Left */}
      <rect y="26" width="4" height="12" rx="2" transform="rotate(-90 0 26)" fill="#2D2D2D" className="bar3" />
      
      {/* Right */}
      <rect x="36" y="26" width="4" height="12" rx="2" transform="rotate(-90 36 26)" fill={secondaryColor} className="bar7" />
      
      {/* Top-left diagonal */}
      <rect x="5.61523" y="8.4436" width="4" height="12" rx="2" transform="rotate(-45 5.61523 8.4436)" fill={secondaryColor} className="bar2" />
      
      {/* Bottom-right diagonal */}
      <rect x="31.071" y="33.8995" width="4" height="12" rx="2" transform="rotate(-45 31.071 33.8995)" fill={secondaryColor} className="bar6" />
      
      {/* Top-right diagonal */}
      <rect x="8.4436" y="42.3848" width="4" height="12" rx="2" transform="rotate(-135 8.4436 42.3848)" fill={secondaryColor} className="bar4" />
      
      {/* Bottom-left diagonal */}
      <rect x="33.8994" y="16.9288" width="4" height="12" rx="2" transform="rotate(-135 33.8994 16.9288)" fill={secondaryColor} className="bar8" />
    </svg>
  );
};

export default AnimatedSpinner;