import useAddTrack from "@/hooks/react-query/useAddTrack";
import useLibrary from "@/hooks/react-query/useLibrary";
import useRemoveTrack from "@/hooks/react-query/useRemoveTrack";
import usePlayerStore from "@/store";
import { TrackType } from "@/types";
import { Alert, Button, Checkbox, Dropdown } from "react-daisyui";

interface TrackDropdownProps {
  track: TrackType;
}

const TrackDropdown: React.FC<TrackDropdownProps> = ({ track }) => {
  const { data: library } = useLibrary();
  const { mutate: mutateAdd, isLoading: isAddLoading } = useAddTrack();
  const { mutate: mutateRemove, isLoading: isRemoveLoading } = useRemoveTrack();

  const { addToQueue } = usePlayerStore((state) => state);

  const addToPlaylist = (playlistId: string) => {
    mutateAdd({ playlistId, trackId: track.id });
  };

  const removeFromPlaylist = (playlistId: string) => {
    mutateRemove({ playlistId, trackId: track.id });
  };

  return (
    <div className="divide-y divide-neutral space-y-2">
      <div className="flex justify-center items-center">
        <Button className="w-full" size="xs" onClick={() => addToQueue(track)}>
          Add to queue
        </Button>
      </div>

      <div className="flex flex-col justify-center items-center space-y-2 pt-2 pb-2">
        {library && library.playlists.length > 0 ? (
          library.playlists.map((playlist) => {
            const isTrackInPlaylist = playlist.tracks.includes(track.id);

            return (
              <Button
                key={playlist.id}
                className="w-full flex justify-between items-center"
                size="sm"
                onClick={
                  isTrackInPlaylist
                    ? () => removeFromPlaylist(playlist.id)
                    : () => addToPlaylist(playlist.id)
                }
              >
                <div className="w-full flex justify-between items-center">
                  <Checkbox size="xs" readOnly checked={isTrackInPlaylist} />
                  <p className="text-sm font-semibold">{playlist.title}</p>
                </div>
              </Button>
            );
          })
        ) : (
          <Alert className="text-sm" icon={alertIcon}>
            You have no playlists.
          </Alert>
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
