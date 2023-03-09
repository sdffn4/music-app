import { formatDuration } from "@/lib/utils";
import Image from "next/image";
import { NoteIcon, TimerIcon, UserIcon } from "./icons";

interface PlaylistCardProps {
  cover: string;
  title: string;
  tracks: number;
  duration: number;
  subscribers: number;

  dropdown?: React.ReactNode;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({
  cover,
  title,
  tracks,
  duration,
  subscribers,
  dropdown,
}) => {
  return (
    <div className="flex m-3 sm:w-[28rem] shadow-lg border border-primary border-opacity-50">
      <div className="w-28 h-28 relative border-r border-primary border-opacity-50 shrink-0">
        <Image src={cover ? cover : "./vercel.svg"} alt={cover} fill />
      </div>

      <div className="w-full flex justify-between">
        <div className="hidden sm:w-full sm:flex sm:flex-col sm:justify-evenly sm:m-3">
          <p className="font-semibold text-lg">{title}</p>
          <div className="flex space-x-3 text-sm opacity-80">
            <span className="flex items-center space-x-1">
              <NoteIcon /> <span>{tracks}</span>
            </span>
            <span className="flex items-center space-x-1">
              <TimerIcon /> <span>{formatDuration(duration)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <UserIcon /> <span>{subscribers}</span>
            </span>
          </div>
        </div>

        {dropdown ? (
          <div className="hidden sm:block sm:self-center">{dropdown}</div>
        ) : null}
      </div>
    </div>
  );
};

export default PlaylistCard;
