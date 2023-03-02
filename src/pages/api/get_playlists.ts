import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prismadb";

export type GetPlaylistsApi = Array<{
  id: string;
  title: string;
  cover: string;
  tracks: number;
  duration: number;
  subscribers: number;
}>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetPlaylistsApi>
) {
  if (req.method !== "GET") return res.status(400);

  try {
    const resp = await prisma.playlist.findMany({
      select: {
        id: true,
        title: true,
        cover: true,
        duration: true,
        tracks: {
          select: {
            trackId: true,
          },
        },
        subscriptions: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        subscriptions: {
          _count: "desc",
        },
      },
    });

    return res.status(200).json(
      resp.map((playlist) => ({
        id: playlist.id,
        title: playlist.title,
        cover: playlist.cover,
        duration: playlist.duration,
        tracks: playlist.tracks.length,
        subscribers: playlist.subscriptions.length,
      }))
    );
  } catch (error) {
    console.log(error);

    return res.status(500);
  }
}
