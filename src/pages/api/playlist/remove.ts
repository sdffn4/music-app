import type { NextApiResponse, NextApiRequest } from "next";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import prisma from "../../../lib/prismadb";

export interface RemovePlaylistApi {
  id: string;
}

interface Request extends NextApiRequest {
  query: {
    id: string;
  };
}

export default async function handler(
  req: Request,
  res: NextApiResponse<RemovePlaylistApi>
) {
  if (req.method !== "POST") return res.status(405);

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) return res.status(403);

  const { playlistId } = req.body;

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

    if (playlist && playlist.user.email !== session.user.email) {
      return res.status(403);
    }

    const resp = await prisma.playlist.delete({
      where: {
        id: playlistId,
      },
    });

    const subs = (
      await prisma.subscription.findMany({
        select: {
          id: true,
        },
      })
    ).map((sub) => sub.id);

    await prisma.uncheckedTracks.deleteMany({
      where: {
        subscriptionId: { in: subs },
      },
    });

    return res.status(200).json({
      id: resp.id,
    });
  } catch (error) {
    return res.status(500);
  }
}
