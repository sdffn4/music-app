import { LibraryApi } from "@/pages/api/library";

import { createPlaylist } from "@/lib/fetchers";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useCreatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlaylist,
    onMutate: async ({ id, title }) => {
      await queryClient.cancelQueries({ queryKey: ["library"] });

      const previousLibrary = queryClient.getQueryData<LibraryApi>(["library"]);

      queryClient.setQueryData<LibraryApi>(["library"], (old) => {
        if (old) {
          return {
            playlists: [
              ...old.playlists,
              {
                id,
                title,
                cover: "",
                tracks: [],
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
