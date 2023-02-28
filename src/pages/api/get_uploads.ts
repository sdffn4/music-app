import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "../../lib/prismadb";
import { TrackType } from "@/types";

export interface GetUploadsApi {
  tracks: TrackType[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetUploadsApi>
) {
  if (req.method !== "GET") return res.status(400);

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) return res.status(400);

  try {
    const resp = await prisma.track.findMany({
      where: {
        user: {
          email: session.user.email,
        },
      },
      select: {
        id: true,
        title: true,
        artist: true,
        duration: true,
        source: true,
      },
    });

    return res.status(200).json({ tracks: resp });
  } catch (error) {
    return res.status(500);
  }
}
