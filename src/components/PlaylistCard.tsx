import Image from "next/image";

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
        <div className="hidden sm:flex sm:flex-col sm:justify-evenly sm:m-3 truncate">
          <p className="font-semibold text-lg truncate">{title}</p>
          <div className="space-x-3 text-sm opacity-80">
            <span>{`${tracks} track${tracks === 1 ? "" : "s"}`}</span>
            <span>{`${duration} minute${duration === 1 ? "" : "s"}`}</span>
            <span>{`${subscribers} subscriber${
              subscribers === 1 ? "" : "s"
            }`}</span>
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
