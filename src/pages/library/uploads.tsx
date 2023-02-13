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
import { FileInput, RadialProgress } from "react-daisyui";

import * as musicMetadata from "music-metadata-browser";
import { useState } from "react";
import { CreateTrackApi } from "../api/create_track";
import { CheckboxIcon } from "@/components/icons";

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

type UploadingTrack = {
  [name: string]: {
    title: string;
    artist: string;
    duration: number | undefined;
    source: string | null;
    isLoading: boolean;
    progress: number;
  };
};

export default function Uploads({
  tracks,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [uploadingTracks, setUploadingTracks] = useState<UploadingTrack>({});

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

      setUploadingTracks((previous) => ({
        ...previous,
        [file.name]: {
          title: "",
          artist: "",
          duration: undefined,
          source: null,
          isLoading: true,
          progress: 0,
        },
      }));
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
        const fileName = file.name;

        const formData = new FormData();

        formData.append("file", file);
        formData.append("api_key", signData.api_key);
        formData.append("timestamp", signData.timestamp);
        formData.append("signature", signData.signature);
        formData.append("folder", "tracks");

        const { secure_url: source } = (
          await axios.post<UploadApiResponse>(url, formData, {
            onUploadProgress: (progressEvent) => {
              setUploadingTracks((previous) => {
                if (progressEvent.progress) {
                  const progress = Math.round(progressEvent.progress * 100);

                  if (progress !== previous[fileName].progress) {
                    return {
                      ...previous,
                      [fileName]: {
                        ...previous[fileName],
                        progress: Math.round(progressEvent.progress * 100),
                      },
                    };
                  }
                }

                return previous;
              });
            },
          })
        ).data;

        setUploadingTracks((previous) => ({
          ...previous,
          [fileName]: {
            ...previous[fileName],
            source,
          },
        }));

        const {
          common: { title, artist },
          format: { duration },
        } = await musicMetadata.parseBlob(file);

        const { track } = (
          await axios.post<CreateTrackApi>(`/api/create_track`, {
            title: title ?? "unknown title",
            artist: artist ?? "unknown artist",
            duration,
            source,
          })
        ).data;

        setUploadingTracks((previous) => ({
          ...previous,
          [fileName]: {
            ...previous[fileName],
            title: track.title,
            artist: track.artist,
            duration: track.duration,
            isLoading: false,
          },
        }));
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
        {Object.entries(uploadingTracks).map((entry) => (
          <div key={entry[0]} className="flex items-center py-2 px-1">
            <RadialProgress
              value={entry[1].progress}
              size="1.75rem"
              thickness="0.0875rem"
            >
              <p className="text-xs">
                {entry[1].isLoading ? entry[1].progress : <CheckboxIcon />}
              </p>
            </RadialProgress>

            <p className="truncate mx-2">
              {entry[1].title ? entry[1].title : entry[0]}
            </p>
          </div>
        ))}

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
