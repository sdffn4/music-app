import { ChangeEvent, useRef, useState } from "react";

interface ChangeableInputProps {
  text: string;
  callback: (value: string) => void;
}

const ChangeableInput: React.FC<ChangeableInputProps> = ({
  text,
  callback,
}) => {
  const [inputValue, setInputValue] = useState(text);

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    callback(e.target.value);
  };

  return (
    <input
      className="m-2 text-center self-center rounded-lg font-medium bg-white py-2 shadow-[0_2px_10px] appearance-none leading-none focus:shadow-[0_0_0_2px_black] shadow-neutral-800 outline-none"
      type="text"
      value={inputValue}
      onFocus={(e) => e.target.select()}
      onBlur={onBlur}
      onChange={(e) => setInputValue(e.target.value)}
    />
  );
};

export default ChangeableInput;
