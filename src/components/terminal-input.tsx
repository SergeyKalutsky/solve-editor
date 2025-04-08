import React, { useState, useRef, useEffect } from "react";

interface Props {
	inputHint: string;
	setInputValue: (value: string) => void;
	index: number;
	activeInputIndex: number;
}

const TerminalInput: React.FC<Props> = ({ inputHint, setInputValue, index, activeInputIndex }) => {
	const [componentInputValue, setComponentInputValue] = useState<string>("");
	const inputRef = useRef<HTMLInputElement>(null);

	const isActive = index === activeInputIndex;

	useEffect(() => {
		if (isActive && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isActive]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			const value = (e.target as HTMLInputElement).value;
			setComponentInputValue(value);

			setInputValue(value);
		}
	};

	return (
		<div className="flex">
			<span className="text-white">
				{">>>"} {inputHint}:{" "}
			</span>
			{isActive ? (
				<input
					ref={inputRef}
					onKeyDown={handleKeyDown}
					className="bg-transparent w-1/3 text-white ps-1"
					defaultValue={componentInputValue}
				/>
			) : (
				<span className="text-white">{componentInputValue}</span>
			)}
		</div>
	);
};

export default TerminalInput;
