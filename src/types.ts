import {
  Gender,
  Lang,
  Slug,
  Name,
  Description,
  Uuid,
  EditionType,
  ISBN,
  PrintSize,
} from '@friends-library/types';

export interface FriendData {
  id: Uuid;
  lang: Lang;
  name: Name;
  slug: Slug;
  gender: Gender;
  added?: Date;
  born?: number;
  died?: number;
  quotes?: { source: string; text: string }[];
  description: Description;
  documents: DocumentData[];
  residences: {
    city: string;
    region: string;
    durations?: {
      start: number;
      end: number;
    }[];
  }[];
}

export interface DocumentData {
  id: Uuid;
  title: string;
  slug: Slug;
  filename: string;
  description: Description;
  partial_description: Description;
  featured_description?: Description;
  print_size?: PrintSize;
  region?: string;
  tags: (
    | 'journal'
    | 'letters'
    | 'exhortation'
    | 'doctrinal'
    | 'treatise'
    | 'history'
    | 'allegory'
    | 'spiritual life'
  )[];
  original_title?: string;
  published?: number;
  editions: EditionData[];
  incomplete?: true;
  alt_language_id?: Uuid;
  related_documents?: {
    id: Uuid;
    description: Description;
  }[];
}

export interface EditionData {
  type: EditionType;
  editor?: Name;
  splits?: number[];
  isbn: ISBN;
  description?: string;
  audio?: AudioData;
  draft?: true;
}

export interface AudioData {
  reader: Name;
  added: Date;
  incomplete?: true;
  external_playlist_id_lq?: number;
  external_playlist_id_hq?: number;
  parts: AudioPartData[];
}

export interface AudioPartData {
  title: string;
  external_id_lq: number;
  external_id_hq: number;
  chapters: number[];
}
