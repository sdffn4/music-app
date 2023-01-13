import { useRef } from "react";
import type { ReactNode } from "react";
import {
  PauseIcon,
  PlayIcon,
  SkipBackwardIcon,
  SkipForwardIcon,
} from "./icons/player";

interface IPlayerButton {
  icon: ReactNode;

  onClick?: () => void;
}

const PlayerButton: React.FC<IPlayerButton> = ({ icon, onClick }) => {
  return <button onClick={onClick}>{icon}</button>;
};

const Player: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const onSkipBackward = () => {};

  const onSkipForward = () => {};

  const onPause = () => {};

  const onPlay = () => {};

  const onEnded = () => {};

  return (
    <>
      <div className="flex border-b border-white border-opacity-10 py-1">
        <div className="flex basis-3/5 items-center truncate">
          <audio ref={audioRef} src={undefined} onEnded={onEnded} />

          <img className="w-12 h-12 bg-cyan-500 m-3 shrink-0" src={undefined} />

          <div className="flex flex-col truncate">
            <p className="truncate">{undefined}</p>
            <p className="truncate">{undefined}</p>
          </div>
        </div>

        <div className="flex basis-2/5 justify-center space-x-4">
          <PlayerButton icon={<SkipBackwardIcon />} onClick={onSkipBackward} />

          {false ? (
            <PlayerButton icon={<PauseIcon />} onClick={onPause} />
          ) : (
            <PlayerButton icon={<PlayIcon />} onClick={onPlay} />
          )}

          <PlayerButton icon={<SkipForwardIcon />} onClick={onSkipForward} />
        </div>
      </div>
    </>
  );
};

export default Player;
