"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 500 * 1024 * 1024;

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export const createUploadUrl = action({
  args: {
    fileName: v.string(),
    contentType: v.string(),
    size: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required.");

    if (!allowedTypes.has(args.contentType)) {
      throw new Error("Unsupported image or video format.");
    }
    const isVideo = args.contentType.startsWith("video/");
    const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (!Number.isFinite(args.size) || args.size <= 0 || args.size > limit) {
      throw new Error(isVideo ? "Video exceeds the 500 MB limit." : "Image exceeds the 20 MB limit.");
    }

    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET;
    const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
      throw new Error("Cloudflare R2 is not configured on this Convex deployment.");
    }

    const client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    const extension = args.fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const folder = isVideo ? "videos" : "images";
    const objectKey = `${folder}/${identity.subject}/${crypto.randomUUID()}.${extension}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ContentType: args.contentType,
      ContentLength: args.size,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
    const publicUrl = `${publicBaseUrl.replace(/\/$/, "")}/${objectKey}`;

    return { uploadUrl, publicUrl, objectKey, expiresIn: 300 };
  },
});
