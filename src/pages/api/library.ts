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
    const resp = await prisma.playlist.findMany({
      select: {
        id: true,
        title: true,
      },
      where: {
        user: {
          email: session.user?.email,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      playlists: resp,
    });
  } catch (error) {
    return res.status(500);
  }
}
