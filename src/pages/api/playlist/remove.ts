import type { NextApiResponse, NextApiRequest } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prismadb";
import type { RemovePlaylistApiResponse } from "@/types/api";

interface Request extends NextApiRequest {
  query: {
    id: string;
  };
}

export default async function handler(
  req: Request,
  res: NextApiResponse<RemovePlaylistApiResponse>
) {
  if (req.method !== "POST") return res.status(405);

  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) return res.status(403);

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

    if (playlist && playlist.user.email !== session.user?.email) {
      return res.status(403);
    }

    const resp = await prisma.playlist.delete({
      where: {
        id: playlistId,
      },
    });

    return res.status(200).json({
      id: resp.id,
    });
  } catch (error) {
    return res.status(500);
  }
}
