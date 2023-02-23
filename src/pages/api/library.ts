import type { NextApiRequest, NextApiResponse } from "next";

import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

import prisma from "../../lib/prismadb";

export interface LibraryApi {
  playlists: {
    id: string;
    title: string;
    tracks: Array<string>;
  }[];
  subscriptions: {
    id: string;
    playlist: {
      id: string;
      title: string;
    };
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LibraryApi>
) {
  if (req.method !== "GET") return res.status(405);

  const session = await getServerSession(req, res, authOptions);

  if (!session) return res.status(403);

  try {
    const resp = await prisma.user.findUnique({
      where: {
        email: session.user?.email as string | undefined,
      },
      select: {
        playlists: {
          select: {
            id: true,
            title: true,
            tracks: {
              select: {
                trackId: true,
              },
            },
          },
        },
        subscriptions: {
          select: {
            id: true,
            playlist: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json(
      resp
        ? {
            subscriptions: [...resp.subscriptions],
            playlists: resp.playlists.map((playlist) => ({
              id: playlist.id,
              title: playlist.title,
              tracks: playlist.tracks.map((track) => track.trackId),
            })),
          }
        : {
            subscriptions: [],
            playlists: [],
          }
    );
  } catch (error) {
    return res.status(500);
  }
}
