import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import type { TrackType } from "@/types";
import type { UploadApiResponse } from "cloudinary";
import type { AuthorizeUploadApi } from "../api/authorize_upload";

import axios, { AxiosError } from "axios";
import { CreateTrackApi } from "../api/create_track";

import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import * as musicMetadata from "music-metadata-browser";

import prisma from "../../lib/prismadb";

import { useState } from "react";
import usePlayerStore from "@/store";

import Track from "@/components/Track";
import { FileInput, Progress, RadialProgress } from "react-daisyui";
import { CheckboxIcon } from "@/components/icons";
import Image from "next/image";

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
  title: string;
  artist: string;
  duration: number | undefined;
  source: string | null;
  isLoading: boolean;
  progress: number;
};

export default function Uploads({
  tracks,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [uploadingTracks, setUploadingTracks] = useState<{
    [name: string]: UploadingTrack;
  }>({});

  const { isPlaying, queue, setQueue, setIsPlaying } = usePlayerStore(
    (state) => state
  );

  const currentTrack = queue.instances[queue.index]?.track;

  const play = (index: number, track: TrackType) => {
    const clickedOnCurrentPlayingTrack =
      currentTrack?.id === track.id && isPlaying;
    const clickedOnCurrentNotPlayingTrack =
      currentTrack?.id === track.id && !isPlaying;
    const clickedOnNotCurrentTrack = currentTrack?.id !== track.id;

    if (clickedOnCurrentPlayingTrack) {
      setIsPlaying(false);
    }

    if (clickedOnCurrentNotPlayingTrack) {
      setIsPlaying(true);
    }

    if (clickedOnNotCurrentTrack) {
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

        const formData = new FormData();

        formData.append("file", file);
        formData.append("api_key", signData.api_key);
        formData.append("timestamp", signData.timestamp);
        formData.append("signature", signData.signature);
        formData.append("folder", "tracks");

        const {
          common: { title, artist },
          format: { duration },
        } = await musicMetadata.parseBlob(file);

        const trackMetadata = {
          title: title ?? "unknown title",
          artist: artist ?? "unknown artist",
          duration: duration ?? 0,
        };

        setUploadingTracks((previous) => ({
          ...previous,
          [file.name]: {
            ...previous[file.name],
            ...trackMetadata,
          },
        }));

        axios
          .post<UploadApiResponse>(url, formData, {
            onUploadProgress: (progressEvent) => {
              setUploadingTracks((previous) => {
                if (progressEvent.progress) {
                  const progress = Math.round(progressEvent.progress * 100);

                  if (progress !== previous[file.name].progress) {
                    return {
                      ...previous,
                      [file.name]: {
                        ...previous[file.name],
                        progress: Math.round(progressEvent.progress * 100),
                      },
                    };
                  }
                }

                return previous;
              });
            },
          })
          .then(({ data: { secure_url } }) => {
            setUploadingTracks((previous) => ({
              ...previous,
              [file.name]: {
                ...previous[file.name],
                source: secure_url,
              },
            }));

            axios
              .post<CreateTrackApi>(`/api/create_track`, {
                ...trackMetadata,
                source: secure_url,
              })
              .then((_) => {
                setUploadingTracks((previous) => ({
                  ...previous,
                  [file.name]: {
                    ...previous[file.name],
                    isLoading: false,
                  },
                }));
              });
          });
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
    <div className="min-h-page">
      <div className="text-center py-2">
        <FileInput multiple onChange={uploadFiles} />
      </div>

      <div className="flex flex-col divide-y divide-white divide-opacity-10 mx-6">
        {Object.entries(uploadingTracks).map(([fileName, track]) => (
          <UploadingTrack key={fileName} fileName={fileName} track={track} />
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
    </div>
  );
}

interface UploadingTrackProps {
  fileName: string;
  track: UploadingTrack;
}

const UploadingTrack: React.FC<UploadingTrackProps> = ({ fileName, track }) => {
  return (
    <div
      key={fileName}
      className="flex justify-between items-center h-20 m-2 w-full"
    >
      <div className="flex items-center">
        <div className="relative w-20 h-20 border-black border-2">
          <Image src="/vercel.svg" alt="cover" fill></Image>
        </div>

        <div className="flex flex-col px-4 space-y-1 text-sm">
          <p>{track.title}</p>
          <p>{track.artist}</p>
          <p>{fileName}</p>
        </div>
      </div>

      <RadialProgress
        className="mx-4"
        value={track.progress}
        size="3rem"
        thickness="2px"
      >
        {track.isLoading ? (
          track.progress === 100 ? (
            "99%"
          ) : (
            `${track.progress}%`
          )
        ) : (
          <CheckboxIcon />
        )}
      </RadialProgress>
    </div>
  );
};
