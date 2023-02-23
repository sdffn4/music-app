import { LibraryApi } from "@/pages/api/library";

import { unsubscribeFromPlaylist } from "@/lib/fetchers";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useUnsubscribe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unsubscribeFromPlaylist,
    onMutate: async ({ subscriptionId }) => {
      await queryClient.cancelQueries({ queryKey: ["library"] });

      const previousLibrary = queryClient.getQueryData<LibraryApi>(["library"]);

      queryClient.setQueryData<LibraryApi>(["library"], (old) => {
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
