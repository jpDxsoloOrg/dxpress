import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireAuth } from "@/lib/api-auth";

function getS3Client(): S3Client | null {
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION || "us-east-1";
  const accessKey = process.env.S3_ACCESS_KEY;
  const secretKey = process.env.S3_SECRET_KEY;

  if (!accessKey || !secretKey) return null;

  return new S3Client({
    region,
    ...(endpoint && {
      endpoint,
      forcePathStyle: true,
    }),
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;

  const bucket = process.env.S3_BUCKET;
  if (!bucket) {
    return NextResponse.json(
      { error: "S3 is not configured" },
      { status: 500 }
    );
  }

  const s3 = getS3Client();
  if (!s3) {
    return NextResponse.json(
      { error: "S3 credentials not configured" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { filename, contentType } = body as {
    filename: string;
    contentType: string;
  };

  if (!filename || !contentType) {
    return NextResponse.json(
      { error: "filename and contentType are required" },
      { status: 400 }
    );
  }

  const key = `uploads/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  // Build public URL
  const endpoint = process.env.S3_ENDPOINT;
  const publicUrl = endpoint
    ? `${endpoint}/${bucket}/${key}`
    : `https://${bucket}.s3.${process.env.S3_REGION || "us-east-1"}.amazonaws.com/${key}`;

  return NextResponse.json({ presignedUrl, publicUrl, key });
}
