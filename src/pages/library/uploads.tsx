import usePlayerStore from "@/store";
import { TrackType } from "@/types";
import Track from "@/components/Track";
import TrackDropdown from "@/components/TrackDropdown";
import useLibrary from "@/hooks/react-query/useLibrary";
import useAddTrack from "@/hooks/react-query/useAddTrack";
import useRemoveTracks from "@/hooks/react-query/useRemoveTracks";
import { FileInput } from "react-daisyui";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { AuthorizeUploadApi } from "../api/authorize_upload";
import { parseBlob } from "music-metadata-browser";
import { UploadApiResponse } from "cloudinary";
import { CreateTrackApi } from "../api/create_track";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetUploadsApi } from "../api/get_uploads";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Uploads() {
  const router = useRouter();
  const session = useSession();

  const { data: uploads, isLoading: isUploadsLoading } = useQuery({
    queryKey: ["uploads"],
    queryFn: async () =>
      (await axios.get<GetUploadsApi>(`/api/get_uploads`)).data.tracks,
  });

  const { data: library } = useLibrary();

  const { mutate: mutateAdd } = useAddTrack();

  const { mutate: mutateRemove } = useRemoveTracks();

  const { isPlaying, setIsPlaying, queue, setQueue, addToQueue } =
    usePlayerStore((state) => state);

  const currentTrack = queue.instances[queue.index]?.track;

  const play = (index: number, track: TrackType, tracks: TrackType[]) => {
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

  const [validFiles, setValidFiles] = useState<File[]>([]);

  const validateFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;

    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      if (!files[i].type.startsWith("audio")) {
        console.log(`File "${files[i].name}" is invalid. Skipped.`);
        continue;
      }

      validFiles.push(files[i]);
    }

    if (!validFiles) return;
    else setValidFiles(validFiles);

    e.target.type = "text";
    e.target.type = "file";
  };

  if (session.status === "unauthenticated") {
    router.push(`/profile`);
  }

  if (session.status === "loading" || isUploadsLoading) {
    return <div className="min-h-page">Loading...</div>;
  }

  return (
    <div className="min-h-page">
      <div className="text-center p-5">
        <FileInput bordered multiple color="primary" onChange={validateFiles} />
      </div>

      <div>
        {validFiles.map((file) => (
          <Upload key={file.name} file={file} />
        ))}
      </div>

      <div>
        {uploads && uploads.length > 0 ? (
          uploads.map((track, index) => {
            const isActive = currentTrack?.id === track.id && isPlaying;

            return (
              <Track
                key={track.id}
                index={index}
                track={track}
                isActive={isActive}
                onClick={() => play(index, track, uploads)}
                dropdown={
                  <TrackDropdown
                    trackId={track.id}
                    playlists={library ? library.playlists : []}
                    addToQueue={() => addToQueue(track)}
                    addTrackToPlaylist={(playlistId) =>
                      mutateAdd({ playlistId, trackId: track.id })
                    }
                    removeTrackFromPlaylist={(playlistId) =>
                      mutateRemove({ playlistId, tracks: [track.id] })
                    }
                  />
                }
              />
            );
          })
        ) : (
          <div>You have no uploaded tracks.</div>
        )}
      </div>
    </div>
  );
}

interface UploadProps {
  file: File;
}

const Upload: React.FC<UploadProps> = ({ file }) => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [duration, setDuration] = useState(0);
  const [source, setSource] = useState<string>("");

  const [uploadProgress, setUploadProgress] = useState(0);

  const queryClient = useQueryClient();

  const { mutate: mutateCreate } = useMutation({
    mutationFn: async (args: {
      title: string;
      artist: string;
      duration: number;
      source: string;
    }) => (await axios.post<CreateTrackApi>(`/api/create_track`, args)).data,
  });

  const { mutate: mutateUpload } = useMutation({
    mutationFn: async (args: {
      url: string;
      formData: FormData;
      setUploadProgress: (progress: number) => void;
      trackInfo: { title: string; artist: string; duration: number };
    }) =>
      (
        await axios.post<UploadApiResponse>(args.url, args.formData, {
          onUploadProgress: (evt) => {
            if (evt.progress) {
              const evtProgress = Math.round(evt.progress * 100);
              if (uploadProgress !== evtProgress)
                setUploadProgress(evtProgress);
            }
          },
        })
      ).data,
    onSuccess: ({ secure_url }, { trackInfo }) => {
      setSource(secure_url);

      queryClient.invalidateQueries({ queryKey: ["uploads"] });

      mutateCreate({ ...trackInfo, source: secure_url });
    },
  });

  const uploadTrack = useCallback(async () => {
    const signData = (
      await axios.post<AuthorizeUploadApi>(`/api/authorize_upload`, {
        folder: "tracks",
      })
    ).data;

    const url = `https://api.cloudinary.com/v1_1/${signData.cloud_name}/auto/upload`;

    const formData = new FormData();

    formData.append("file", file);
    formData.append("api_key", signData.api_key);
    formData.append("timestamp", signData.timestamp);
    formData.append("signature", signData.signature);
    formData.append("folder", "tracks");

    parseBlob(file).then(
      ({ common: { title, artist }, format: { duration } }) => {
        if (title && artist && duration) {
          setTitle(title);
          setArtist(artist);
          setDuration(duration);
          mutateUpload({
            url,
            formData,
            setUploadProgress,
            trackInfo: { title, artist, duration },
          });
        }
      }
    );
  }, [file, mutateUpload]);

  useEffect(() => {
    uploadTrack();
  }, [uploadTrack]);

  return (
    <div className={`w-full truncate flex py-1 hover:cursor-not-allowed`}>
      <div className={`opacity-80 text-xs self-center text-center`}>
        <p className="truncate w-8 mx-2">{uploadProgress}</p>
      </div>
      <div className={`truncate`}>
        <p className={`truncate`}>{title}</p>
        <p className={`text-sm truncate`}>{artist}</p>
        <p className={`pt-1 text-xs truncate`}>{file.name}</p>
      </div>
    </div>
  );
};
