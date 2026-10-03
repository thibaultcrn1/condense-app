import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #8b5cf6, #d946ef)",
        }}
      >
        <svg width="110" height="110" viewBox="0 0 32 32">
          <path d="M11 8.5v15l5.2-3V11.5z" fill="#fff" />
          <path d="M18.2 12.7l5.8 3.3-5.8 3.3z" fill="#fff" fillOpacity=".85" />
        </svg>
      </div>
    ),
    size,
  );
}
