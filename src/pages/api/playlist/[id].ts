import type { NextApiResponse, NextApiRequest } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prismadb";
import type { RemovePlaylistApiResponse } from "@/types/api";

interface Request extends NextApiRequest {
  query: {
    id: string;
  };
}

export default async function handler(
  req: Request,
  res: NextApiResponse<RemovePlaylistApiResponse>
) {
  if (req.method !== "DELETE") return res.status(405);

  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) return res.status(403);

  try {
    const { id } = req.query;

    const resp = await prisma.playlist.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      id: resp.id,
    });
  } catch (error) {
    return res.status(500);
  }
}
