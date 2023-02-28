import usePlayerStore from "@/store";

import useLibrary from "@/hooks/react-query/useLibrary";
import useAddTrack from "@/hooks/react-query/useAddTrack";
import useRemoveTracks from "@/hooks/react-query/useRemoveTracks";

import Track from "@/components/Track";
import TrackDropdown from "@/components/TrackDropdown";

export default function Queue() {
  const { data: library } = useLibrary();

  const { mutate: mutateAdd } = useAddTrack();

  const { mutate: mutateRemove } = useRemoveTracks();

  const {
    isPlaying,
    setIsPlaying,
    queue,
    setQueueInstance,
    addToQueue,
    removeFromQueue,
  } = usePlayerStore((state) => state);

  const play = (index: number) => {
    setQueueInstance(index);

    const clickedOnCurrentPlayingTrack = queue.index === index && isPlaying;
    const clickedOnCurrentNotPlayingTrack = queue.index === index && !isPlaying;
    const clickedOnNotCurrentTrack = queue.index !== index;

    if (clickedOnCurrentPlayingTrack) {
      setIsPlaying(false);
    }

    if (clickedOnCurrentNotPlayingTrack || clickedOnNotCurrentTrack) {
      setIsPlaying(true);
    }
  };

  const addTrackToPlaylist = (playlistId: string, trackId: string) => {
    mutateAdd({ playlistId, trackId });
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    mutateRemove({ playlistId, tracks: [trackId] });
  };

  if (queue.instances.length === 0) {
    return (
      <div className="min-h-page flex justify-center items-center">
        Queue is empty
      </div>
    );
  }

  return (
    <div className="min-h-page">
      {queue.instances.map((instance, index) => {
        const currentInstance = queue.instances[queue.index];
        const isActive = instance.id === currentInstance.id && isPlaying;

        return (
          <Track
            key={instance.id}
            index={index}
            track={instance.track}
            isActive={isActive}
            onClick={() => play(index)}
            dropdown={
              <TrackDropdown
                trackId={instance.track.id}
                playlists={library ? library.playlists : []}
                addToQueue={() => addToQueue(instance.track)}
                removeFromQueue={() => removeFromQueue(index)}
                addTrackToPlaylist={(playlistId) =>
                  addTrackToPlaylist(playlistId, instance.track.id)
                }
                removeTrackFromPlaylist={(playlistId) =>
                  removeTrackFromPlaylist(playlistId, instance.track.id)
                }
              />
            }
          />
        );
      })}
    </div>
  );
}
