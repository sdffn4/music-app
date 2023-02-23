import { NextApiRequest, NextApiResponse } from "next";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import prisma from "../../../lib/prismadb";

interface Request extends NextApiRequest {
  body: {
    playlistId: string;
    trackId: string;
  };
}

export default async function handler(req: Request, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405);

  const session = await getServerSession(req, res, authOptions);

  if (!session) return res.status(403);

  const { playlistId, trackId } = req.body;

  try {
    const playlist = await prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },
      select: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (playlist && playlist.user.email !== session.user?.email) {
      return res.status(403);
    }

    await prisma.tracksOnPlaylists.create({
      data: {
        playlistId,
        trackId,
      },
    });

    return res.status(200).json({ status: true, trackId, playlistId });
  } catch (error) {
    return res.status(500);
  }
}
