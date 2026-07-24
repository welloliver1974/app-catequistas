import { NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")
  if (!url) {
    return NextResponse.json({ error: "Parâmetro url obrigatório." }, { status: 400 })
  }

  try {
    const qrSvg = await QRCode.toString(url, {
      type: "svg",
      margin: 1,
      width: 300,
      color: { dark: "#000", light: "#fff" },
    })

    return new NextResponse(qrSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch {
    return NextResponse.json({ error: "Erro ao gerar QR code." }, { status: 500 })
  }
}
