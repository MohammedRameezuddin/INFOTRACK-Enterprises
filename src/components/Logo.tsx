import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Shiny metallic blue gradient for the letter I */}
        <linearGradient id="metal-blue" x1="60" y1="40" x2="140" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" /> {/* Electric Cyan */}
          <stop offset="50%" stopColor="#0ea5e9" /> {/* Electric Blue */}
          <stop offset="100%" stopColor="#1d4ed8" /> {/* Deep Royal Blue */}
        </linearGradient>
        
        {/* Shiny gradient for orbital swoosh */}
        <linearGradient id="swoosh-gradient" x1="20" y1="180" x2="180" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="30%" stopColor="#0ea5e9" />
          <stop offset="70%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        
        {/* Circuit nodes gradient */}
        <linearGradient id="circuit-grad" x1="25" y1="70" x2="90" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>

        {/* Drop shadow for 3D depth */}
        <filter id="logo-glow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#0ea5e9" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter="url(#logo-glow)">
        {/* Circuit traces/lines on the left */}
        <g stroke="url(#circuit-grad)" strokeWidth="3" strokeLinecap="round" opacity="0.9">
          {/* Circuit trace 1 */}
          <path d="M 35 70 H 75 L 90 85 H 105" />
          {/* Circuit trace 2 */}
          <path d="M 25 100 H 75 L 85 100" />
          {/* Circuit trace 3 */}
          <path d="M 30 130 H 65 L 80 115 H 95" />
          {/* Circuit trace 4 */}
          <path d="M 40 150 H 60 L 75 135" />
        </g>

        {/* Circuit circular nodes */}
        <g fill="url(#circuit-grad)">
          <circle cx="35" cy="70" r="5" />
          <circle cx="25" cy="100" r="6" />
          <circle cx="30" cy="130" r="5" />
          <circle cx="40" cy="150" r="4" />
          
          {/* Connecting digital block nodes (pixel/square patterns) */}
          <rect x="52" y="66" width="7" height="7" rx="1.5" fill="#38bdf8" />
          <rect x="64" y="96" width="8" height="8" rx="2" fill="#0ea5e9" />
          <rect x="48" y="126" width="6" height="6" rx="1.5" fill="#1d4ed8" />
          <rect x="80" y="81" width="6" height="6" rx="1.5" fill="#38bdf8" />
          <rect x="76" y="111" width="6" height="6" rx="1.5" fill="#0ea5e9" />
        </g>

        {/* Stylized 3D letter "I" */}
        {/* Shadow layer for depth */}
        <path
          d="M 90 50 H 135 V 65 H 122 V 135 H 135 V 150 H 90 V 135 H 103 V 65 H 90 Z"
          fill="#030712"
          opacity="0.2"
          transform="translate(3, 4)"
        />
        {/* Main "I" body */}
        <path
          d="M 90 50 H 135 V 65 H 122 V 135 H 135 V 150 H 90 V 135 H 103 V 65 H 90 Z"
          fill="url(#metal-blue)"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Lower dynamic orbital swoosh wrapping in front of the "I" */}
        <path
          d="M 30 145 C 50 172, 130 182, 175 142 C 181 136, 173 128, 166 134 C 128 168, 64 160, 44 138 C 40 133, 27 139, 30 145 Z"
          fill="url(#swoosh-gradient)"
        />
        
        {/* Upper dynamic orbital swoosh looping behind the top of the "I" */}
        <path
          d="M 170 55 C 150 28, 70 18, 25 58 C 19 64, 27 72, 34 66 C 72 32, 136 40, 156 62 C 160 67, 173 61, 170 55 Z"
          fill="url(#swoosh-gradient)"
          opacity="0.8"
        />
      </g>
    </svg>
  );
};
