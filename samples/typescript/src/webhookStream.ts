import { EventEmitter } from "node:events";

class WebhookStream extends EventEmitter {
  private replayBuffer: string[] = [];
  private maxReplay = 10;

  addEvent(event: string) {
    this.replayBuffer.push(event);
    if (this.replayBuffer.length > this.maxReplay) {
      this.replayBuffer.shift();
    }
    this.emit("event", event);
  }

  getReplayEvents(): string[] {
    return [...this.replayBuffer];
  }
}

export const webhookStream = new WebhookStream();
