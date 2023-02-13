import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import type { TrackType } from "@/types";
import type { UploadApiResponse } from "cloudinary";
import type { AuthorizeUploadApi } from "../api/authorize_upload";

import axios, { AxiosError } from "axios";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import prisma from "../../lib/prismadb";

import usePlayerStore from "@/store";

import Track from "@/components/Track";
import { FileInput } from "react-daisyui";

import * as musicMetadata from "music-metadata-browser";

export const getServerSideProps = async ({
  req,
  res,
}: GetServerSidePropsContext) => {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/profile",
        permanent: false,
      },
    };
  }

  const tracks = await prisma.track.findMany({
    select: {
      id: true,
      title: true,
      artist: true,
      source: true,
      duration: true,
    },
    where: {
      user: {
        email: session.user?.email,
      },
    },
  });

  return {
    props: {
      tracks,
    },
  };
};

export default function Uploads({
  tracks,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { isPlaying, queue, setQueue, setIsPlaying } = usePlayerStore(
    (state) => state
  );

  const currentTrack = queue.instances[queue.index]?.track;

  const play = (index: number, track: TrackType) => {
    if (currentTrack?.id === track.id && isPlaying) setIsPlaying(false);

    if (currentTrack?.id === track.id && !isPlaying) setIsPlaying(true);

    if (currentTrack?.id !== track.id) {
      setQueue(index, tracks);
      setIsPlaying(true);
    }
  };

  const uploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    /* VALIDATION */

    if (!files) return;

    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith("audio")) {
        console.log(`File "${file.name}" is invalid. Skipped.`);
        continue;
      }

      validFiles.push(file);
    }

    if (!validFiles) {
      e.target.type = "text";
      e.target.type = "file";
      return;
    }

    /* SENDING FILES TO THE SERVER */

    try {
      const signData = (
        await axios.get<AuthorizeUploadApi>(`/api/authorize_upload`)
      ).data;

      const url = `https://api.cloudinary.com/v1_1/${signData.cloud_name}/auto/upload`;

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];

        const formData = new FormData();

        formData.append("file", file);
        formData.append("api_key", signData.api_key);
        formData.append("timestamp", signData.timestamp);
        formData.append("signature", signData.signature);
        formData.append("folder", "tracks");

        const { secure_url: source } = (
          await axios.post<UploadApiResponse>(url, formData)
        ).data;

        const {
          common: { title, artist },
          format: { duration },
        } = await musicMetadata.parseBlob(file);

        const track = (
          await axios.post(`/api/create_track`, {
            title,
            artist,
            source,
            duration,
          })
        ).data;

        console.log(track);
      }

      e.target.type = "text";
      e.target.type = "file";
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      } else {
        console.log(error);
      }
    }
  };

  return (
    <>
      <div className="text-center m-4">
        <FileInput multiple onChange={uploadFiles} />
      </div>

      <div className="flex flex-col divide-y divide-white divide-opacity-10 mx-6">
        {tracks ? (
          tracks.map((track, index) => (
            <Track
              key={track.id}
              track={track}
              index={index + 1}
              onClick={() => play(index, track)}
              isActive={track.id === currentTrack?.id && isPlaying}
            />
          ))
        ) : (
          <div>You have no uploaded tracks</div>
        )}
      </div>
    </>
  );
}
