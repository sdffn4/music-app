import Link from "next/link";
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
import PlaylistCard from "@/components/PlaylistCard";
import Head from "next/head";

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

  return (
    <>
      <Head>
        <title>Library</title>
      </Head>

      {session.status === "unauthenticated" ? (
        <div className="flex justify-center items-center min-h-page">
          You have to sign in to be able to manage your library.
        </div>
      ) : session.status === "loading" ? (
        <div className="flex justify-center items-center min-h-page">
          Loading...
        </div>
      ) : (
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

            <div className="flex flex-wrap justify-center">
              {library && library.playlists.length > 0 ? (
                library.playlists.map((playlist) => (
                  <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                    <PlaylistCard
                      title={playlist.title}
                      cover={playlist.cover}
                      duration={playlist.duration}
                      tracks={playlist.tracks.length}
                      subscribers={playlist.subscribers}
                      dropdown={
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
                      }
                    />
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
            <Divider color="primary" className="py-6 text-lg">
              your subscriptions
            </Divider>

            <div className="flex flex-wrap justify-center">
              {library && library.subscriptions.length > 0 ? (
                library.subscriptions.map((subscription) => (
                  <Link
                    key={subscription.id}
                    href={`/playlist/${subscription.playlistId}`}
                  >
                    <PlaylistCard
                      title={subscription.title}
                      cover={subscription.cover}
                      duration={subscription.duration}
                      tracks={subscription.tracks}
                      subscribers={subscription.subscribers}
                      dropdown={
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
                      }
                    />
                  </Link>
                ))
              ) : (
                <div className="m-4 text-center">
                  You have no subscriptions. Use{" "}
                  <Link href="/search">search</Link> to find any.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface PlaylistDropdownProps {
  children: React.ReactNode;
}

const PlaylistDropdown: React.FC<PlaylistDropdownProps> = ({ children }) => {
  return (
    <Dropdown
      horizontal="left"
      vertical="middle"
      className="p-3"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Dropdown.Toggle size="sm" color="ghost">
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
      className="p-3"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Dropdown.Toggle size="sm" color="ghost">
        <EllipsisIcon />
      </Dropdown.Toggle>

      <Dropdown.Menu className="w-56 m-1">{children}</Dropdown.Menu>
    </Dropdown>
  );
};
