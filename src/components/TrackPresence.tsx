import {
  addTrackToPlaylist,
  getTrackPlaylistPresense,
  removeTrackFromPlaylist,
} from "@/lib/fetchers";
import usePlayerStore from "@/store";
import { TrackType } from "@/types";
import { GetTrackPlaylistPresenseApiResponse } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Checkbox, Divider, Dropdown } from "react-daisyui";
import { EllipsisIcon } from "./icons";

interface TrackPresenceProps {
  track: TrackType;
}

const TrackPresence: React.FC<TrackPresenceProps> = ({ track }) => {
  const queryClient = useQueryClient();

  const { addToQueue } = usePlayerStore((state) => state);

  const { data, isLoading } = useQuery(["presense"], {
    queryFn: getTrackPlaylistPresense,
  });

  const playlists = data?.playlists ? data.playlists : [];

  const { mutate: mutateAdd, isLoading: isLoadingAdd } = useMutation({
    mutationFn: addTrackToPlaylist,
    onMutate: (variables) => {
      const queryData =
        queryClient.getQueryData<GetTrackPlaylistPresenseApiResponse>([
          "presense",
        ]);

      queryClient.setQueryData<GetTrackPlaylistPresenseApiResponse>(
        ["presense"],
        (previous) => {
          if (previous && queryData) {
            const playlist = previous.playlists
              .filter((el) => el.id === variables.playlistId)
              .pop();

            const filteredPlaylists = previous.playlists.filter(
              (el) => el.id !== variables.playlistId
            );

            if (playlist) {
              return {
                playlists: [
                  ...filteredPlaylists,
                  {
                    id: playlist.id,
                    title: playlist.title,
                    tracks: [...playlist.tracks, variables.trackId],
                  },
                ],
              };
            }
          }

          return previous;
        }
      );

      return { queryData };
    },
    onSuccess() {
      queryClient.invalidateQueries(["presense"]);
    },
  });

  const { mutate: mutateRemove, isLoading: isLoadingRemove } = useMutation({
    mutationFn: removeTrackFromPlaylist,
    onMutate: async (variables) => {
      const queryData =
        queryClient.getQueryData<GetTrackPlaylistPresenseApiResponse>([
          "presense",
        ]);

      queryClient.setQueryData<GetTrackPlaylistPresenseApiResponse>(
        ["presense"],
        (previous) => {
          if (previous && queryData) {
            const playlist = previous.playlists
              .filter((el) => el.id === variables.playlistId)
              .pop();
            const filteredPlaylists = previous.playlists.filter(
              (el) => el.id !== variables.playlistId
            );

            if (playlist) {
              return {
                playlists: [
                  ...filteredPlaylists,
                  {
                    id: playlist.id,
                    title: playlist.title,
                    tracks: playlist.tracks.filter(
                      (el) => el !== variables.trackId
                    ),
                  },
                ],
              };
            }
          }

          return previous;
        }
      );

      return { queryData };
    },
    onSuccess() {
      queryClient.invalidateQueries(["presense"]);
    },
  });

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
      handleQueue={() => addToQueue(track)}
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
  handleQueue: () => void;
  handlePlaylist: (playlist: DropdownPlaylist, trackId: string) => void;
  trackId: string;
  disabled: boolean;
  playlists: Array<DropdownPlaylist>;
}

const CustomDropdown: React.FC<DropdownProps> = ({
  handleQueue,
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
        <Button size="sm" onClick={handleQueue}>
          add to queue
        </Button>

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
