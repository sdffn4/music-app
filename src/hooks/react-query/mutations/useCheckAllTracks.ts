import axios from "axios";
import { LibraryApi } from "@/pages/api/library";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const checkAllTracks = async (args: { subscriptionId: string }) => {
  return (await axios.put(`/api/check_all_tracks`, args)).data;
};

const useCheckAllTracks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkAllTracks,
    onMutate: async ({ subscriptionId }) => {
      await queryClient.cancelQueries({ queryKey: ["library"] });

      const previousLibrary = queryClient.getQueryData<LibraryApi>(["library"]);

      queryClient.setQueryData<LibraryApi>(["library"], (old) => {
        if (old) {
          const subscription = old.subscriptions
            .filter((subscription) => subscription.id === subscriptionId)
            .pop();

          if (subscription) {
            subscription.uncheckedTracks = [];
          }

          return {
            ...old,
          };
        }

        return old;
      });

      return { previousLibrary };
    },
  });
};

export default useCheckAllTracks;
