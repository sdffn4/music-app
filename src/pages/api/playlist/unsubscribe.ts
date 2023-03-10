import type { NextApiRequest, NextApiResponse } from "next";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

import prisma from "../../../lib/prismadb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405);

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) return res.status(403);

  try {
    const { subscriptionId } = req.body;

    const resp = await prisma.subscription.delete({
      where: {
        id: subscriptionId,
      },
    });

    await prisma.uncheckedTracks.deleteMany({
      where: {
        subscriptionId,
      },
    });

    return res.status(200).json({ subscriptionId: resp.id });
  } catch (error) {
    return res.status(500);
  }
}
