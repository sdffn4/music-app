import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { GetPlaylistsApi } from "@/pages/api/get_playlists";

const useGetPlaylists = () => {
  return useQuery({
    queryFn: async () =>
      (await axios.get<GetPlaylistsApi>(`/api/get_playlists`)).data,
    queryKey: ["index"],
  });
};

export default useGetPlaylists;
