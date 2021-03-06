import { isDefined } from 'x-ts-utils';
import { Name, Lang, Uuid, Slug, Description } from '@friends-library/types';
import { FriendData } from './types';
import Document from './Document';

export default class Friend {
  public documents: Document[] = [];

  public constructor(private data: Omit<FriendData, 'documents'>) {}

  public get id(): Uuid {
    return this.data.id;
  }

  public get died(): number | undefined {
    return this.data.died;
  }

  public get born(): number | undefined {
    return this.data.born;
  }

  public get added(): Date | undefined {
    return this.data.added;
  }

  public get lang(): Lang {
    return this.data.lang;
  }

  public get description(): Description {
    return this.data.description;
  }

  public get name(): Name {
    return this.data.name;
  }

  public get gender(): string {
    return this.data.gender;
  }

  public get slug(): Slug {
    return this.data.slug;
  }

  public get path(): string {
    return `${this.data.lang}/${this.data.slug}`;
  }

  public get isMale(): boolean {
    return this.data.gender === `male`;
  }

  public get isFemale(): boolean {
    return !this.isMale;
  }

  public get isCompilationsQuasiFriend(): boolean {
    return this.slug.startsWith(`compila`);
  }

  public get primaryResidence(): Omit<FriendData['residences'][0], 'duration'> {
    if (this.isCompilationsQuasiFriend) {
      return {
        city: `mixed (compilation)`,
        region: `mixed (compilation)`,
      };
    }

    return this.residences.reduce((primary, res) => {
      if (
        res.durations &&
        this.totalAdultYears(res.durations) >
          this.totalAdultYears(primary.durations || [])
      ) {
        return res;
      }
      return primary;
    });
  }

  private totalAdultYears(durations: { start: number; end: number }[]): number {
    const START_OF_ADULTHOOD = 16;
    return durations.reduce((total, { start, end }) => {
      const adultStart = start === this.born ? start + START_OF_ADULTHOOD : start;
      return total + end - adultStart;
    }, 0);
  }

  public get residences(): FriendData['residences'] {
    if (!this.data.residences) {
      return [];
    }
    return this.data.residences;
  }

  public get alphabeticalName(): string {
    const parts = this.data.name.split(` `);
    return `${parts.pop()}, ${parts.join(` `)}`;
  }

  public get hasNonDraftDocument(): boolean {
    return this.documents.reduce(
      (hasNonDraft, doc) => hasNonDraft || doc.hasNonDraftEdition,
      false as boolean,
    );
  }

  public get quotes(): FriendData['quotes'] {
    return this.data.quotes;
  }

  public get relatedDocuments(): { id: Uuid; description: Description }[] {
    return this.documents.flatMap((doc) => doc.relatedDocuments).filter(isDefined);
  }

  public toJSON(): Omit<Friend, 'toJSON' | 'documents'> {
    return {
      id: this.id,
      lang: this.lang,
      born: this.born,
      died: this.died,
      description: this.description,
      hasNonDraftDocument: this.hasNonDraftDocument,
      name: this.name,
      gender: this.gender,
      slug: this.slug,
      path: this.path,
      isMale: this.isMale,
      isFemale: this.isFemale,
      isCompilationsQuasiFriend: this.isCompilationsQuasiFriend,
      alphabeticalName: this.alphabeticalName,
      residences: this.residences,
      quotes: this.quotes,
      relatedDocuments: this.relatedDocuments,
      primaryResidence: this.primaryResidence,
      added: this.added,
    };
  }
}
