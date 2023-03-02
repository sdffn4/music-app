import Image from "next/image";

interface PlaylistCardProps {
  cover: string;
  title: string;
  tracks: number;
  duration: number;
  subscriptions: number;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({
  cover,
  title,
  tracks,
  duration,
  subscriptions,
}) => {
  return (
    <div className="flex m-3 max-w-sm shadow-lg border border-primary border-opacity-50">
      <div className="w-28 h-28 relative border-r border-primary border-opacity-50">
        <Image src={cover ? cover : "./vercel.svg"} alt={cover} fill />
      </div>

      <div className="hidden sm:flex sm:flex-col sm:justify-evenly sm:p-3">
        <p className="font-semibold text-lg">{title}</p>
        <div className="space-x-3 text-sm opacity-80">
          <span>{`${tracks} track${tracks === 1 ? "" : "s"}`}</span>
          <span>{`${duration} minute${duration === 1 ? "" : "s"}`}</span>
          <span>{`${subscriptions} subscriber${
            subscriptions === 1 ? "" : "s"
          }`}</span>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;
