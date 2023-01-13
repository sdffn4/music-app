import { useSession } from "next-auth/react";
import ListItem from "../../components/ListItem";

export default function Library() {
  const { data: session } = useSession();

  if (!session) {
    return <div>You have to sign in to be able to manage your library.</div>;
  }

  return (
    <div>
      <div>
        <ListItem text="Uploads" to="/library/uploads" />
      </div>
    </div>
  );
}
