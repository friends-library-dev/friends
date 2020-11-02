import Audio from './Audio';
import { AudioPartData } from './types';

export default class AudioPart {
  private _audio?: Audio;

  public constructor(private data: AudioPartData) {}

  public set audio(audio: Audio) {
    this._audio = audio;
  }

  public get audio(): Audio {
    if (!this._audio) throw new Error(`Audio not set.`);
    return this._audio;
  }

  public get title(): string {
    return this.data.title;
  }
  public get externalIdHq(): number {
    return this.data.external_id_hq;
  }

  public get externalIdLq(): number {
    return this.data.external_id_lq;
  }

  public get chapters(): number[] {
    return this.data.chapters;
  }

  public toJSON(): Omit<AudioPart, 'audio' | 'toJSON'> {
    return {
      externalIdHq: this.externalIdHq,
      externalIdLq: this.externalIdLq,
      title: this.title,
      chapters: this.chapters,
    };
  }
}
