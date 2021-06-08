import {
  ISBN,
  EditionType,
  ArtifactType,
  SquareCoverImageSize,
  ThreeDCoverImageWidth,
} from '@friends-library/types';
import Document from './Document';
import { EditionData } from './types';
import { Audio } from '.';

export default class Edition {
  private _document?: Document;
  public audio?: Audio;

  public constructor(private data: Omit<EditionData, 'audio'>) {}

  public set document(document: Document) {
    this._document = document;
  }

  public get document(): Document {
    if (!this._document) throw new Error(`Document not set`);
    return this._document;
  }

  public get path(): string {
    return `${this.document.path}/${this.type}`;
  }

  public get description(): string | undefined {
    return this.data.description;
  }

  public get editor(): string | undefined {
    return this.data.editor;
  }

  public get splits(): number[] | undefined {
    return this.data.splits;
  }

  public get type(): EditionType {
    return this.data.type;
  }

  public get isDraft(): boolean {
    return !!this.data.draft;
  }

  public get isbn(): ISBN {
    return this.data.isbn;
  }

  public filepath(type: ArtifactType, volumeNumber?: number): string {
    return `${this.path}/${this.filename(type, volumeNumber)}`;
  }

  public threeDCoverImageFilename(width: ThreeDCoverImageWidth): string {
    return `cover-3d--w${width}.png`;
  }

  public threeDCoverImagePath(width: ThreeDCoverImageWidth): string {
    return `${this.path}/images/${this.threeDCoverImageFilename(width)}`;
  }

  public squareCoverImageFilename(size: SquareCoverImageSize): string {
    return `cover--${size}x${size}.png`;
  }

  public squareCoverImagePath(size: SquareCoverImageSize): string {
    return `${this.path}/images/${this.squareCoverImageFilename(size)}`;
  }

  public filename(type: ArtifactType, volumeNumber?: number): string {
    const volSuffix = typeof volumeNumber === `number` ? `--v${volumeNumber}` : ``;
    switch (type) {
      case `epub`:
        return `${this.filenameBase}.epub`;
      case `mobi`:
        return `${this.filenameBase}.mobi`;
      case `web-pdf`:
        return `${this.filenameBase}.pdf`;
      case `paperback-interior`:
        return `${this.filenameBase}--(print)${volSuffix}.pdf`;
      case `paperback-cover`:
        return `${this.filenameBase}--cover${volSuffix}.pdf`;
      case `speech`:
        return `${this.filenameBase}.html`;
      case `app-ebook`:
        return `${this.filenameBase}--(app-ebook).html`;
    }
  }

  public get filenameBase(): string {
    return `${this.document.filenameBase}--${this.type}`;
  }

  public get paperbackCoverBlurb(): string {
    return (
      this.description || this.document.description || this.document.friend.description
    );
  }

  public get isMostModernized(): boolean {
    switch (this.type) {
      case `updated`:
        return true;
      case `modernized`:
        return !this.document.editions.map((e) => e.type).includes(`updated`);
      case `original`:
        return this.document.editions.length === 1;
      default:
        return false; // eslint
    }
  }

  public toJSON(): Omit<
    Edition,
    | 'filename'
    | 'filepath'
    | 'squareCoverImageFilename'
    | 'squareCoverImagePath'
    | 'threeDCoverImageFilename'
    | 'threeDCoverImagePath'
    | 'document'
    | 'toJSON'
  > & {
    filename: { [k in ArtifactType]: string };
  } {
    return {
      type: this.type,
      description: this.description,
      editor: this.editor,
      isbn: this.isbn,
      audio: this.audio,
      splits: this.splits,
      path: this.path,
      paperbackCoverBlurb: this.paperbackCoverBlurb,
      isDraft: this.isDraft,
      isMostModernized: this.isMostModernized,
      filenameBase: this.filenameBase,
      filename: {
        epub: this.filename(`epub`),
        mobi: this.filename(`mobi`),
        speech: this.filename(`speech`),
        'app-ebook': this.filename(`app-ebook`),
        'web-pdf': this.filename(`web-pdf`),
        'paperback-cover': this.filename(`paperback-cover`),
        'paperback-interior': this.filename(`paperback-interior`),
      },
    };
  }
}
