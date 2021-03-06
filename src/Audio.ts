import { Name, AudioQuality, Lang } from '@friends-library/types';
import Edition from './Edition';
import AudioPart from './AudioPart';
import { AudioData } from './types';

export default class Audio {
  private _edition?: Edition;
  public parts: AudioPart[] = [];

  public static humanDuration(
    partDurations: number[],
    style: 'clock' | 'abbrev' = `clock`,
    lang: Lang = `en`,
  ): string {
    const units = Audio.durationUnits(partDurations);
    if (style === `abbrev`) {
      const [hours, minutes] = units;
      let duration = minutes === 0 ? `` : ` ${minutes} min`;
      if (hours > 0) {
        duration = `${hours} ${lang === `en` ? `hr` : `h`}${duration}`;
      }
      return duration.trim();
    }

    return units
      .filter((num, idx, parts) =>
        num !== 0 ? true : parts.slice(idx + 1).every((part) => part === 0),
      )
      .map(String)
      .map((part) => part.padStart(2, `0`))
      .join(`:`)
      .replace(/^0/, ``);
  }

  public static durationUnits(
    partDurations: number[],
  ): [hours: number, minutes: number, seconds: number] {
    const totalSeconds = Math.floor(partDurations.reduce((x, y) => x + y));
    const hours = Math.floor(totalSeconds / (60 * 60));
    const minutes = Math.floor((totalSeconds - hours * 60 * 60) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds];
  }

  public constructor(private data: Omit<AudioData, 'parts'>) {}

  public set edition(edition: Edition) {
    this._edition = edition;
  }

  public get edition(): Edition {
    if (!this._edition) throw new Error(`Edition not set`);
    return this._edition;
  }

  public get reader(): Name {
    return this.data.reader;
  }

  public get complete(): boolean {
    return !this.data.incomplete;
  }

  public get m4bFilenameHq(): string {
    return this.m4bFilenameLq.replace(/--lq\.m4b$/, `.m4b`);
  }

  public get m4bFilenameLq(): string {
    return `${this.edition.document.filenameBase}--lq.m4b`;
  }

  public get m4bFilepathLq(): string {
    return `${this.edition.path}/${this.m4bFilenameLq}`;
  }

  public get m4bFilepathHq(): string {
    return `${this.edition.path}/${this.m4bFilenameHq}`;
  }

  public get zipFilenameHq(): string {
    return this.zipFilenameLq.replace(/--lq\.zip$/, `.zip`);
  }

  public get zipFilenameLq(): string {
    return `${this.edition.document.filenameBase}--mp3s--lq.zip`;
  }

  public get zipFilepathLq(): string {
    return `${this.edition.path}/${this.zipFilenameLq}`;
  }

  public get zipFilepathHq(): string {
    return `${this.edition.path}/${this.zipFilenameHq}`;
  }

  public get externalPlaylistId(): number | undefined {
    return this.data.external_playlist_id_hq;
  }

  public get externalPlaylistIdHq(): number | undefined {
    return this.externalPlaylistId;
  }

  public get externalPlaylistIdLq(): number | undefined {
    return this.data.external_playlist_id_lq;
  }

  public audiobookFilename(quality: AudioQuality): string {
    let filename = this.edition.document.filenameBase;
    if (quality === `LQ`) {
      filename += `--lq`;
    }
    return `${filename}.m4b`;
  }

  public audiobookFilepath(quality: AudioQuality): string {
    return `${this.edition.path}/${this.audiobookFilename(quality)}`;
  }

  public partFilename(index: number, quality: AudioQuality): string {
    let filename = this.edition.document.filenameBase;
    if (this.parts.length > 1) {
      filename += `--pt${index + 1}`;
    }
    if (quality === `LQ`) {
      filename += `--lq`;
    }
    return `${filename}.mp3`;
  }

  public partFilepath(index: number, quality: AudioQuality): string {
    return `${this.edition.path}/${this.partFilename(index, quality)}`;
  }

  public podcastRelFilepath(quality: AudioQuality): string {
    let path = this.edition.path.replace(/^(en|es)\//, `/`);
    if (quality === `LQ`) path += `/lq`;
    return `${path}/podcast.rss`;
  }

  public get added(): Date {
    return this.data.added;
  }

  public toJSON(): Omit<
    Audio,
    | 'edition'
    | 'partFilename'
    | 'partFilepath'
    | 'audiobookFilename'
    | 'audiobookFilepath'
    | 'podcastRelFilepath'
    | 'toJSON'
  > {
    return {
      reader: this.reader,
      parts: this.parts,
      complete: this.complete,
      externalPlaylistId: this.externalPlaylistId,
      externalPlaylistIdHq: this.externalPlaylistIdHq,
      externalPlaylistIdLq: this.externalPlaylistIdLq,
      zipFilenameHq: this.zipFilenameHq,
      zipFilepathHq: this.zipFilepathHq,
      zipFilenameLq: this.zipFilenameLq,
      zipFilepathLq: this.zipFilepathLq,
      m4bFilenameLq: this.m4bFilenameLq,
      m4bFilenameHq: this.m4bFilenameHq,
      m4bFilepathLq: this.m4bFilepathLq,
      m4bFilepathHq: this.m4bFilepathHq,
      added: this.added,
    };
  }
}
