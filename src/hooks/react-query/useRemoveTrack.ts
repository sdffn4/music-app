import { removeTrackFromPlaylist } from "@/lib/fetchers";
import { GetTrackPlaylistPresenseApiResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useRemoveTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeTrackFromPlaylist,
    onMutate: async (variables) => {
      const queryData =
        queryClient.getQueryData<GetTrackPlaylistPresenseApiResponse>([
          "presense",
        ]);

      queryClient.setQueryData<GetTrackPlaylistPresenseApiResponse>(
        ["presense"],
        (previous) => {
          if (previous && queryData) {
            const playlist = previous.playlists
              .filter((el) => el.id === variables.playlistId)
              .pop();
            const filteredPlaylists = previous.playlists.filter(
              (el) => el.id !== variables.playlistId
            );

            if (playlist) {
              return {
                playlists: [
                  ...filteredPlaylists,
                  {
                    id: playlist.id,
                    title: playlist.title,
                    tracks: playlist.tracks.filter(
                      (el) => el !== variables.trackId
                    ),
                  },
                ],
              };
            }
          }

          return previous;
        }
      );

      return { queryData };
    },
    onSuccess() {
      queryClient.invalidateQueries(["presense"]);
    },
  });
};

export default useRemoveTrack;
