import type { NextApiRequest, NextApiResponse } from "next";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import prisma from "../../../lib/prismadb";

export interface CreatePlaylistApi {
  id: string;
  title: string;
  cover: string;
}

interface Request extends NextApiRequest {
  body: {
    id: string;
    title: string;
    cover: string;
  };
}

export default async function handler(
  req: Request,
  res: NextApiResponse<CreatePlaylistApi>
) {
  if (req.method !== "POST") return res.status(405);

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) return res.status(403);

  try {
    const { id, title, cover } = req.body;

    const resp = await prisma.playlist.create({
      data: {
        id,
        title,
        cover,
        user: {
          connect: {
            email: session.user.email,
          },
        },
      },
    });

    return res.status(200).json({
      id: resp.id,
      title: resp.title,
      cover: resp.cover,
    });
  } catch (error) {
    return res.status(500);
  }
}
