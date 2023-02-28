import { useState } from "react";

import {
  useSession,
  signIn as nextSignIn,
  signOut as nextSignOut,
} from "next-auth/react";

import { Alert, Button, Input } from "react-daisyui";

export default function Profile() {
  const { data: session, status: sessionStatus } = useSession();

  const [inputEmail, setInputEmail] = useState<string>("");
  const [noticeUser, setNoticeUser] = useState<boolean>(false);

  const signIn = () => {
    nextSignIn("email", { email: inputEmail, redirect: false });
    setNoticeUser(true);
  };

  const signOut = () => {
    nextSignOut({ redirect: false });
  };

  if (sessionStatus === "loading") {
    return (
      <div className="min-h-page flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (sessionStatus === "authenticated") {
    return (
      <div className="min-h-page flex flex-col justify-center items-center space-y-4">
        <p>Username: {session.user?.name}</p>
        <Button onClick={signOut}>Sign out</Button>
      </div>
    );
  }

  return (
    <div className="min-h-page flex flex-col justify-center items-center space-y-4">
      <Input
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

      <Button disabled={!inputEmail} onClick={signIn}>
        Sign in / Sign up
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
