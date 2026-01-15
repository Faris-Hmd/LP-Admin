import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Standard Apple Touch Icon size
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: "#020617", // Slate-950 (Outer frame)
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "40px",
      }}
    >
      <div
        style={{
          background: "#ffffff", // Inverted to White Background
          width: "90%",
          height: "90%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "36px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="115"
          height="115"
        >
          {/* Processor Frame */}
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="4"
            stroke="#1d4ed8"
            strokeWidth="2"
          />

          {/* Central Core (Solid Block) */}
          <rect x="9" y="9" width="6" height="6" rx="1" fill="#1d4ed8" />

          {/* Data Paths */}
          <path
            d="M12 3V7M12 17V21M3 12H7M17 12H21"
            stroke="#1d4ed8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Interconnects */}
          <path
            d="M7 7L9 9M15 15L17 17M17 7L15 9M9 15L7 17"
            stroke="#1d4ed8"
            strokeWidth="1.2"
            strokeLinecap="round"
            style={{ opacity: 0.4 }}
          />
        </svg>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
