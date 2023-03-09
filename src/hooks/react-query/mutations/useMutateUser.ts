import uploadFile from "@/lib/uploadFile";
import { User } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const mutationFn = async (args: { avatar?: File; name?: string }) => {
  if (args.name) {
    return (await axios.patch(`/api/user`, args)).data;
  }

  if (args.avatar) {
    const avatar = await uploadFile("avatars", args.avatar);
    return (await axios.patch(`/api/user`, { avatar })).data;
  }
};

const useMutateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async ({ avatar, name }) => {
      await queryClient.cancelQueries({ queryKey: ["user"] });

      const previousUser = queryClient.getQueryData<User>(["user"]);

      queryClient.setQueryData<User>(["user"], (old) => {
        if (old) {
          if (avatar) {
            const avatarUrl = URL.createObjectURL(avatar);

            return {
              ...old,
              avatar: avatarUrl,
            };
          }

          if (name) {
            return {
              ...old,
              name,
            };
          }
        }

        return old;
      });

      return { previousUser };
    },
  });
};

export default useMutateUser;
