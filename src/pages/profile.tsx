import { useState } from "react";

import {
  useSession,
  signIn as nextSignIn,
  signOut as nextSignOut,
} from "next-auth/react";

import * as Toast from "@radix-ui/react-toast";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Separator from "@radix-ui/react-separator";
import ChangeableImage from "@/components/ChangeableImage";
import useUser from "@/hooks/react-query/useUser";
import useMutateUser from "@/hooks/react-query/useMutateUser";
import ChangeableInput from "@/components/ChangeableInput";
import axios from "axios";

export default function Profile() {
  const { status } = useSession();

  const { data: user, isLoading, isSuccess } = useUser();
  const { mutate: mutateUser } = useMutateUser();

  const [inputEmail, setInputEmail] = useState<string>("");

  const [open, setOpen] = useState(false);

  const signIn = () => {
    nextSignIn("email", { email: inputEmail, redirect: false });
    setOpen(true);
  };

  const signOut = () => {
    nextSignOut({ redirect: false });
  };

  const deleteAccount = () => {
    signOut();
    axios.delete(`/api/user`);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-page flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (status === "authenticated" && isSuccess) {
    const updateAvatar = async (file: File) => {
      mutateUser({ avatar: file });
    };

    const updateName = async (name: string) => {
      if (name !== user.name) mutateUser({ name });
    };

    return (
      <div className="min-h-page flex flex-col justify-center items-center space-y-4">
        <ChangeableImage
          src={user.avatar ? user.avatar : "/vercel.svg"}
          alt="avatar"
          callback={updateAvatar}
        />

        <ChangeableInput text={user.name} callback={updateName} />

        <Separator.Root className="bg-violet6 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px my-[15px]" />

        <AlertDialog.Root>
          <AlertDialog.Trigger asChild>
            <button className="text-red11 hover:bg-mauve3 shadow-blackA7 inline-flex h-[35px] items-center justify-center rounded-[4px] bg-white px-[15px] font-medium leading-none shadow-[0_2px_10px] outline-none focus:shadow-[0_0_0_2px] focus:shadow-black">
              Delete account
            </button>
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0" />
            <AlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
              <AlertDialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
                Are you absolutely sure?
              </AlertDialog.Title>
              <AlertDialog.Description className="text-mauve11 mt-4 mb-5 text-[15px] leading-normal">
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialog.Description>
              <div className="flex justify-end gap-[25px]">
                <AlertDialog.Cancel asChild>
                  <button className="text-mauve11 bg-mauve4 hover:bg-mauve5 focus:shadow-mauve7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]">
                    Cancel
                  </button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <button
                    className="text-red11 bg-red4 hover:bg-red5 focus:shadow-red7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]"
                    onClick={deleteAccount}
                  >
                    Yes, delete account
                  </button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>

        <button
          className="inline-flex items-center justify-center rounded font-medium text-[15px] px-[15px] leading-[35px] w-[135px] h-[35px] bg-white text-violet11 shadow-[0_2px_10px] shadow-blackA7 outline-none hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black"
          onClick={signOut}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Toast.Provider swipeDirection="right">
      <div className="min-h-page flex justify-center items-center">
        <div className="flex flex-col w-[300px]">
          <p className="mb-5 text-mauve11 text-[15px] leading-normal">
            Enter an email so that we can send a magic link for you to sign in.
          </p>
          <fieldset className="mb-[15px] w-full flex flex-col justify-start">
            <label
              className="text-[13px] leading-none mb-2.5 text-violet12 block"
              htmlFor="email"
            >
              Email
            </label>

            <input
              className="grow shrink-0 rounded px-2.5 text-[15px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 h-[35px] focus:shadow-[0_0_0_2px] focus:shadow-violet8 outline-none"
              placeholder="email@example.com"
              onChange={(e) => setInputEmail(e.target.value)}
              value={inputEmail}
              type="email"
              id="email"
            />
          </fieldset>

          <div className="flex justify-end mt-5">
            <button
              className="inline-flex items-center justify-center rounded px-[15px] text-[15px] leading-none font-medium h-[35px] bg-green4 text-green11 hover:bg-green5 focus:shadow-[0_0_0_2px] focus:shadow-green7 outline-none cursor-default"
              disabled={!inputEmail}
              onClick={signIn}
            >
              Send me a link
            </button>
          </div>
        </div>
      </div>

      <Toast.Root
        className="bg-white rounded-md shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] p-[15px] grid [grid-template-areas:_'title_action'_'description_action'] grid-cols-[auto_max-content] gap-x-[15px] items-center data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut"
        open={open}
        onOpenChange={setOpen}
      >
        <Toast.Title className="[grid-area:_title] mb-[5px] font-medium text-slate12 text-sm">
          Check you email
        </Toast.Title>
        <Toast.Description className="text-sm" asChild>
          <p>A magic link has been sent to you</p>
        </Toast.Description>
        <Toast.Action
          className="[grid-area:_action]"
          asChild
          altText="Goto schedule to undo"
        >
          <button className="inline-flex items-center justify-center rounded font-medium text-xs px-[10px] leading-[25px] h-[25px] bg-green2 text-green11 shadow-[inset_0_0_0_1px] shadow-green7 hover:shadow-[inset_0_0_0_1px] hover:shadow-green8 focus:shadow-[0_0_0_2px] focus:shadow-green8">
            Close
          </button>
        </Toast.Action>
      </Toast.Root>
      <Toast.Viewport className="[--viewport-padding:_25px] fixed bottom-0 right-0 flex flex-col p-[var(--viewport-padding)] gap-[10px] w-[390px] max-w-[100vw] m-0 list-none z-[2147483647] outline-none" />
    </Toast.Provider>
  );
}
