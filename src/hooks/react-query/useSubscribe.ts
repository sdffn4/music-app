import { subscribeToPlaylist } from "@/lib/fetchers";
import { LibraryApiResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useSubscribe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subscribeToPlaylist,
    onMutate: async ({ id, playlistId, title }) => {
      await queryClient.cancelQueries({ queryKey: ["library"] });

      const previousLibrary = queryClient.getQueryData<LibraryApiResponse>([
        "library",
      ]);

      queryClient.setQueryData<LibraryApiResponse>(["library"], (old) => {
        if (old) {
          return {
            playlists: old.playlists,
            subscriptions: [
              ...old.subscriptions,
              { id, playlist: { id: playlistId, title } },
            ],
          };
        }

        return old;
      });

      return { previousLibrary };
    },
    onError: (_, __, context) => {
      queryClient.setQueriesData(["library"], context?.previousLibrary);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });
};

export default useSubscribe;
