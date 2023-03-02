import type { NextApiRequest, NextApiResponse } from "next";

import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

import prisma from "../../lib/prismadb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LibraryApi>
) {
  if (req.method !== "GET") return res.status(405);

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) return res.status(403);

  try {
    const resp = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        playlists: {
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
        },
        subscriptions: {
          select: {
            id: true,
            uncheckedTracks: {
              select: {
                subscriptionId: true,
                trackId: true,
              },
            },
            playlist: {
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
            },
          },
        },
      },
    });

    if (!resp) return res.status(404);

    return res.status(200).json({
      playlists: resp.playlists.map((playlist) => ({
        ...playlist,
        subscribers: playlist.subscriptions.length,
        tracks: playlist.tracks.map((track) => track.trackId),
      })),
      subscriptions: resp.subscriptions.map((subscription) => ({
        id: subscription.id,
        playlistId: subscription.playlist.id,
        cover: subscription.playlist.cover,
        duration: subscription.playlist.duration,
        title: subscription.playlist.title,
        tracks: subscription.playlist.tracks.length,
        subscribers: subscription.playlist.subscriptions.length,
        uncheckedTracks: subscription.uncheckedTracks,
      })),
    });
  } catch (error) {
    return res.status(500);
  }
}

type Playlist = {
  id: string;
  title: string;
  cover: string;
  duration: number;
  subscribers: number;
  tracks: string[];
};

type Subscription = {
  id: string;
  playlistId: string;
  title: string;
  cover: string;
  duration: number;
  subscribers: number;
  tracks: number;
  uncheckedTracks: Array<{
    trackId: string;
    subscriptionId: string;
  }>;
};

export interface LibraryApi {
  playlists: Playlist[];
  subscriptions: Subscription[];
}
