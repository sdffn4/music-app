import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import {
  PauseIcon,
  PlayIcon,
  SkipBackwardIcon,
  SkipForwardIcon,
} from "./icons/player";
import usePlayerStore from "@/store";
import Image from "next/image";

interface IPlayerButton {
  icon: ReactNode;

  onClick?: () => void;
}

const PlayerButton: React.FC<IPlayerButton> = ({ icon, onClick }) => {
  return <button onClick={onClick}>{icon}</button>;
};

const Player: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const { isPlaying, queue, setIsPlaying, skipBackward, skipForward } =
    usePlayerStore((state) => state);

  const currentInstance = queue.instances[queue.index];
  const currentTrack = currentInstance?.track;

  const hasPrevTrack = queue.instances[queue.index - 1];
  const hasNextTrack = queue.instances[queue.index + 1];

  const onSkipBackward = () => {
    if (hasPrevTrack) skipBackward();
  };

  const onSkipForward = () => {
    if (hasNextTrack) skipForward();
  };

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

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    if (hasNextTrack) skipForward();
  };

  return (
    <>
      <div className="flex border-b border-white border-opacity-10 py-1">
        <div className="flex basis-3/5 items-center truncate">
          <audio
            ref={audioRef}
            src={currentTrack?.source}
            onEnded={handleEnded}
          />

          <div className="w-12 h-12 m-3 shrink-0 relative">
            <Image fill={true} alt="cover" src={"/vercel.svg"} />
          </div>

          <div className="flex flex-col truncate">
            <p className="truncate">{currentTrack?.title}</p>
            <p className="truncate">{currentTrack?.artist}</p>
          </div>
        </div>

        <div className="flex basis-2/5 justify-center space-x-4">
          <PlayerButton icon={<SkipBackwardIcon />} onClick={onSkipBackward} />

          {isPlaying ? (
            <PlayerButton icon={<PauseIcon />} onClick={handlePause} />
          ) : (
            <PlayerButton icon={<PlayIcon />} onClick={handlePlay} />
          )}

          <PlayerButton icon={<SkipForwardIcon />} onClick={onSkipForward} />
        </div>
      </div>
    </>
  );
};

export default Player;
