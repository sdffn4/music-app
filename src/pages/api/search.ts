import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prismadb";

interface Request extends NextApiRequest {
  query: {
    search: string;
  };
}

export type SearchApiTracks = Array<{
  id: string;
  title: string;
  artist: string;
  duration: number;
  source: string;
}>;

export type SearchApiPlaylists = Array<{
  id: string;
  title: string;
  cover: string;
  tracks: number;
  duration: number;
  subscriptions: number;
}>;

export type SearchApi = {
  tracks: SearchApiTracks;
  playlists: SearchApiPlaylists;
};

export default async function handler(
  req: Request,
  res: NextApiResponse<SearchApi>
) {
  if (req.method !== "GET") return res.status(400);

  try {
    const { search } = req.query;

    const tracks = await prisma.track.findMany({
      where: {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            artist: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        artist: true,
        duration: true,
        source: true,
      },
    });

    const playlists = (
      await prisma.playlist.findMany({
        where: {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
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
      })
    ).map((playlist) => ({
      ...playlist,
      tracks: playlist.tracks.length,
      subscriptions: playlist.subscriptions.length,
    }));

    return res.status(200).json({ tracks, playlists });
  } catch (error) {
    console.error(error);
    return res.status(500);
  }
}
