import type { NextApiRequest, NextApiResponse } from "next";

import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

import { v2 } from "cloudinary";

export type AuthorizeUploadApi = {
  timestamp: string;
  signature: string;
  cloud_name: string;
  api_key: string;
};

interface Request extends NextApiRequest {
  body: {
    folder: string;
  };
}

export default async function handler(
  req: Request,
  res: NextApiResponse<AuthorizeUploadApi>
) {
  if (req.method !== "POST") return res.status(400);

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) return res.status(403);

  const cloud_name = process.env.cloud_name as string;
  const api_key = process.env.api_key as string;

  const api_secret = process.env.api_secret as string;

  const timestamp = String(Math.round(new Date().getTime() / 1000));

  const { folder } = req.body;

  v2.config({
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
    cloud_name: process.env.cloud_name,
  });

  const signature = v2.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    api_secret
  );

  return res.status(200).json({
    timestamp,
    signature,
    cloud_name,
    api_key,
  });
}
