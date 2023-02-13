import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "../../lib/prismadb";

export type CreateTrackApi = {
  track: {
    id: string;
    title: string;
    artist: string;
    source: string;
    duration: number;
  };
};

interface Request extends NextApiRequest {
  body: {
    title: string | undefined;
    artist: string | undefined;
    source: string;
    duration: number;
  };
}

export default async function handler(
  req: Request,
  res: NextApiResponse<CreateTrackApi>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) return res.status(401);

  const { title, artist, source, duration } = req.body;
  if (!source || !duration) return res.status(400);

  try {
    const trackInfo = {
      title: title ?? "unknown title",
      artist: artist ?? "unknown artist",
      source,
      duration,
    };

    const resp = await prisma.track.create({
      data: {
        ...trackInfo,
        user: {
          connect: {
            email: session.user?.email as string | undefined,
          },
        },
      },
    });

    return res.status(200).json({ track: { id: resp.id, ...trackInfo } });
  } catch (error) {
    return res.status(500);
  }
}
