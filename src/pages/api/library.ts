import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "../../lib/prismadb";
import type { LibraryApiResponse } from "@/types/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LibraryApiResponse>
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

    return res
      .status(200)
      .json(resp ? { ...resp } : { playlists: [], subscriptions: [] });
  } catch (error) {
    return res.status(500);
  }
}
