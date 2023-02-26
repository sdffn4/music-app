import { NextApiRequest, NextApiResponse } from "next";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import prisma from "../../../lib/prismadb";

interface Request extends NextApiRequest {
  body: {
    playlistId: string;
    tracks: string[];
  };
}

export default async function handler(req: Request, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405);

  const session = await getServerSession(req, res, authOptions);

  if (!session) return res.status(403);

  const { playlistId, tracks } = req.body;

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

    await prisma.tracksOnPlaylists.deleteMany({
      where: {
        AND: [
          {
            playlistId,
          },
          {
            trackId: { in: tracks },
          },
        ],
      },
    });

    // probably not the best way to do that but let's so be it for now

    const subs = (
      await prisma.subscription.findMany({
        where: {
          playlistId,
        },
        select: {
          id: true,
        },
      })
    ).map((sub) => sub.id);

    await prisma.uncheckedTracks.deleteMany({
      where: {
        AND: {
          subscriptionId: { in: subs },
          trackId: { in: tracks },
        },
      },
    });

    await res.revalidate(`/playlist/${playlistId}`);

    return res.status(200).json({ status: true, tracks, playlistId });
  } catch (error) {
    return res.status(500);
  }
}
