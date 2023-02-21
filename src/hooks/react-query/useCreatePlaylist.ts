import { createPlaylist } from "@/lib/fetchers";
import { LibraryApiResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useCreatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlaylist,
    onMutate: async ({ id, title }) => {
      await queryClient.cancelQueries({ queryKey: ["library"] });

      const previousLibrary = queryClient.getQueryData<LibraryApiResponse>([
        "library",
      ]);

      queryClient.setQueryData<LibraryApiResponse>(["library"], (old) => {
        if (old) {
          return {
            playlists: [
              ...old.playlists,
              {
                id,
                title,
              },
            ],
            subscriptions: old.subscriptions,
          };
        }

        return old;
      });

      return { previousLibrary };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(["library"], context?.previousLibrary);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });
};

export default useCreatePlaylist;
