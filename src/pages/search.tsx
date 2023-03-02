import PlaylistCard from "@/components/PlaylistCard";
import Track from "@/components/Track";
import TrackDropdown from "@/components/TrackDropdown";
import useAddTrack from "@/hooks/react-query/useAddTrack";
import useLibrary from "@/hooks/react-query/useLibrary";
import useRemoveTracks from "@/hooks/react-query/useRemoveTracks";
import useDebounce from "@/hooks/useDebounce";
import usePlayerStore from "@/store";
import { TrackType } from "@/types";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Divider, Input } from "react-daisyui";
import { SearchApi, SearchApiPlaylists, SearchApiTracks } from "./api/search";

export default function Search() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce<string>(search, 500);

  const [tracks, setTracks] = useState<SearchApiTracks>([]);
  const [playlists, setPlaylists] = useState<SearchApiPlaylists>([]);

  const { data: library } = useLibrary();

  const { mutate: mutateAdd } = useAddTrack();

  const { mutate: mutateRemove } = useRemoveTracks();

  useEffect(() => {
    if (debouncedSearch)
      fetch(`/api/search?search=${debouncedSearch}`)
        .then((res) => res.json())
        .then((res: SearchApi) => {
          setTracks(res.tracks);
          setPlaylists(res.playlists);
        });
  }, [debouncedSearch]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);

    if (e.target.value === "") {
      router.push(`/search`);

      setTracks([]);
      setPlaylists([]);
    } else {
      router.push(`/search?q=${e.target.value}`);
    }
  };

  const { isPlaying, setIsPlaying, queue, setQueue, addToQueue } =
    usePlayerStore((state) => state);

  const currentTrack = queue.instances[queue.index]?.track;

  const play = (track: TrackType, index: number) => {
    const clickedOnCurrentPlayingTrack =
      currentTrack?.id === track.id && isPlaying;
    const clickedOnCurrentNotPlayingTrack =
      currentTrack?.id === track.id && !isPlaying;
    const clickedOnNotCurrentTrack = currentTrack?.id !== track.id;

    if (clickedOnCurrentPlayingTrack) {
      setIsPlaying(false);
    }

    if (clickedOnCurrentNotPlayingTrack) {
      setIsPlaying(true);
    }

    if (clickedOnNotCurrentTrack && tracks) {
      setQueue(index, tracks);
      setIsPlaying(true);
    }
  };

  const addTrackToPlaylist = (playlistId: string, trackId: string) => {
    mutateAdd({ playlistId, trackId });
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    mutateRemove({ playlistId, tracks: [trackId] });
  };

  return (
    <>
      <Head>
        <title>Search</title>
      </Head>

      <div className="min-h-page">
        <div className="text-center px-4 pt-3">
          <Input
            className="w-full"
            placeholder="Search"
            value={search}
            onChange={onChange}
          />
        </div>

        <div>
          <div>
            <Divider color="primary" className="mx-4">
              <h3 className="text-lg opacity-80">tracks</h3>
            </Divider>
            <div>
              {tracks.map((track, index) => {
                return (
                  <Track
                    key={track.id}
                    index={index}
                    isActive={false}
                    track={track}
                    onClick={() => play(track, index)}
                    dropdown={
                      <TrackDropdown
                        trackId={track.id}
                        playlists={library ? library.playlists : []}
                        addToQueue={() => addToQueue(track)}
                        addTrackToPlaylist={(playlistId) =>
                          addTrackToPlaylist(playlistId, track.id)
                        }
                        removeTrackFromPlaylist={(playlistId) =>
                          removeTrackFromPlaylist(playlistId, track.id)
                        }
                      />
                    }
                  />
                );
              })}
            </div>
          </div>

          <div>
            <Divider color="primary" className="mx-4">
              <h3 className="text-lg opacity-80">playlists</h3>
            </Divider>

            <div className="flex flex-wrap justify-center">
              {playlists.map((playlist) => (
                <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                  <PlaylistCard
                    title={playlist.title}
                    cover={playlist.cover}
                    tracks={playlist.tracks}
                    duration={playlist.duration}
                    subscriptions={playlist.subscriptions}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
