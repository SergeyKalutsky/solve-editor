import React, { useRef, useEffect, useState, JSX } from "react";
import ToggleBar from "./toggle-bar";
import appState from "../store";
import TerminalInput from "./terminal-input.tsx";
import eventEmitter from "../store/event-emitter";
import { useShallow } from "zustand/react/shallow";
import ClearIcon from "../../assets/clear-white.svg";

interface TerminalProps {
	terminalOpen: boolean;
	codeRunning: boolean;
	setTerminalOpen: React.Dispatch<React.SetStateAction<boolean>>;
	taskId: number;
	terminalOnly?: boolean;
	className?: string
}

interface Input {
	id: number;
	value: string;
	hint: string;
	isSubmitted: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ terminalOpen, codeRunning, setTerminalOpen, taskId, terminalOnly, className }) => {
	const resizeRef = useRef<HTMLDivElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const terminalOutputRaw = appState(useShallow((state) => state.terminalOut));
	const clearTerminal = appState(useShallow((state) => state.clearTerminal));
	const [inputs, setInputs] = useState<Input[]>([]);
	const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);

	const [terminalHistory, setTerminalHistory] = useState<{ type: string; content?: any }[]>([]);

	const lastOutputIndexRef = useRef(0);
	useEffect(() => {
		const newOutputs = terminalOutputRaw.slice(lastOutputIndexRef.current);
		if (newOutputs.length > 0) {
			const outputsToAdd = newOutputs.filter((output) => output.type !== "input");
			if (outputsToAdd.length > 0) {
				setTerminalHistory((prevHistory) => [...prevHistory, ...outputsToAdd]);
			}
			lastOutputIndexRef.current = terminalOutputRaw.length;
		}
	}, [terminalOutputRaw]);

	useEffect(() => {
		if (codeRunning) {
			const lastOutput = terminalOutputRaw[terminalOutputRaw.length - 1];
			const hint = (lastOutput?.content ?? "") as string;
			if (lastOutput?.type === "input") {
				setInputs([{ id: 0, value: "", hint, isSubmitted: false }]);
				setActiveInputIndex(0);
			}
		} else {
			setInputs([]);
			setActiveInputIndex(null);
		}
	}, [codeRunning, terminalOutputRaw]);

	useEffect(() => {
		setTerminalHistory([]);
		setInputs([]);
		lastOutputIndexRef.current = 0;
		clearTerminal();
	}, [taskId]);

	const handleInputSubmit = (inputId: number, value: string) => {
		setInputs((prevInputs) => prevInputs.map((input) => (input.id === inputId ? { ...input, value, isSubmitted: true } : input)));

		const inputHint = inputs.find((input) => input.id === inputId)?.hint ?? "";

		setTerminalHistory((prevHistory) => [...prevHistory, { type: "userInputWithHint", content: { hint: inputHint, value } }]);

		eventEmitter.getState().emit("terminalInput", value);

		if (codeRunning) {
			const lastOutput = terminalOutputRaw[terminalOutputRaw.length - 1];
			const hint = Array.isArray(lastOutput?.content) ? lastOutput.content.join("\n") : lastOutput?.content ?? "";

			const nextInputId = inputId + 1;
			setInputs((prevInputs) => [...prevInputs, { id: nextInputId, value: "", hint, isSubmitted: false }]);
			setActiveInputIndex(nextInputId);
		}
	};

	const wrapOutput = (output: JSX.Element, error: boolean = false) => {
		return (
			<span key={Math.random().toString(36).slice(2, 9)} className={error ? "text-red-500" : ""}>
				{output}
			</span>
		);
	};

	useEffect(() => {
		const scrollToBottom = () => {
			if (scrollRef.current) {
				scrollRef.current.scrollIntoView({
					behavior: "smooth",
					block: "end",
					inline: "nearest",
				});
			}
		};
		scrollToBottom();
	}, [terminalHistory, inputs]);

	useEffect(() => {
		if (terminalOnly) return;
		if (terminalOpen && resizeRef.current && resizeRef.current.clientHeight === 0) {
			resizeRef.current.style.setProperty("height", "50%");
		}
	}, [terminalOpen]);

	const handleToggle = (e: React.MouseEvent) => {
		const startY = e.clientY;
		const startHeight = resizeRef.current?.getBoundingClientRect().height || 0;
		const onMouseMove = (evt: MouseEvent) => {
			const dy = evt.clientY - startY;
			const newHeight = startHeight - dy;
			if (resizeRef.current) {
				const minHeight = 100;
				const maxHeight = window.innerHeight - 65;
				if (newHeight >= minHeight && newHeight <= maxHeight) {
					resizeRef.current.style.height = `${newHeight}px`;
				} else if (newHeight < minHeight) {
					resizeRef.current.style.height = `100px`;
					setTerminalOpen(false);
				}
			}
		};

		const onMouseUp = () => {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		};

		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
	};

	const renderTerminalHistory = () => {
		return terminalHistory.map((item, index) => {
			if (item.type === "error") {
				return wrapOutput(
					<p key={index} className={`${terminalOnly ? "text-lg" : "text-sm"}`}>
						{item.content || "No content"}
					</p>,
					true
				);
			} else if (item.type === "solutionCheck") {
				return (
					<>
						{item.content.map((line: any) => (
							<p key={Math.random().toString(36).slice(2, 9)}>
								{line.diffs.map((diff: any) => (
									<span key={Math.random().toString(36).slice(2, 9)}>
										<span style={{ color: "green" }}>{diff.correct}</span>
										<span style={{ color: "red" }}>{diff.wrong === " " ? "_" : diff.wrong}</span>
									</span>
								))}
							</p>
						))}
					</>
				);
			} else if (item.type === "userInputWithHint") {
				return (
					<div key={index} className="flex items-center">
						<span className="mr-2 text-sm">{">>> " + item.content.hint + ":"}</span>
						<span className="text-sm">{item.content.value}</span>
					</div>
				);
			} else {
				return (
					<>
						{item.content
							?.split("\n")
							.filter((line: string) => line.length > 0)
							.map((line: string) =>
								wrapOutput(
									<p key={Math.random().toString(36).slice(2, 9)} className={`${terminalOnly ? "text-lg" : "text-sm"}`}>
										{">>> " + line}
									</p>,
									false
								)
							)}
					</>
				);
			}
		});
	};

	const handleClearTerminal = () => {
		clearTerminal();
		setTerminalHistory([]);
		setInputs([]);
		lastOutputIndexRef.current = 0;
	};

	return (
		<div ref={resizeRef} className={`${terminalOnly ? "h-full" : "h-1/2"} w-full text-start bg-stone-950 flex flex-col overflow-y-auto ${className}`}>
			{!terminalOnly && <ToggleBar horisontal={true} handleToggle={handleToggle} />}
			{!terminalOnly && <img onClick={handleClearTerminal} src={ClearIcon} alt="clear" className="w-6 h-6 m-2 cursor-pointer" />}
			<div key={Math.random().toString(36).slice(2, 9)} className="h-full bg-stone-950 text-white flex flex-col p-2 overflow-y-auto">
				{renderTerminalHistory()}

				{inputs.map((input) => {
					if (!input.isSubmitted && input.id === activeInputIndex) {
						return (
							<TerminalInput
								key={input.id}
								index={input.id}
								activeInputIndex={activeInputIndex ?? -1}
								inputHint={input.hint}
								setInputValue={(value) => handleInputSubmit(input.id, value)}
							/>
						);
					} else {
						return null;
					}
				})}

				<div ref={scrollRef} className="mt-2" />
			</div>
		</div>
	);
};

export default React.memo(Terminal);
