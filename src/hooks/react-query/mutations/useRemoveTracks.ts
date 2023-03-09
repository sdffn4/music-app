import axios from "axios";
import { LibraryApi } from "@/pages/api/library";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const removeTracksFromPlaylist = async (args: {
  playlistId: string;
  tracks: string[];
}) => {
  return (await axios.post(`/api/track/remove`, args)).data;
};

const useRemoveTracks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeTracksFromPlaylist,
    onMutate: async ({ playlistId, tracks }) => {
      await queryClient.cancelQueries({ queryKey: ["library"] });

      const previousLibrary = queryClient.getQueryData<LibraryApi>(["library"]);

      queryClient.setQueryData<LibraryApi>(["library"], (old) => {
        if (old) {
          const playlist = old.playlists
            .filter((el) => el.id === playlistId)
            .pop();

          if (playlist) {
            playlist.tracks = playlist.tracks.filter(
              (id) => !new Set(tracks).has(id)
            );
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

export default useRemoveTracks;
