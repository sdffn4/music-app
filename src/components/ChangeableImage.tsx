import Image from "next/image";
import { useRef } from "react";

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
      <div
        className="w-32 h-32 relative hover:cursor-pointer border border-primary border-opacity-60"
        onClick={chooseFile}
      >
        <Image fill src={src} alt={alt} />
      </div>

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
