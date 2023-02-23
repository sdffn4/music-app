import type { NextApiRequest, NextApiResponse } from "next";

import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import prisma from "../../../lib/prismadb";

export interface CreatePlaylistApi {
  id: string;
  title: string;
}

interface Request extends NextApiRequest {
  body: {
    id: string;
    title: string;
  };
}

export default async function handler(
  req: Request,
  res: NextApiResponse<CreatePlaylistApi>
) {
  if (req.method !== "POST") return res.status(405);

  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) return res.status(403);

  try {
    const { id, title } = req.body;

    const resp = await prisma.playlist.create({
      data: {
        id,
        title,
        user: {
          connect: {
            email: session.user?.email as string | undefined,
          },
        },
      },
    });

    return res.status(200).json({
      id: resp.id,
      title: resp.title,
    });
  } catch (error) {
    return res.status(500);
  }
}
