import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const alt = "App Catequistas - Controle de Presença"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  const fontData = await readFile(
    join(process.cwd(), "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf")
  )

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)",
        fontFamily: "Geist",
      }}
    >
      <svg width="80" height="80" viewBox="0 0 192 192" style={{ marginBottom: "24px" }}>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
        <rect width="192" height="192" rx="32" fill="#09090b" />
        <rect x="40" y="24" width="112" height="144" rx="12" fill="url(#g)" opacity="0.15" />
        <path d="M96 40 L72 72 L72 88 L56 96 L56 144 L136 144 L136 96 L120 88 L120 72 Z" fill="url(#g)" />
        <rect x="86" y="60" width="20" height="16" rx="2" fill="#09090b" />
        <rect x="76" y="104" width="14" height="28" rx="2" fill="#09090b" />
        <rect x="102" y="104" width="14" height="28" rx="2" fill="#09090b" />
      </svg>

      <div
        style={{
          fontSize: "64px",
          fontWeight: "700",
          color: "#ffffff",
          marginBottom: "12px",
          letterSpacing: "-0.02em",
        }}
      >
        App Catequistas
      </div>

      <div
        style={{
          fontSize: "28px",
          color: "#22c55e",
          marginBottom: "8px",
        }}
      >
        Cadastro e Controle de Presença
      </div>

      <div
        style={{
          fontSize: "18px",
          color: "#6b7280",
          marginTop: "16px",
        }}
      >
        catequistas.housecloud.tec.br
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Geist",
          data: fontData,
          weight: 400,
          style: "normal",
        },
      ],
    }
  )
}
