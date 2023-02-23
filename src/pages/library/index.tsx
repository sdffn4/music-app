import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import useLibrary from "@/hooks/react-query/useLibrary";
import useCreatePlaylist from "@/hooks/react-query/useCreatePlaylist";
import useDeletePlaylist from "@/hooks/react-query/useDeletePlaylist";
import useUnsubscribe from "@/hooks/react-query/useUnsubscribe";

import { EllipsisIcon } from "@/components/icons";
import { Button, Divider, Dropdown } from "react-daisyui";

import { v4 as uuidv4 } from "uuid";

import CreatePlaylistModal from "@/components/CreatePlaylistModal";

export default function Library() {
  const router = useRouter();

  const session = useSession();

  const { data: library } = useLibrary();

  const { mutate: mutateCreation, isLoading: isCreationLoading } =
    useCreatePlaylist();

  const { mutate: mutateDeletion, isLoading: isDeletionLoading } =
    useDeletePlaylist();

  const { mutate: mutateUnsubscription, isLoading: isUnsubscriptionLoading } =
    useUnsubscribe();

  const createPlaylist = async (title: string, file?: File) => {
    toggleVisible();

    const id = uuidv4();
    mutateCreation({ id, title, file });
  };

  const deletePlaylist = (playlistId: string) => {
    mutateDeletion({ playlistId });
  };

  const unsubscribe = (subscriptionId: string) => {
    mutateUnsubscription({ subscriptionId });
  };

  const [visible, setVisible] = useState<boolean>(false);
  const toggleVisible = () => setVisible((previous) => !previous);

  if (session.status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-page">
        Loading...
      </div>
    );
  }

  if (session.status === "unauthenticated") {
    return (
      <div className="flex justify-center items-center min-h-page">
        You have to sign in to be able to manage your library.
      </div>
    );
  }

  return (
    <div className="min-h-page">
      <div className="flex flex-col">
        <div
          onClick={() => router.push(`/library/uploads`)}
          className="border border-primary rounded-md text-center p-4 m-4 text-lg shadow-lg hover:cursor-pointer"
        >
          your uploads
        </div>

        <Divider
          color="primary"
          className="flex w-full justify-center items-center py-6"
        >
          <p className="text-lg">your playlists</p>

          <Button color="secondary" size="sm" onClick={toggleVisible}>
            create
          </Button>
        </Divider>

        <CreatePlaylistModal
          visible={visible}
          toggleVisible={toggleVisible}
          isLoading={isCreationLoading}
          createPlaylist={createPlaylist}
        />

        <div className="flex gap-4 justify-center flex-wrap sm:flex-col lg:flex-row">
          {library && library.playlists.length > 0 ? (
            library.playlists.map((playlist) => (
              <div
                onClick={() => router.push(`/playlist/${playlist.id}`)}
                key={playlist.id}
                className="flex lg:w-1/3 shadow-lg sm:mx-4 border border-primary border-opacity-40 divide-x divide-primary divide-opacity-40 hover:cursor-pointer"
              >
                <div className="w-32 h-32 relative shrink-0">
                  <Image
                    fill
                    src={playlist.cover ? playlist.cover : "/vercel.svg"}
                    alt="cover"
                  />
                </div>

                <div className="hidden sm:flex p-4 items-center justify-between w-full">
                  <div className="flex flex-col">
                    <h3 className="text-xl font-medium">{playlist.title}</h3>
                    <p>{`${playlist.tracks.length} track${
                      playlist.tracks.length === 1 ? "" : "s"
                    }`}</p>
                  </div>

                  <PlaylistDropdown>
                    <Button
                      color="primary"
                      size="sm"
                      disabled={isDeletionLoading}
                      loading={isDeletionLoading}
                      onClick={() => deletePlaylist(playlist.id)}
                    >
                      Delete
                    </Button>
                  </PlaylistDropdown>
                </div>
              </div>
            ))
          ) : (
            <div className="m-4 text-center">
              You have no playlists. Use the button above to create one.
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <Divider color="primary" className="py-6 text-lg">
          your subscriptions
        </Divider>

        <div className="flex gap-4 justify-center flex-wrap sm:flex-col">
          {library && library.subscriptions.length > 0 ? (
            library.subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                onClick={() =>
                  router.push(`/playlist/${subscription.playlist.id}`)
                }
                className="flex shadow-lg sm:mx-4 border border-primary border-opacity-40 divide-x divide-primary divide-opacity-40 hover:cursor-pointer"
              >
                <div className="w-32 h-32 relative shrink-0">
                  <Image
                    fill
                    src={
                      subscription.playlist.cover
                        ? subscription.playlist.cover
                        : "/vercel.svg"
                    }
                    alt="cover"
                  />
                </div>

                <div className="hidden sm:flex p-4 items-center justify-between w-full">
                  <div className="flex flex-col">
                    <h3 className="text-xl font-medium">
                      {subscription.playlist.title}
                    </h3>
                    <p>{`${subscription.playlist.tracks.length} track${
                      subscription.playlist.tracks.length === 1 ? "" : "s"
                    }`}</p>
                  </div>

                  <SubscriptionDropdown>
                    <Button
                      color="primary"
                      size="sm"
                      onClick={() => unsubscribe(subscription.id)}
                      disabled={isUnsubscriptionLoading}
                      loading={isUnsubscriptionLoading}
                    >
                      Unsubscribe
                    </Button>
                  </SubscriptionDropdown>
                </div>
              </div>
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
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
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
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Dropdown.Toggle size="sm" color="primary">
        <EllipsisIcon />
      </Dropdown.Toggle>

      <Dropdown.Menu className="w-56 m-1">{children}</Dropdown.Menu>
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
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Dropdown.Toggle size="sm" color="primary">
        <EllipsisIcon />
      </Dropdown.Toggle>

      <Dropdown.Menu className="w-56 m-1">{children}</Dropdown.Menu>
    </Dropdown>
  );
};
