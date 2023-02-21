import { removeTrackFromPlaylist } from "@/lib/fetchers";
import { LibraryApiResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useRemoveTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeTrackFromPlaylist,
    onMutate: async ({ playlistId, trackId }) => {
      await queryClient.cancelQueries({ queryKey: ["library"] });

      const previousLibrary = queryClient.getQueryData<LibraryApiResponse>([
        "library",
      ]);

      queryClient.setQueryData<LibraryApiResponse>(["library"], (old) => {
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
      queryClient.setQueryData<LibraryApiResponse>(
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
