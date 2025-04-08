import { create } from "zustand";

interface Diff {
    correct: string;
    wrong: string;
}

interface OutputHelper {
    diffs: Diff[];
}

interface BaseOutput {
    type: "input" | "output" | "error" | "solutionCheck";
}

interface terminalOutStandard extends BaseOutput {
    type: "input" | "output" | "error";
    content?: string;
}

interface terminalOutCheck extends BaseOutput {
    type: "solutionCheck";
    content: OutputHelper[];
}

type terminalOut = terminalOutStandard | terminalOutCheck;

interface AppState {
    terminalOut: terminalOut[];
    code: string;
    description: string;
    solution: string;
    isRunning: boolean;
    stateChanged: boolean;
    setStateChanged: (stateChanged: boolean) => void;
    setTerminalOutput: (output: terminalOut) => void;
    setDescription: (description: string) => void;
    setSolution: (solution: string) => void;
    setCode: (code: string) => void;
    setIsRunning: (isRunning: boolean) => void;
    clearTerminal: () => void;
}

const appState = create<AppState>(set => ({
    terminalOut: [],
    code: "",
    description: "",
    solution: "",
    isRunning: false,
    stateChanged: false,
    setStateChanged: (stateChanged: boolean) => set(state => {
        state.stateChanged = stateChanged;
        return state;
    }),
    setTerminalOutput: (output: terminalOut) => set(state => {
        state.terminalOut.push(output);
        return state;
    }),
    setDescription: (description: string) => set(state => {
        state.description = description;
        return state;
    }),
    setSolution: (solution: string) => set(state => {
        state.solution = solution;
        return state;
    }),
    setCode: (code: string) => set(state => {
        state.code = code;
        return state;
    }),
    setIsRunning: (isRunning: boolean) => set(state => {
        state.isRunning = isRunning;
        return state;
    }),
    clearTerminal: () => set(state => {
        state.terminalOut = [];
        return state;
    }),
}));

export default appState;