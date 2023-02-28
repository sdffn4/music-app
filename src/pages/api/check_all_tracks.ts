import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

import prisma from "../../lib/prismadb";

interface Request extends NextApiRequest {
  body: {
    subscriptionId: string;
  };
}

export default async function handler(req: Request, res: NextApiResponse) {
  if (req.method !== "PUT") return res.status(400);

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) return res.status(400);

  try {
    const { subscriptionId } = req.body;

    const sub = await prisma.subscription.findUnique({
      where: {
        id: subscriptionId,
      },
      select: {
        id: true,
        user: { select: { email: true } },
      },
    });

    if (sub?.user.email !== session.user.email) return res.status(400);

    await prisma.uncheckedTracks.deleteMany({
      where: {
        subscriptionId,
      },
    });

    return res.status(200);
  } catch (error) {
    console.log(error);

    return res.status(500);
  }
}
