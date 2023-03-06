import { ChangeEvent, useRef, useState } from "react";

interface ChangeableInputProps {
  text: string;
  callback: (value: string) => void;
}

const ChangeableInput: React.FC<ChangeableInputProps> = ({
  text,
  callback,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [inputValue, setInputValue] = useState(text);
  const [editMode, setEditMode] = useState(false);

  const onBlur = () => {
    setEditMode(false);
    if (inputRef.current) callback(inputRef.current.value);
  };

  return (
    <div className="font-semibold text-lg">
      {editMode ? (
        <input
          autoFocus
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={(e) => e.target.select()}
          onBlur={onBlur}
          className="outline-0 text-center focus:bg-primary focus:bg-opacity-60 rounded-full"
        />
      ) : (
        <p
          className="hover:cursor-pointer hover:bg-primary hover:bg-opacity-60 rounded-full px-3"
          onClick={() => setEditMode((previous) => !previous)}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default ChangeableInput;
