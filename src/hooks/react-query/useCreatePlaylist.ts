import axios from "axios";
import { LibraryApi } from "@/pages/api/library";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadApiResponse } from "cloudinary";

import { CreatePlaylistApi } from "@/pages/api/playlist/create";
import { AuthorizeUploadApi } from "@/pages/api/authorize_upload";

const uploadImage = async (file: File) => {
  const signData = (
    await axios.post<AuthorizeUploadApi>(`/api/authorize_upload`, {
      folder: "covers",
    })
  ).data;

  const url = `https://api.cloudinary.com/v1_1/${signData.cloud_name}/image/upload`;

  const formData = new FormData();

  formData.append("file", file);
  formData.append("api_key", signData.api_key);
  formData.append("timestamp", signData.timestamp);
  formData.append("signature", signData.signature);
  formData.append("folder", "covers");

  return (await axios.post<UploadApiResponse>(url, formData)).data.secure_url;
};

const createPlaylist = async (args: {
  id: string;
  title: string;
  file: File | undefined;
}) => {
  const secure_url = args.file ? await uploadImage(args.file) : "";

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
