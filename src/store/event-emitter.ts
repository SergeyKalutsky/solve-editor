import { create } from 'zustand'

type EventCallback = (data: any) => void;

interface EventEmitterState {
  events: Record<string, EventCallback[]>;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: EventCallback) => void;
  off: (event: string, callback: EventCallback) => void;
}

const eventEmitter = create<EventEmitterState>(set => ({
  events: {},
  emit: (event, data) => set(state => {
    const callbacks = state.events[event];
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
    state.events[event] = [];
    return state; 
  }),
  on: (event, callback) => set(state => {
    if (!state.events[event]) {
      state.events[event] = [];
    }
    state.events[event].push(callback);
    return state; 
  }),
  off: (event, callback) => set(state => {
    const callbacks = state.events[event];
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
    state.events[event] = callbacks
    return state; 
  }),
}));

export default eventEmitter;