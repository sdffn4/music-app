import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "../../lib/prismadb";
import { GetTrackPlaylistPresenseApiResponse } from "@/types/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetTrackPlaylistPresenseApiResponse>
) {
  if (req.method !== "GET") return res.status(405);

  const session = await unstable_getServerSession(req, res, authOptions);

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
      },
    });

    const playlists = resp
      ? resp.playlists.map((playlist) => {
          return {
            id: playlist.id,
            title: playlist.title,
            tracks: playlist.tracks.map((track) => track.trackId),
          };
        })
      : [];

    return res.status(200).json({ playlists });
  } catch (error) {
    return res.status(500);
  }
}
