import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "../../lib/prismadb";
import { TrackType } from "@/types";

export interface CreateTrackApi {
  track: TrackType;
}

export interface UploadsApi {
  tracks: TrackType[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateTrackApi | UploadsApi>
) {
  try {
    if (req.method === "GET") {
      const session = await getServerSession(req, res, authOptions);
      if (!session || !session.user?.email) return res.status(403);

      const resp = await prisma.track.findMany({
        where: {
          user: {
            email: session.user.email,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({ tracks: resp });
    } else if (req.method === "POST") {
      const session = await getServerSession(req, res, authOptions);
      if (!session || !session.user?.email) return res.status(403);

      const track = req.body as {
        id: string;
        title: string;
        artist: string;
        duration: number;
        source: string;
      };

      if (!track.duration || !track.source) return res.status(400);

      const resp = await prisma.track.create({
        data: {
          ...track,
          user: {
            connect: {
              email: session.user.email,
            },
          },
        },
        select: {
          id: true,
          title: true,
          artist: true,
          duration: true,
          source: true,
        },
      });

      return res.status(200).json({ track: resp });
    }
  } catch (error) {
    console.log(error);
    res.status(500);
  }
}
