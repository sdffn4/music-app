import { useRef } from "react";
import * as Avatar from "@radix-ui/react-avatar";

interface ChangeableImageProps {
  src: string;
  alt: string;
  callback: (file: File) => void;
}

const ChangeableImage: React.FC<ChangeableImageProps> = ({
  src,
  alt,
  callback,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const chooseFile = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0].type.startsWith("image")) {
      callback(e.target.files[0]);
    }
  };

  return (
    <div>
      <Avatar.Root
        className="bg-blackA3 inline-flex h-44 w-h-44 select-none items-center justify-center overflow-hidden rounded-full align-middle hover:cursor-pointer"
        onClick={chooseFile}
      >
        <Avatar.Image
          className="h-full w-full rounded-[inherit] object-cover"
          src={src}
          alt={alt}
        />
        <Avatar.Fallback
          className="text-violet11 leading-1 flex h-full w-full items-center justify-center bg-white text-[15px] font-medium"
          delayMs={600}
        >
          UI
        </Avatar.Fallback>
      </Avatar.Root>

      <input
        type="file"
        className="hidden"
        ref={inputRef}
        onChange={uploadFile}
        accept="image/*"
      />
    </div>
  );
};

export default ChangeableImage;
