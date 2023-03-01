import "@/styles/globals.css";

import type { AppProps } from "next/app";

import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import usePlayerStore from "@/store";

import Link from "next/link";
import { SessionProvider } from "next-auth/react";

import {
  QueryClient,
  QueryClientProvider,
  Hydrate,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import {
  HomeIconActive,
  HomeIconPassive,
  LibraryIconActive,
  LibraryIconPassive,
  QueueIconActive,
  QueueIconPassive,
  SearchIconActive,
  SearchIconPassive,
  UserIconActive,
  UserIconPassive,
} from "../components/icons/menu";

import { Range, Theme } from "react-daisyui";
import Player from "@/components/Player";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <SessionProvider session={session}>
          <Theme dataTheme="pastel">
            <Component {...pageProps} />
            <BottomNavigation />
          </Theme>
          <ReactQueryDevtools initialIsOpen={false} />
        </SessionProvider>
      </Hydrate>
    </QueryClientProvider>
  );
}

const menuButtons = [
  {
    href: "/",
    activeIcon: <HomeIconActive />,
    passiveIcon: <HomeIconPassive />,
  },
  {
    href: "/library",
    activeIcon: <LibraryIconActive />,
    passiveIcon: <LibraryIconPassive />,
  },
  {
    href: "/queue",
    activeIcon: <QueueIconActive />,
    passiveIcon: <QueueIconPassive />,
  },
  {
    href: "/search",
    activeIcon: <SearchIconActive />,
    passiveIcon: <SearchIconPassive />,
  },
  {
    href: "/profile",
    activeIcon: <UserIconActive />,
    passiveIcon: <UserIconPassive />,
  },
];

const BottomNavigation: React.FC = () => {
  const { pathname } = useRouter();

  const audioRef = useRef<HTMLAudioElement>(null);

  const [volume, setVolume] = useState(20);
  const [currentTime, setCurrentTime] = useState(0);

  if (audioRef.current) audioRef.current.volume = volume / 100;

  const { isPlaying, setIsPlaying, queue, skipBackward, skipForward } =
    usePlayerStore((state) => state);

  const currentInstance = queue.instances[queue.index];
  const currentTrack = currentInstance?.track;

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play();
      else audioRef.current.pause();
    }
  }, [isPlaying]);

  const onVolumeClick = () => {
    if (audioRef.current) {
      if (audioRef.current.volume === 0) {
        audioRef.current.volume = 0.25;
        setVolume(25);
      } else {
        audioRef.current.volume = 0;
        setVolume(0);
      }
    }
  };

  const onVolumeChange = (value: number) => {
    if (audioRef.current) {
      audioRef.current.volume = value / 100;
      setVolume(value);
    }
  };

  const hasPreviousTrack = Boolean(queue.instances[queue.index - 1]);
  const hasNextTrack = Boolean(queue.instances[queue.index + 1]);

  return (
    <div className="h-btm-nav flex flex-col sticky bottom-0 bg-base-100 bg-opacity-70 backdrop-blur-lg divide-y divide-neutral divide-opacity-10">
      <Range
        size="xs"
        color="primary"
        value={currentTime}
        max={Math.round(currentTrack?.duration ?? 0)}
        onChange={(e) => {
          if (audioRef.current) {
            audioRef.current.currentTime = +e.target.value;
            setCurrentTime(+e.target.value);
          }
        }}
      />

      <div className="flex basis-1/2 justify-between">
        <audio
          ref={audioRef}
          src={currentTrack?.source}
          onEmptied={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              setCurrentTime(0);

              if (isPlaying) audioRef.current.play();
              else audioRef.current.pause();
            }
          }}
          onTimeUpdate={() => {
            if (audioRef.current) {
              const thisCurrentTime = Math.round(audioRef.current.currentTime);
              if (currentTime !== thisCurrentTime)
                setCurrentTime(thisCurrentTime);
            }
          }}
          onEnded={hasNextTrack ? skipForward : undefined}
        />

        <Player
          title={currentTrack?.title}
          artist={currentTrack?.artist}
          isPlaying={isPlaying}
          hasCurrentTrack={Boolean(currentTrack)}
          hasPreviousTrack={hasPreviousTrack}
          hasNextTrack={hasNextTrack}
          play={() => setIsPlaying(true)}
          pause={() => setIsPlaying(false)}
          volume={volume}
          onVolumeClick={onVolumeClick}
          onVolumeChange={onVolumeChange}
          skipBackward={skipBackward}
          skipForward={skipForward}
        />
      </div>

      <div className="flex basis-1/2 justify-between items-center">
        {menuButtons.map((button, index) => (
          <Link key={index} href={button.href} className="w-full">
            <div className="flex justify-center items-center">
              {pathname === button.href
                ? button.activeIcon
                : button.passiveIcon}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
