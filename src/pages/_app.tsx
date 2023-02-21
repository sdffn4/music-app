import "@/styles/globals.css";
import { useEffect, useRef, useState } from "react";
import { SessionProvider } from "next-auth/react";

import type { AppProps } from "next/app";

import {
  QueryClient,
  QueryClientProvider,
  Hydrate,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Button, Theme } from "react-daisyui";

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
import Link from "next/link";
import { useRouter } from "next/router";
import usePlayerStore from "@/store";
import Image from "next/image";
import {
  PauseIcon,
  PlayIcon,
  SkipBackwardIcon,
  SkipForwardIcon,
} from "@/components/icons/player";

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

  return (
    <div className="h-btm-nav flex flex-col sticky bottom-0 bg-base-100 bg-opacity-70 backdrop-blur-lg divide-y-2 divide-white divide-opacity-10">
      <div className="flex basis-1/2 justify-between">
        <Player />
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

const Player: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const { isPlaying, setIsPlaying, queue, skipBackward, skipForward } =
    usePlayerStore((state) => state);

  const currentInstance = queue.instances[queue.index];
  const currentTrack = currentInstance?.track;

  const hasPreviousTrack = queue.instances[queue.index - 1];
  const hasNextTrack = queue.instances[queue.index + 1];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;

      if (isPlaying) audioRef.current.play();
      else audioRef.current.pause();
    }
  }, [currentInstance?.id]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play();
      else audioRef.current.pause();
    }
  }, [isPlaying]);

  const play = () => {
    setIsPlaying(true);
  };

  const pause = () => {
    setIsPlaying(false);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack?.source}
        onEnded={hasNextTrack ? skipForward : undefined}
      />

      <div className="flex items-center justify-between w-full mx-4">
        <div className="flex items-center space-x-4 text-sm font-semibold">
          <div className="relative w-12 h-12">
            <Image src="/vercel.svg" fill alt="cover" />
          </div>

          <div className="flex flex-col">
            <p className="truncate">{currentTrack?.title}</p>
            <p className="truncate">{currentTrack?.artist}</p>
          </div>
        </div>

        <div className="flex space-x-2 mr-4">
          <Button size="sm" disabled={!hasPreviousTrack} onClick={skipBackward}>
            <SkipBackwardIcon />
          </Button>

          {isPlaying ? (
            <Button size="sm" onClick={pause}>
              <PauseIcon />
            </Button>
          ) : (
            <Button size="sm" onClick={play}>
              <PlayIcon />
            </Button>
          )}

          <Button size="sm" disabled={!hasNextTrack} onClick={skipForward}>
            <SkipForwardIcon />
          </Button>
        </div>
      </div>
    </>
  );
};
