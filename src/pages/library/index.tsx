import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";

import useLibrary from "@/hooks/react-query/useLibrary";
import useCreatePlaylist from "@/hooks/react-query/useCreatePlaylist";
import useDeletePlaylist from "@/hooks/react-query/useDeletePlaylist";
import useUnsubscribe from "@/hooks/react-query/useUnsubscribe";

import { EllipsisIcon } from "@/components/icons";
import { Button, Dropdown, Input, Modal } from "react-daisyui";

import { v4 as uuidv4 } from "uuid";

export default function Library() {
  const session = useSession();

  const { data: library } = useLibrary();

  const { mutate: mutateCreation, isLoading: isCreationLoading } =
    useCreatePlaylist();

  const { mutate: mutateDeletion, isLoading: isDeletionLoading } =
    useDeletePlaylist();

  const { mutate: mutateUnsubscription, isLoading: isUnsubscriptionLoading } =
    useUnsubscribe();

  const createPlaylist = () => {
    toggleVisible();
    setTitle("");

    const id = uuidv4();
    mutateCreation({ id, title });
  };

  const deletePlaylist = (playlistId: string) => {
    mutateDeletion({ playlistId });
  };

  const unsubscribe = (subscriptionId: string) => {
    mutateUnsubscription({ subscriptionId });
  };

  const [title, setTitle] = useState<string>("");

  const [visible, setVisible] = useState<boolean>(false);
  const toggleVisible = () => setVisible((previous) => !previous);

  if (!session) {
    return (
      <div className="flex justify-center items-center h-full">
        You have to sign in to be able to manage your library.
      </div>
    );
  }

  return (
    <div className="min-h-page">
      <Link href="/library/uploads">
        <div className="flex justify-between items-center p-4 hover:bg-primary-focus hover:cursor-pointer">
          <div>Your uploads</div>
          <UploadsDropdown>
            <Dropdown.Item>There is nothing in here yet</Dropdown.Item>
          </UploadsDropdown>
        </div>
      </Link>

      <div className="flex flex-col">
        <div className="flex items-center">
          <h2 className="px-4 py-2 font-semibold">Your playlists</h2>
          <Button size="sm" onClick={toggleVisible}>
            Create
          </Button>

          <Modal open={visible} onClickBackdrop={toggleVisible}>
            <Modal.Body>
              <div className="form-control w-full max-w-xs">
                <label className="label px-2">
                  <span className="label-text">
                    {"What's the playlist title?"}
                  </span>
                </label>
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </Modal.Body>

            <Modal.Actions>
              <Button
                color="success"
                onClick={createPlaylist}
                loading={isCreationLoading}
                disabled={!title || isCreationLoading}
              >
                Create
              </Button>
              <Button onClick={toggleVisible} disabled={isCreationLoading}>
                Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </div>

        <div>
          {library && library.playlists.length > 0 ? (
            library.playlists.map((playlist) => (
              <Link href={`/playlist/${playlist.id}`} key={playlist.id}>
                <div className="flex justify-between items-center p-4 hover:bg-primary-focus hover:cursor-pointer">
                  <div>{playlist.title}</div>
                  <PlaylistDropdown>
                    <Button
                      className="hover:text-warning"
                      disabled={isDeletionLoading}
                      loading={isDeletionLoading}
                      onClick={() => deletePlaylist(playlist.id)}
                    >
                      Delete
                    </Button>
                  </PlaylistDropdown>
                </div>
              </Link>
            ))
          ) : (
            <div className="m-4 text-center">
              You have no playlists. Use the button above to create one.
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <h2 className="px-4 py-2 font-semibold">Your subscriptions</h2>

        <div>
          {library && library.subscriptions.length > 0 ? (
            library.subscriptions.map((subscription) => (
              <Link
                key={subscription.id}
                href={`/playlist/${subscription.playlist.id}`}
              >
                <div className="flex justify-between items-center p-4 hover:bg-primary-focus hover:cursor-pointer">
                  <div>{subscription.playlist.title}</div>
                  <SubscriptionDropdown>
                    <Button
                      className="hover:text-warning"
                      onClick={() => unsubscribe(subscription.id)}
                      disabled={isUnsubscriptionLoading}
                      loading={isUnsubscriptionLoading}
                    >
                      Unsubscribe
                    </Button>
                  </SubscriptionDropdown>
                </div>
              </Link>
            ))
          ) : (
            <div className="m-4 text-center">
              You have no subscriptions. Use <Link href="/search">search</Link>{" "}
              to find any.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface UploadsDropdownProps {
  children: React.ReactNode;
}

const UploadsDropdown: React.FC<UploadsDropdownProps> = ({ children }) => {
  return (
    <Dropdown
      horizontal="left"
      vertical="middle"
      onClick={(e) => e.preventDefault()}
    >
      <Dropdown.Toggle size="sm">
        <EllipsisIcon />
      </Dropdown.Toggle>

      <Dropdown.Menu className="w-64 m-1">{children}</Dropdown.Menu>
    </Dropdown>
  );
};

interface PlaylistDropdownProps {
  children: React.ReactNode;
}

const PlaylistDropdown: React.FC<PlaylistDropdownProps> = ({ children }) => {
  return (
    <Dropdown
      horizontal="left"
      vertical="middle"
      onClick={(e) => e.preventDefault()}
    >
      <Dropdown.Toggle size="sm">
        <EllipsisIcon />
      </Dropdown.Toggle>

      <Dropdown.Menu className="w-64 m-1">{children}</Dropdown.Menu>
    </Dropdown>
  );
};

interface SubscriptionDropdownProps {
  children: React.ReactNode;
}

const SubscriptionDropdown: React.FC<SubscriptionDropdownProps> = ({
  children,
}) => {
  return (
    <Dropdown
      horizontal="left"
      vertical="middle"
      onClick={(e) => e.preventDefault()}
    >
      <Dropdown.Toggle size="sm">
        <EllipsisIcon />
      </Dropdown.Toggle>

      <Dropdown.Menu className="w-64 m-1">{children}</Dropdown.Menu>
    </Dropdown>
  );
};
