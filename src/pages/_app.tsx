import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import usePlayerStore from "@/store";
import { SessionProvider } from "next-auth/react";
import {
  QueryClient,
  QueryClientProvider,
  Hydrate,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Theme } from "react-daisyui";
import * as Slider from "@radix-ui/react-slider";
import { menuButtons } from "../components/icons/menu";
import {
  SpeakerLoudIcon,
  SpeakerModerateIcon,
  SpeakerOffIcon,
  SpeakerQuietIcon,
  TrackNextIcon,
  TrackPreviousIcon,
  PauseIcon,
  PlayIcon,
} from "@radix-ui/react-icons";

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

const BottomNavigation: React.FC = () => {
  const { pathname, push } = useRouter();

  const audioRef = useRef<HTMLAudioElement>(null);

  const [volume, setVolume] = useState(20);
  const [currentTime, setCurrentTime] = useState(0);

  if (audioRef.current) audioRef.current.volume = volume / 100;

  const { isPlaying, setIsPlaying, queue, skipBackward, skipForward } =
    usePlayerStore((state) => state);

  const currentInstance = queue.instances[queue.index];
  const currentTrack = currentInstance?.track;

  const hasPreviousTrack = Boolean(queue.instances[queue.index - 1]);
  const hasNextTrack = Boolean(queue.instances[queue.index + 1]);

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

  const onCurrentTimeChange = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      const thisCurrentTime = Math.round(audioRef.current.currentTime);
      if (currentTime !== thisCurrentTime) setCurrentTime(thisCurrentTime);
    }
  };

  const onEmptied = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);

      if (isPlaying) audioRef.current.play();
      else audioRef.current.pause();
    }
  };

  const onEnded = () => {
    if (hasNextTrack) skipForward();
  };

  return (
    <>
      <div className="sticky bottom-0 bg-slate-200 bg-opacity-60 backdrop-blur-lg">
        <div className="flex items-center justify-center mx-2">
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5 hover:cursor-pointer"
            value={[currentTime]}
            max={
              currentTrack?.duration ? Math.round(currentTrack.duration) : 100
            }
            onValueChange={([value]) => onCurrentTimeChange(value)}
          >
            <Slider.Track className="bg-blackA10 relative grow rounded-full h-[3px]">
              <Slider.Range className="absolute bg-white rounded-full h-full border border-neutral-300" />
            </Slider.Track>

            <Slider.Thumb className="block w-3 h-3 bg-white shadow-[0_2px_10px] shadow-neutral-800 rounded-lg hover:bg-violet3 focus:outline-none" />
          </Slider.Root>
        </div>

        <div className="flex gap-4 border-y border-neutral-400 border-opacity-40">
          <div className="flex w-1/2 gap-1 sm:w-1/3">
            <div className="relative m-1 h-14 w-14">
              <Image src={"/vercel.svg"} alt="cover" fill />
            </div>

            <div className="min-w-0 self-center">
              <p className="truncate text-sm font-medium">
                {currentTrack?.title ?? "No track is set"}
              </p>

              <p className="truncate text-xs">
                {currentTrack?.artist ?? "No track is set"}
              </p>
            </div>
          </div>

          <div className="flex w-1/2 items-center justify-end gap-2 px-4 sm:w-1/3 sm:justify-center">
            <button
              className="inline-flex flex-shrink-0 h-8 w-8 cursor-default items-center justify-center rounded-full shadow-2xl outline-none hover:cursor-pointer"
              onClick={skipBackward}
              disabled={!hasPreviousTrack}
            >
              <TrackPreviousIcon />
            </button>

            <button
              className="inline-flex flex-shrink-0 h-9 w-9 cursor-default items-center justify-center rounded-full shadow-2xl outline-none hover:cursor-pointer"
              onClick={
                isPlaying ? () => setIsPlaying(false) : () => setIsPlaying(true)
              }
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            <button
              className="inline-flex flex-shrink-0 h-8 w-8 cursor-default items-center justify-center rounded-full shadow-2xl outline-none hover:cursor-pointer"
              onClick={skipForward}
              disabled={!hasNextTrack}
            >
              <TrackNextIcon />
            </button>
          </div>

          <div className="hidden px-4 sm:flex sm:w-1/3 sm:items-center sm:justify-end sm:gap-4">
            <button
              className="inline-flex h-7 w-7 cursor-default items-center justify-center rounded-full outline-none hover:cursor-pointer"
              onClick={onVolumeClick}
            >
              {volume === 0 ? (
                <SpeakerOffIcon />
              ) : volume < 33 ? (
                <SpeakerQuietIcon />
              ) : volume > 33 && volume < 66 ? (
                <SpeakerModerateIcon />
              ) : (
                <SpeakerLoudIcon />
              )}
            </button>

            <Slider.Root
              className="relative flex items-center select-none touch-none w-32 h-5 hover:cursor-pointer"
              value={[volume]}
              max={100}
              onValueChange={([value]) => onVolumeChange(value)}
            >
              <Slider.Track className="bg-blackA10 relative grow rounded-full h-[3px]">
                <Slider.Range className="absolute bg-white rounded-full h-full border border-neutral-300" />
              </Slider.Track>

              <Slider.Thumb className="block w-3 h-3 bg-white shadow-[0_2px_10px] shadow-neutral-800 rounded-lg hover:bg-violet3 focus:outline-none" />
            </Slider.Root>
          </div>
        </div>

        <div className="flex items-center justify-around">
          {menuButtons.map((button) => (
            <button
              key={button.href}
              onClick={
                pathname !== button.href ? () => push(button.href) : undefined
              }
              className={`w-full flex items-center justify-center p-4 hover:bg-violet-200 ${
                pathname === button.href ? "bg-violet-200" : null
              }`}
            >
              {button.icon}
            </button>
          ))}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentTrack?.source}
        onEmptied={onEmptied}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
      />
    </>
  );
};
