import { LibraryApi } from "@/pages/api/library";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const deletePlaylist = async (args: { playlistId: string }) => {
  return (await axios.post(`/api/playlist/remove`, args)).data;
};

const useDeletePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePlaylist,
    onMutate: async ({ playlistId }) => {
      await queryClient.cancelQueries({ queryKey: ["library"] });

      const previousLibrary = queryClient.getQueryData<LibraryApi>(["library"]);

      queryClient.setQueryData<LibraryApi>(["library"], (old) => {
        if (old) {
          return {
            playlists: old.playlists.filter(
              (playlist) => playlist.id !== playlistId
            ),
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

export default useDeletePlaylist;
