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
    <div className="font-semibold text-lg">
      <input
        className="text-violet11 shadow-violet7 focus:shadow-violet8 text-center inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px] hover:cursor-pointer focus:cursor-text"
        type="text"
        value={inputValue}
        onFocus={(e) => e.target.select()}
        onBlur={onBlur}
        onChange={(e) => setInputValue(e.target.value)}
      />
    </div>
  );
};

export default ChangeableInput;
