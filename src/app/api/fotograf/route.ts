import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@/lib/r2";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key) {
    return new NextResponse("Missing key", { status: 400 });
  }

  try {
    const result = await r2.send(
      new GetObjectCommand({ Bucket: R2_BUCKET, Key: key })
    );

    const body = result.Body;
    if (!body) {
      return new NextResponse("Not found", { status: 404 });
    }

    const headers = new Headers();
    if (result.ContentType) headers.set("Content-Type", result.ContentType);
    if (result.ContentLength) headers.set("Content-Length", String(result.ContentLength));
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    // Convert readable stream to Response
    const stream = body as unknown as BodyInit;
    return new NextResponse(stream, { headers });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}