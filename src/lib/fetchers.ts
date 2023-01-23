import type {
  CreatePlaylistApiResponse,
  LibraryApiResponse,
} from "@/types/api";
import axios from "axios";

export const fetchLibrary = async () => {
  return (await axios.get<LibraryApiResponse>(`/api/library`)).data;
};

export const createPlaylist = async ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    await axios.post<CreatePlaylistApiResponse>(`/api/playlist/create`, {
      title,
      description,
    })
  ).data;
};

export const deletePlaylist = async ({
  playlistId,
}: {
  playlistId: string;
}) => {
  return await axios.delete(`/api/playlist/${playlistId}`);
};
