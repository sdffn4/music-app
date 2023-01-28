import {
  addTrackToPlaylist,
  getTrackPlaylistPresense,
  removeTrackFromPlaylist,
} from "@/lib/fetchers";
import { GetTrackPlaylistPresenseApiResponse } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Alert, Button, Checkbox, Dropdown } from "react-daisyui";
import { EllipsisIcon } from "./icons";

interface TrackPresenceProps {
  trackId: string;
}

const TrackPresence: React.FC<TrackPresenceProps> = ({ trackId }) => {
  const queryClient = useQueryClient();

  const { data: presense, isLoading: isPresenseLoading } = useQuery(
    ["presense"],
    {
      queryFn: getTrackPlaylistPresense,
    }
  );

  const [loadingPlaylists, setLoadingPlaylists] = useState<string[]>([]);

  const { mutate: mutateAdd, isLoading: isMutateAddLoading } = useMutation({
    mutationFn: addTrackToPlaylist,
    onSuccess(data, variables, context) {
      queryClient.setQueryData<GetTrackPlaylistPresenseApiResponse>(
        [`presense`],
        (data) => {
          if (data) {
            const playlist = data.playlists
              .filter((el) => el.id === variables.playlistId)
              .pop();

            if (playlist) playlist.tracks.push(variables.trackId);
          }

          return data ? { ...data } : data;
        }
      );

      setLoadingPlaylists((prev) => {
        return prev.filter((playlistId) => playlistId !== variables.playlistId);
      });
    },
  });

  const { mutate: mutateRemove, isLoading: isMutateRemoveLoading } =
    useMutation({
      mutationFn: removeTrackFromPlaylist,
      onSuccess(data, variables, context) {
        queryClient.setQueryData<GetTrackPlaylistPresenseApiResponse>(
          [`presense`],
          (data) => {
            if (data) {
              const playlist = data.playlists
                .filter((el) => el.id === variables.playlistId)
                .pop();

              if (playlist)
                playlist.tracks = playlist.tracks.filter(
                  (trackId) => trackId !== variables.trackId
                );
            }

            return data ? { ...data } : data;
          }
        );

        setLoadingPlaylists((prev) => {
          return prev.filter(
            (playlistId) => playlistId !== variables.playlistId
          );
        });
      },
    });

  const includesTrack = (playlistId: string) => {
    const playlist = presense?.playlists
      .filter((el) => el.id === playlistId)
      .pop();

    return playlist ? playlist.tracks.includes(trackId) : false;
  };

  const handleClick = (playlistId: string, isTrackIncluded: boolean) => {
    setLoadingPlaylists((prev) => [...prev, playlistId]);

    if (isTrackIncluded) mutateRemove({ playlistId, trackId });
    else mutateAdd({ playlistId, trackId });
  };

  return (
    <Dropdown className="flex justify-end items-center" hover horizontal="left">
      <Dropdown.Toggle className=" px-4" size="xs">
        <EllipsisIcon />
      </Dropdown.Toggle>
      <Dropdown.Menu className="w-48 space-y-2">
        {presense && presense.playlists.length > 0 ? (
          presense?.playlists.map((playlist) => {
            const isTrackIncluded = includesTrack(playlist.id);
            const isButtonLoading =
              loadingPlaylists.includes(playlist.id) &&
              (isMutateAddLoading || isMutateRemoveLoading);

            return (
              <Button
                key={playlist.id}
                className=""
                size="sm"
                disabled={isButtonLoading}
                onClick={() => handleClick(playlist.id, isTrackIncluded)}
              >
                <div className="flex justify-between w-full">
                  <Checkbox
                    readOnly
                    checked={isTrackIncluded}
                    disabled={isButtonLoading}
                    size="xs"
                  />
                  <p>{playlist.title}</p>
                </div>
              </Button>
            );
          })
        ) : (
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
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default TrackPresence;
