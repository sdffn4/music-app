import { CreateTrackApi, UploadsApi } from "@/pages/api/uploads";
import { TrackType } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { CanceledError } from "axios";

interface args {
  track: TrackType;
  filename: string;
  removeFromValidFiles: (filename: string) => void;
  signal: AbortSignal;
}

const mutationFn = async ({ track, signal }: args) => {
  return (
    await axios.post<CreateTrackApi>(`/api/uploads`, track, {
      signal,
    })
  ).data;
};

const useUploadTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async ({ track }) => {
      await queryClient.cancelQueries({ queryKey: ["uploads"] });

      const previousUploads = queryClient.getQueryData<UploadsApi>(["uploads"]);

      queryClient.setQueryData<UploadsApi>(["uploads"], (old) => {
        if (!old) return old;

        old.tracks.unshift(track);

        return { ...old };
      });

      return { previousUploads };
    },
    onError: (error, { filename }) => {
      if (error instanceof CanceledError)
        console.info(`${filename} uploading has been canceled`);
    },
    onSuccess: (_, { filename, removeFromValidFiles }) => {
      removeFromValidFiles(filename);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
    },
  });
};

export default useUploadTrack;
