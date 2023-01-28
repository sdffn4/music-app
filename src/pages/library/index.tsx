import { useSession } from "next-auth/react";
import ListItem from "../../components/ListItem";
import { createPlaylist, removePlaylist } from "@/lib/fetchers";
import { useState } from "react";
import { Button, Dropdown, Modal } from "react-daisyui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EllipsisIcon } from "@/components/icons";
import { useRouter } from "next/router";
import useLibrary from "@/hooks/useLibrary";

export default function Library() {
  const router = useRouter();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [visible, setVisible] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const { data: session } = useSession();

  const { data, isLoading: isLoadingQuery } = useLibrary();

  const { isLoading: isLoadingCreation, mutate: mutateCreation } = useMutation({
    mutationFn: createPlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
      setTitle("");
      setDescription("");
      setVisible(false);
    },
  });

  const { isLoading: isLoadingRemove, mutate: mutateRemove } = useMutation({
    mutationFn: removePlaylist,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["library"] }),
  });

  if (!session) {
    return <div>You have to sign in to be able to manage your library.</div>;
  }

  const toggleVisible = () => setVisible((prev) => !prev);

  const handleCreate = () => {
    mutateCreation({ title, description });
  };

  const handleRemove = (playlistId: string) => {
    mutateRemove({ playlistId });
  };

  return (
    <div>
      <ListItem text="Uploads" to="/library/uploads" />

      <div className="m-4 font-sans flex">
        <h3>Your playlists</h3>
        <Button size="xs" onClick={toggleVisible}>
          +
        </Button>

        <Modal open={visible} onClickBackdrop={toggleVisible}>
          <Modal.Header className="font-bold">
            Create a new playlist
          </Modal.Header>

          <Modal.Body>
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">What is the title?</span>
              </label>
              <input
                type="text"
                placeholder="Type here"
                className="input input-bordered w-full max-w-xs"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <label className="label">
                <span className="label-text">Playlist description</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
              <div className="m-4 flex justify-around">
                <Button onClick={toggleVisible}>cancel</Button>
                <Button
                  onClick={handleCreate}
                  disabled={!title || isLoadingCreation}
                  loading={isLoadingCreation}
                >
                  create
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>

      <div>
        {isLoadingQuery ? (
          <div>Loading...</div>
        ) : (
          data?.playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => router.push(`/playlist/${playlist.id}`)}
              className="flex justify-between items-center hover:bg-white hover:bg-opacity-30 hover:cursor-pointer p-4"
            >
              <p className="truncate">{playlist.title}</p>
              <Dropdown
                hover
                horizontal="left"
                onClick={(e) => e.stopPropagation()}
              >
                <Dropdown.Toggle className="px-2">
                  <EllipsisIcon />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Button
                    className="p-4 w-max h-full"
                    size="xs"
                    onClick={() => handleRemove(playlist.id)}
                    loading={isLoadingRemove}
                    disabled={isLoadingRemove}
                  >
                    Remove
                  </Button>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
