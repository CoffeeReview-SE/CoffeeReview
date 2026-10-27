import React from "react";

/** SaigonCoffee's shared cup mark. Use tone="light" on dark navigation bars. */
export default function BrandLogo({ size = 32, tone = "brown", className = "" }) {
  const cupColor = tone === "light" ? "#fff" : "#6b4528";
  const steamColor = tone === "light" ? "rgba(255,255,255,.72)" : "#aaa";

  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke={steamColor} strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 23c-8-1-12-4-11-9 1-5 9-6 12-9 2-2 3-4 3-6" strokeWidth="2.8" />
        <path d="M36 23c7-2 11-5 11-10 0-4-4-6-8-7" strokeWidth="2.5" />
        <path d="M27 22c-1-4 1-6 5-8" strokeWidth="2.2" />
      </g>
      <g stroke={cupColor} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 31c7 7 33 7 40 0" strokeWidth="2.7" />
        <path d="M14 32c1 12 5 19 18 19s17-7 18-19" strokeWidth="3.1" />
        <path d="M50 35h3c6 0 7 10 0 12l-5 1" strokeWidth="2.8" />
        <path d="M13 56c10 5 28 5 38 0-10-5-28-5-38 0Z" strokeWidth="2.8" />
      </g>
    </svg>
  );
}
