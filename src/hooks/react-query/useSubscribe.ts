import axios from "axios";
import { LibraryApi } from "@/pages/api/library";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const subscribeToPlaylist = async (args: {
  id: string;
  playlistId: string;
  title: string;
  duration: number;
  cover: string;
  tracks: number;
  subscribers: number;
}) => {
  return (
    await axios.post(`/api/playlist/subscribe`, {
      id: args.id,
      playlistId: args.playlistId,
    })
  ).data;
};

const useSubscribe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subscribeToPlaylist,
    onMutate: async ({
      id,
      playlistId,
      title,
      cover,
      duration,
      subscribers,
      tracks,
    }) => {
      await queryClient.cancelQueries({ queryKey: ["library"] });

      const previousLibrary = queryClient.getQueryData<LibraryApi>(["library"]);

      queryClient.setQueryData<LibraryApi>(["library"], (old) => {
        if (old) {
          return {
            playlists: old.playlists,
            subscriptions: [
              ...old.subscriptions,
              {
                id,
                playlistId,
                title,
                cover,
                duration,
                tracks,
                uncheckedTracks: [],
                subscribers: (subscribers += 1),
              },
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
