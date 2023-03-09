import axios from "axios";
import type { LibraryApi } from "@/pages/api/library";

import uploadFile from "@/lib/uploadFile";
import { CreatePlaylistApi } from "@/pages/api/playlist/create";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const createPlaylist = async (args: {
  id: string;
  title: string;
  file: File | undefined;
}) => {
  const secure_url = args.file ? await uploadFile("covers", args.file) : "";

  return (
    await axios.post<CreatePlaylistApi>(`/api/playlist/create`, {
      id: args.id,
      title: args.title,
      cover: secure_url,
    })
  ).data;
};

const useCreatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlaylist,
    onMutate: async ({ id, title, file }) => {
      await queryClient.cancelQueries({ queryKey: ["library"] });

      const previousLibrary = queryClient.getQueryData<LibraryApi>(["library"]);

      const cover = file ? URL.createObjectURL(file) : "";

      queryClient.setQueryData<LibraryApi>(["library"], (old) => {
        if (old) {
          return {
            playlists: [
              ...old.playlists,
              {
                id,
                title,
                cover,
                duration: 0,
                subscribers: 0,
                tracks: [],
              },
            ],
            subscriptions: old.subscriptions,
          };
        }

        return old;
      });

      return { previousLibrary, cover };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(["library"], context?.previousLibrary);
    },
    onSettled: (_, __, ___, ctx) => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
      if (ctx) URL.revokeObjectURL(ctx.cover);
    },
  });
};

export default useCreatePlaylist;
