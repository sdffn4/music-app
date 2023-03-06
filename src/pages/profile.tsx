import { useState } from "react";

import {
  useSession,
  signIn as nextSignIn,
  signOut as nextSignOut,
} from "next-auth/react";

import { Alert, Button, Divider, Input, Toast } from "react-daisyui";
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
  const [noticeUser, setNoticeUser] = useState<boolean>(false);

  const [deletionToast, setDeletionToast] = useState(false);

  const signIn = () => {
    nextSignIn("email", { email: inputEmail, redirect: false });
    setNoticeUser(true);
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

        <Divider className="m-10" />

        <Button
          size="xs"
          color="ghost"
          className="hover:bg-error hover:text-error-content"
          onClick={deleteAccount}
        >
          Delete account
        </Button>

        <Button
          size="xs"
          color="ghost"
          className="hover:bg-warning hover:text-warning-content"
          onClick={signOut}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-page flex flex-col justify-center items-center space-y-4">
      <Input
        size="md"
        className="text-lg text-center"
        type="email"
        placeholder="Enter your email"
        value={inputEmail}
        onChange={(e) => setInputEmail(e.target.value)}
      />

      {noticeUser ? (
        <Alert className="w-auto" icon={alertIcon}>
          A message has been sent to your email.
        </Alert>
      ) : null}

      <Button size="sm" color="accent" disabled={!inputEmail} onClick={signIn}>
        Enter the app
      </Button>
    </div>
  );
}

const alertIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    className="w-6 h-6 mx-2 stroke-current"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    ></path>
  </svg>
);
