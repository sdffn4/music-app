import { fetchLibrary } from "@/lib/fetchers";
import { useQuery } from "@tanstack/react-query";

const useLibrary = () => {
  return useQuery({
    queryKey: ["library"],
    queryFn: fetchLibrary,
    staleTime: 1000 * 60,
  });
};

export default useLibrary;
