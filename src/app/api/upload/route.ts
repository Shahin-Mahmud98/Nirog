import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";


/**
 * Handles prescription image/PDF uploads. Out of the box this writes to
 * /public/uploads on local disk, which is fine for development but not for
 * production (files won't survive redeploys on most hosts). Swap this for
 * an S3 (or S3-compatible, e.g. Cloudflare R2) upload when UPLOAD_DRIVER=s3 -
 * the request/response shape below is designed to stay the same either way.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, or PDF files are allowed." }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 8MB." }, { status: 400 });
  }

  if (process.env.UPLOAD_DRIVER === "s3") {
    // TODO: integrate @aws-sdk/client-s3 PutObjectCommand here using
    // S3_BUCKET / S3_REGION / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY,
    // then return the resulting object URL below.
    return NextResponse.json({ error: "S3 upload driver not yet configured." }, { status: 501 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop();
  const filename = `${(session.user as any).id}-${Date.now()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ fileUrl: `/uploads/${filename}` }, { status: 201 });
}
