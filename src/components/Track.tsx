import { EllipsisIcon } from "./icons";

interface ITrack {
  index: number;
  isActive: boolean;
  dominantColor?: string;
  title: string;
  onClick: () => void;
}

const Track: React.FC<ITrack> = ({
  index,
  isActive,
  dominantColor,
  title,
  onClick,
}) => {
  return (
    <div className="flex overflow-auto justify-between py-2">
      <div className="flex truncate justify-center items-center">
        <p className="text-xs px-4 opacity-60 ">{index}</p>

        <p
          className="flex truncate items-baseline hover:cursor-pointer"
          style={
            isActive ? { color: dominantColor, fontWeight: "bold" } : undefined
          }
          onClick={onClick}
        >
          {title}
        </p>

        {/* <div className="flex-1 truncate" onClick={onClick}>
          {feat ? (
            <p className="font-light pl-1 opacity-60">feat. {feat}</p>
          ) : null}
        </div> */}
      </div>

      <div className="flex justify-end items-center">
        <button className=" px-4">
          <EllipsisIcon />
        </button>
      </div>
    </div>
  );
};

export default Track;
