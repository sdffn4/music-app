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
    if (
      e.target.files &&
      e.target.files.length > 0 &&
      e.target.files[0].type.startsWith("image")
    ) {
      callback(e.target.files[0]);
    }
  };

  return (
    <>
      <Avatar.Root
        className="inline-flex h-44 w-h-44 select-none items-center justify-center overflow-hidden rounded-full align-middle hover:cursor-pointer"
        onClick={chooseFile}
      >
        <Avatar.Image
          className="m-6 h-36 w-36 rounded-[inherit] object-fill shadow-[0_2px_10px]"
          src={src}
          alt={alt}
        />
      </Avatar.Root>

      <input
        type="file"
        className="hidden"
        ref={inputRef}
        onChange={uploadFile}
        accept="image/*"
      />
    </>
  );
};

export default ChangeableImage;
