import axios from "axios";
import type { LibraryApi } from "@/pages/api/library";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const addTrackToPlaylist = async (args: {
  playlistId: string;
  trackId: string;
}) => {
  return (await axios.post(`/api/track/add`, args)).data;
};

const useAddTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTrackToPlaylist,
    onMutate: async ({ playlistId, trackId }) => {
      await queryClient.cancelQueries({ queryKey: ["library"] });

      const previousLibrary = queryClient.getQueryData<LibraryApi>(["library"]);

      queryClient.setQueryData<LibraryApi>(["library"], (old) => {
        if (old) {
          const playlist = old.playlists
            .filter((el) => el.id === playlistId)
            .pop();

          if (playlist) {
            playlist.tracks.push(trackId);
            return { ...old };
          }
        }

        return old;
      });

      return { previousLibrary };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData<LibraryApi>(
        ["library"],
        context?.previousLibrary
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });
};

export default useAddTrack;
