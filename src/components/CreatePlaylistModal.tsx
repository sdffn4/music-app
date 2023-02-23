import { useEffect, useRef, useState } from "react";
import { Button, Input, Mask, Modal } from "react-daisyui";

interface CreatePlaylistModalProps {
  visible: boolean;
  toggleVisible: () => void;

  isLoading: boolean;
  createPlaylist: (title: string, imageFile?: File) => void;
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  visible,
  toggleVisible,
  isLoading,
  createPlaylist,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState<string>("");

  const [preview, setPreview] = useState<string>("");
  const [file, setFile] = useState<File | undefined>();

  useEffect(() => {
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const chooseFile = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0].type.startsWith("image")) {
      setFile(e.target.files[0]);
    }
  };

  const create = () => {
    setFile(undefined);
    setTitle("");

    createPlaylist(title, file);
  };

  return (
    <Modal open={visible} onClickBackdrop={toggleVisible}>
      <Modal.Body className="flex justify-around items-center space-x-4">
        <Mask
          variant="square"
          className="w-24 h-24 border border-primary hover:cursor-pointer"
          src={preview ? preview : "/next.svg"}
          alt="image"
          onClick={chooseFile}
        />

        <input
          className="hidden"
          type="file"
          ref={inputRef}
          accept="image/*"
          onChange={uploadFile}
        />

        <div className="form-control w-full max-w-xs">
          <label className="label pt-0">
            <span className="label-text">{"What's the playlist title?"}</span>
          </label>
          <Input
            size="sm"
            color="primary"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </Modal.Body>

      <Modal.Actions>
        <Button
          size="sm"
          color="primary"
          onClick={create}
          loading={isLoading}
          disabled={isLoading}
        >
          Create
        </Button>
        <Button
          size="sm"
          color="ghost"
          onClick={toggleVisible}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default CreatePlaylistModal;
