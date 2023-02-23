import { LibraryApi } from "@/pages/api/library";

import { removeTrackFromPlaylist } from "@/lib/fetchers";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useRemoveTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeTrackFromPlaylist,
    onMutate: async ({ playlistId, trackId }) => {
      await queryClient.cancelQueries({ queryKey: ["library"] });

      const previousLibrary = queryClient.getQueryData<LibraryApi>(["library"]);

      queryClient.setQueryData<LibraryApi>(["library"], (old) => {
        if (old) {
          const playlist = old.playlists
            .filter((el) => el.id === playlistId)
            .pop();

          if (playlist) {
            playlist.tracks = playlist.tracks.filter((id) => id !== trackId);
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

export default useRemoveTrack;
