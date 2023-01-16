import { TrackType } from "@/types";
import { PageConfig, NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import prisma from "../../lib/prismadb";
import { authOptions } from "./auth/[...nextauth]";
import { v2 } from "cloudinary";
import { FormidableError, parseForm } from "@/lib/parse-form";
import { tmpdir } from "os";
import { nanoid } from "nanoid";
import mime from "mime";
import { parseFile } from "music-metadata";
import { writeFileSync } from "fs";

v2.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TrackType>
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) res.status(403);

  try {
    const { fields, files } = await parseForm(req);

    const file = files.media;

    if (Array.isArray(file))
      throw new Error("A received file data shouldn't be an array");

    /* UPLOAD TRACK TO CLOUDINARY */
    const { secure_url: source } = await v2.uploader.upload(file.filepath, {
      folder: "tracks",
      resource_type: "auto",
    });

    /* PARSE METADATA OF TRACK */
    const { common, format } = await parseFile(file.filepath);

    let cover = null;
    let dominant = null;
    const coverFile = common.picture?.pop();

    if (coverFile) {
      const path = tmpdir() + nanoid() + mime.getExtension(coverFile.format);

      writeFileSync(path, coverFile.data);

      const { secure_url } = await v2.uploader.upload(path, {
        folder: "covers",
        resource_type: "image",
      });

      cover = secure_url;
    }

    /* CREATE OBJECT CONTAINS TRACK INFO */
    const trackInfo = {
      source,

      artist: common.albumartist ?? "Unknown",
      title: common.title ?? "Unknown",
      album: common.albumartist ?? "Unknown",
    };

    /* CREATE RECORD IN DATABASE */
    const resp = await prisma.track.create({
      data: {
        user: {
          connect: {
            email: session?.user?.email as string | undefined,
          },
        },
        ...trackInfo,
        cover: {
          create: {
            source: cover ?? "",
            dominantColor: dominant ?? "",
          },
        },
        duration: format.duration ?? 0,
      },
    });

    console.log("KALL");

    /* RESPONSE TO THE CLIENT */
    res.status(200).json({
      id: resp.id,
      cover: {
        source: cover,
        dominant: dominant ?? "",
      },
      ...trackInfo,
    });
  } catch (error) {
    if (error instanceof FormidableError) {
      res.status(error.httpCode || 400);
    } else {
      res.status(500);
    }
  }
}
