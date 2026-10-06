import { ImageResponse } from "next/og";

export const runtime = "edge";

const ALLOWED_SIZES = new Set([180, 192, 512]);

export async function GET(
  request: Request,
  context: { params: Promise<{ size: string }> },
) {
  const { size } = await context.params;
  const dimension = Number(size);

  if (!ALLOWED_SIZES.has(dimension)) {
    return new Response("Icon size not found", { status: 404 });
  }

  const url = new URL(request.url);
  const maskable = url.searchParams.get("maskable") === "1";
  const inset = maskable ? Math.round(dimension * 0.12) : 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2b211a",
          borderRadius: maskable ? 0 : Math.round(dimension * 0.18),
          padding: inset,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: Math.round(dimension * 0.18),
            background:
              "linear-gradient(145deg, #fffaf4 0%, #f7f1e8 58%, #efc8b8 100%)",
          }}
        >
          <div
            style={{
              width: Math.round(dimension * 0.56),
              height: Math.round(dimension * 0.46),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: Math.max(4, Math.round(dimension * 0.035)) + "px solid #2b211a",
              borderRadius: Math.round(dimension * 0.16),
              color: "#2b211a",
              fontFamily: "sans-serif",
              fontSize: Math.round(dimension * 0.19),
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            JFE
          </div>
        </div>
      </div>
    ),
    {
      width: dimension,
      height: dimension,
    },
  );
}
