import { unsubscribeFromPlaylist } from "@/lib/fetchers";
import { LibraryApiResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useUnsubscribe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unsubscribeFromPlaylist,
    onMutate: async ({ subscriptionId }) => {
      await queryClient.cancelQueries({ queryKey: ["library"] });

      const previousLibrary = queryClient.getQueryData<LibraryApiResponse>([
        "library",
      ]);

      queryClient.setQueryData<LibraryApiResponse>(["library"], (old) => {
        if (old) {
          return {
            playlists: old.playlists,
            subscriptions: old.subscriptions.filter(
              (subscription) => subscription.id !== subscriptionId
            ),
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

export default useUnsubscribe;
