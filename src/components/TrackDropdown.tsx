import useAddTrack from "@/hooks/react-query/mutations/useAddTrack";
import useRemoveTracks from "@/hooks/react-query/mutations/useRemoveTracks";
import useLibrary from "@/hooks/react-query/queries/useLibrary";
import usePlayerStore from "@/store";
import { TrackType } from "@/types";
import { useRouter } from "next/router";
import { Alert, Button, Checkbox } from "react-daisyui";

interface TrackDropdownProps {
  index: number;
  track: TrackType;
}

const TrackDropdown: React.FC<TrackDropdownProps> = ({ index, track }) => {
  const { pathname } = useRouter();

  const {
    isPlaying,
    setIsPlaying,
    queue,
    setQueueInstance,
    addToQueue,
    removeFromQueue,
  } = usePlayerStore((state) => state);

  const { data: library } = useLibrary();
  const playlists = library ? library.playlists : [];

  const { mutate: mutateAdd } = useAddTrack();
  const { mutate: mutateRemove } = useRemoveTracks();

  const addTrackToPlaylist = (playlistId: string) => {
    mutateAdd({ playlistId, trackId: track.id });
  };

  const removeTrackFromPlaylist = (playlistId: string) => {
    mutateRemove({ playlistId, tracks: [track.id] });
  };

  return (
    <div className="divide-y divide-primary w-full">
      <div className="text-center">
        <Button
          size="xs"
          color="primary"
          className="my-2 w-full"
          onClick={() => addToQueue(track)}
        >
          add to queue
        </Button>

        {pathname === "/queue" ? (
          <Button
            size="xs"
            color="primary"
            className="my-2 w-full"
            onClick={() => removeFromQueue(index)}
          >
            remove from queue
          </Button>
        ) : null}
      </div>

      <div>
        {playlists.length > 0 ? (
          playlists.map((playlist) => {
            const hasTrack = playlist.tracks.includes(track.id);

            return (
              <Button
                key={playlist.id}
                size="sm"
                color="primary"
                className="flex flex-nowrap justify-between items-center w-full my-2 space-x-3"
                onClick={
                  hasTrack
                    ? () => removeTrackFromPlaylist(playlist.id)
                    : () => addTrackToPlaylist(playlist.id)
                }
              >
                <Checkbox
                  size="xs"
                  color="primary"
                  readOnly
                  checked={hasTrack}
                />
                <p className="truncate">{playlist.title}</p>
              </Button>
            );
          })
        ) : (
          <Alert icon={alertIcon}>You have no playlists.</Alert>
        )}
      </div>
    </div>
  );
};

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

export default TrackDropdown;
