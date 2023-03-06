import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

import prisma from "../../lib/prismadb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email)
      return res.status(200).json({ message: "You aren't authorized." });

    if (req.method === "PATCH") {
      const body = req.body as {
        avatar: string | undefined;
        name: string | undefined;
      };

      if (body.avatar) {
        await prisma.user.update({
          where: {
            email: session.user.email,
          },
          data: {
            avatar: body.avatar,
          },
        });
      }

      if (body.name) {
        await prisma.user.update({
          where: {
            email: session.user.email,
          },
          data: {
            name: body.name,
          },
        });
      }

      return res
        .status(200)
        .json({ message: "Profile is successfully updated" });
    }

    if (req.method === "GET") {
      const resp = await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
      });

      return res.status(200).json(resp);
    }

    if (req.method === "DELETE") {
      await prisma.user.delete({
        where: {
          email: session.user.email,
        },
      });

      return res
        .status(200)
        .json({ message: "Account is successfully deleted." });
    }

    return res.status(400).json({ message: "Invalid request" });
  } catch (error) {
    console.error(error);
    return res.status(500);
  }
}
