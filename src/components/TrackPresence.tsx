import useAddTrack from "@/hooks/react-query/useAddTrack";
import useRemoveTrack from "@/hooks/react-query/useRemoveTrack";
import { getTrackPlaylistPresense } from "@/lib/fetchers";
import usePlayerStore from "@/store";
import { TrackType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Alert, Button, Checkbox, Divider, Dropdown } from "react-daisyui";
import { EllipsisIcon } from "./icons";

interface TrackPresenceProps {
  track: TrackType;
  index: number;
}

const TrackPresence: React.FC<TrackPresenceProps> = ({ track, index }) => {
  const router = useRouter();

  const { addToQueue, removeFromQueue } = usePlayerStore((state) => state);

  const { data, isLoading } = useQuery(["presense"], {
    queryFn: getTrackPlaylistPresense,
  });

  const playlists = data?.playlists ? data.playlists : [];

  const { mutate: mutateAdd, isLoading: isLoadingAdd } = useAddTrack();

  const { mutate: mutateRemove, isLoading: isLoadingRemove } = useRemoveTrack();

  const handlePlaylist = (playlist: DropdownPlaylist, trackId: string) => {
    if (playlist.tracks.includes(trackId)) {
      mutateRemove({ playlistId: playlist.id, trackId });
    } else {
      mutateAdd({ playlistId: playlist.id, trackId });
    }
  };

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <CustomDropdown
      handleAddQueue={() => addToQueue(track)}
      handleRemoveQueue={
        router.pathname === "/queue" ? () => removeFromQueue(index) : null
      }
      handlePlaylist={handlePlaylist}
      trackId={track.id}
      disabled={isLoadingAdd || isLoadingRemove}
      playlists={playlists}
    />
  );
};

interface DropdownPlaylist {
  id: string;
  title: string;
  tracks: Array<string>;
}

interface DropdownProps {
  handleAddQueue: () => void;
  handleRemoveQueue: (() => void) | null;
  handlePlaylist: (playlist: DropdownPlaylist, trackId: string) => void;
  trackId: string;
  disabled: boolean;
  playlists: Array<DropdownPlaylist>;
}

const CustomDropdown: React.FC<DropdownProps> = ({
  handleAddQueue,
  handleRemoveQueue,
  handlePlaylist,
  playlists,
  trackId,
  disabled,
}) => {
  return (
    <Dropdown className="flex justify-end items-center" horizontal="left" hover>
      <Dropdown.Toggle className=" px-4" size="xs">
        <EllipsisIcon />
      </Dropdown.Toggle>

      <Dropdown.Menu className="w-48 space-y-2">
        <Button size="sm" onClick={handleAddQueue}>
          add to queue
        </Button>

        {handleRemoveQueue ? (
          <Button size="sm" onClick={handleRemoveQueue}>
            remove from queue
          </Button>
        ) : null}

        <Divider />

        {playlists.length !== 0 ? (
          playlists.map((playlist) => (
            <ListItem
              key={playlist.id}
              title={playlist.title}
              disabled={disabled}
              checked={playlist.tracks.includes(trackId)}
              onClick={() => handlePlaylist(playlist, trackId)}
            />
          ))
        ) : (
          <NoPlaylistsAlert />
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

interface ListItemProps {
  disabled: boolean;
  checked: boolean;
  title: string;
  onClick: () => void;
}

const ListItem: React.FC<ListItemProps> = ({
  disabled,
  title,
  checked,
  onClick,
}) => {
  return (
    <Button size="sm" disabled={disabled} onClick={onClick}>
      <div className="flex justify-between w-full">
        <Checkbox readOnly checked={checked} disabled={disabled} size="xs" />
        <p>{title}</p>
      </div>
    </Button>
  );
};

const NoPlaylistsAlert: React.FC = () => {
  return (
    <Alert
      icon={
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
      }
    >
      You have no playlists.
    </Alert>
  );
};

export default TrackPresence;
