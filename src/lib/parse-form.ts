import formidable from "formidable";
import mime from "mime";
import { nanoid } from "nanoid";
import type { NextApiRequest } from "next";

export const FormidableError = formidable.errors.FormidableError;

export const parseForm = async (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise(async (resolve, reject) => {
    const form = formidable({
      multiples: true,
      maxFiles: Infinity,
      maxFileSize: 100 * 1024 * 1024,
      filename: (_name, _ext, part) => {
        return `${nanoid()}.${mime.getExtension(part.mimetype || "")}`;
      },
      filter: (part) => {
        return (
          part.name === "media" && (part.mimetype?.includes("audio") || false)
        );
      },
    });

    form.parse(req, function (err, fields, files) {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};
