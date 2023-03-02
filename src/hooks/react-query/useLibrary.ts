import axios from "axios";
import { LibraryApi } from "@/pages/api/library";
import { useQuery } from "@tanstack/react-query";

const useLibrary = () => {
  return useQuery({
    queryKey: ["library"],
    queryFn: async () => (await axios.get<LibraryApi>(`/api/library`)).data,
    staleTime: 1000 * 60,
  });
};

export default useLibrary;
