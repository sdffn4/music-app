import usePlayerStore from "@/store";
import { TrackType } from "@/types";
import Track from "@/components/Track";
import { FileInput } from "react-daisyui";
import { useEffect, useState } from "react";
import { AxiosProgressEvent } from "axios";
import { parseBlob } from "music-metadata-browser";
import Head from "next/head";
import uploadFile from "@/lib/uploadFile";
import useUploads from "@/hooks/react-query/queries/useUploads";
import { v4 as uuidv4 } from "uuid";
import useUploadTrack from "@/hooks/react-query/mutations/useUploadTrack";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Uploads() {
  const router = useRouter();

  const session = useSession();

  const { data: uploads, isLoading: isUploadsLoading } = useUploads();
  const tracks = uploads ? uploads.tracks : [];

  const { isPlaying, setIsPlaying, queue, setQueue, addToQueue } =
    usePlayerStore((state) => state);

  const currentTrack = queue.instances[queue.index]?.track;

  const play = (track: TrackType, index: number) => {
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
      setQueue(index, tracks.includes(track) ? tracks : [track]);
      setIsPlaying(true);
    }
  };

  const [validFiles, setValidFiles] = useState<File[]>([]);

  const validateFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      if (!files[i].type.startsWith("audio")) {
        console.log(`File "${files[i].name}" is invalid. Skipped.`);
        continue;
      }

      if (validFiles.findIndex((file) => file.name === files[i].name) !== -1) {
        console.log(
          `File "${files[i].name}" is already being uploaded. Skipped.`
        );
        continue;
      }

      setValidFiles((previous) => [files[i], ...previous]);
    }

    if (!validFiles) return;

    e.target.type = "text";
    e.target.type = "file";
  };

  const removeFromValidFiles = (filename: string) => {
    setValidFiles((previous) =>
      previous.filter((file) => file.name !== filename)
    );
  };

  if (session.status === "unauthenticated") router.push("/profile");

  return (
    <>
      <Head>
        <title>Uploads</title>
      </Head>

      {isUploadsLoading || session.status === "loading" ? (
        <div className="min-h-page flex justify-center items-center p-4">
          Loading...
        </div>
      ) : (
        <div className="min-h-page">
          <div className="text-center p-5">
            <FileInput
              bordered
              multiple
              color="primary"
              onChange={validateFiles}
            />
          </div>

          <div>
            {validFiles.map((file) => (
              <UploadTrack
                key={file.name}
                file={file}
                removeFromValidFiles={removeFromValidFiles}
              />
            ))}
          </div>

          <div>
            {tracks.length > 0 ? (
              tracks.map((track, index) => {
                const isActive = currentTrack?.id === track.id && isPlaying;

                return (
                  <Track
                    key={track.id}
                    index={index}
                    track={track}
                    isActive={isActive}
                    onClick={() => play(track, index)}
                  />
                );
              })
            ) : (
              <div className="flex justify-center items-center p-4">
                You have no uploaded tracks.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

interface UploadTrackProps {
  file: File;
  removeFromValidFiles: (filename: string) => void;
}

const UploadTrack: React.FC<UploadTrackProps> = ({
  file,
  removeFromValidFiles,
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const { mutate } = useUploadTrack();

  const uploadTrack = async (signal: AbortSignal) => {
    const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
      if (progressEvent.progress) {
        const progress = Math.round(progressEvent.progress * 100);

        if (progress !== uploadProgress) setUploadProgress(progress);
      }
    };

    const source = await uploadFile("tracks", file, onUploadProgress, signal);
    if (!source) return;

    parseBlob(file).then(
      ({ common: { title, artist }, format: { duration } }) => {
        // why upload audio file without a duration?
        if (duration !== undefined) {
          mutate({
            signal,
            filename: file.name,
            removeFromValidFiles,
            track: {
              id: uuidv4(),
              title: title ?? "",
              artist: artist ?? "",
              duration,
              source,
            },
          });
        }
      }
    );
  };

  useEffect(() => {
    const controller = new AbortController();

    uploadTrack(controller.signal);

    return () => {
      controller.abort("component unmount");
    };
  }, []);

  return (
    <div className={`w-full flex truncate hover:cursor-progress py-1`}>
      <p className="truncate self-center text-center opacity-80 text-xs w-8 mx-2">
        {uploadProgress}
      </p>

      <p className={`truncate self-center text-center italic`}>{file.name}</p>
    </div>
  );
};
