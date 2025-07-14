/**
 * Video Event Bus
 * 
 * A simple pub/sub event system for video player control across components
 * without direct references or complex context dependencies.
 */

type EventCallback<T> = (data: T) => void;

export enum VideoEventType {
  SEEK_TO = 'SEEK_TO',
  PLAY = 'PLAY',
  PAUSE = 'PAUSE'
}

interface SeekToEvent {
  time: number;
  lessonId: string;
}

interface PlayEvent {
  lessonId: string;
}

interface PauseEvent {
  lessonId: string;
}

type EventMap = {
  [VideoEventType.SEEK_TO]: SeekToEvent;
  [VideoEventType.PLAY]: PlayEvent;
  [VideoEventType.PAUSE]: PauseEvent;
}

class VideoEventBus {
  private eventListeners: {
    [K in keyof EventMap]?: Array<EventCallback<EventMap[K]>>;
  } = {};

  /**
   * Dispatch an event to all registered listeners
   */
  public dispatch<K extends keyof EventMap>(type: K, data: EventMap[K]): void {
    const listeners = this.eventListeners[type];
    if (listeners) {
      for (const callback of listeners) callback(data);
    }
  }

  /**
   * Subscribe to an event
   * @returns Unsubscribe function
   */
  public subscribe<K extends keyof EventMap>(
    type: K,
    callback: EventCallback<EventMap[K]>
  ): () => void {
    if (!this.eventListeners[type]) {
      this.eventListeners[type] = [];
    }

    this.eventListeners[type]!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners[type];
      if (!listeners) return;
      
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  }

  public clear(): void {
    this.eventListeners = {};
  }
}

// Create a singleton instance
export const videoEventBus = new VideoEventBus(); 