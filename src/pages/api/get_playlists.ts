import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prismadb";

export type GetPlaylistsApi = Array<{
  id: string;
  title: string;
  cover: string;
  subscriptions: number;
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

        _count: {
          select: {
            subscriptions: true,
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
        ...playlist,
        subscriptions: playlist._count.subscriptions,
      }))
    );
  } catch (error) {
    console.log(error);

    return res.status(500);
  }
}
