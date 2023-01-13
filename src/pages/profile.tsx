import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Profile() {
  const [email, setEmail] = useState<string>("");
  const [notification, setNotification] = useState<boolean>(false);
  const { data: session, status } = useSession();

  const handleSignIn = () => {
    signIn("email", { email, redirect: false });
    setNotification(true);
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  } else if (status === "authenticated") {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        <p>{session.user?.name}</p>
        <button onClick={() => signOut({ redirect: false })}>Sign out</button>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col justify-center items-center text-center h-full">
        <input
          className="bg-transparent outline-none text-center"
          type="email"
          placeholder="Email to sign up/in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="border-2 border-white p-2"
          disabled={!email}
          onClick={handleSignIn}
        >
          Sign in
        </button>
        {notification ? <p>{`A message has been sent to ${email}`}</p> : null}
      </div>
    );
  }
}
