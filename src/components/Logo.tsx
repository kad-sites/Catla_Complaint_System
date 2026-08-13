import React from 'react';

interface LogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export function Logo({ className = '', width = 40, height = 40 }: LogoProps) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="120" height="120" rx="24" fill="#75af47" />
      <text 
        x="60" 
        y="75" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        fontSize="52" 
        fontWeight="800" 
        fill="white" 
        textAnchor="middle"
        letterSpacing="-2"
      >
        CBS
      </text>
    </svg>
  );
}
