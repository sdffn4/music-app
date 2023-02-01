import { addTrackToPlaylist } from "@/lib/fetchers";
import { GetTrackPlaylistPresenseApiResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useAddTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTrackToPlaylist,
    onMutate: (variables) => {
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
                    tracks: [...playlist.tracks, variables.trackId],
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

export default useAddTrack;
