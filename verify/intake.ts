import '@friends-library/env/load';
// @ts-ignore -- dpc-fs pkg is installed in CI env to run this test
import { query, hydrate } from '@friends-library/dpc-fs';

function main(): void {
  let err = false;
  query.getByPattern().forEach((dpc) => {
    hydrate.entities(dpc);
    hydrate.asciidoc(dpc);
    if (!dpc.edition) {
      throw new Error(`Missing dpc edition entity`);
    }

    const signsOfIntake = dpc.asciidoc
      .split(`\n`)
      .reduce((count: number, line: string) => {
        for (const regex of regexes) {
          if (regex.test(line)) {
            return count + 1;
          }
        }
        return count;
      }, 0);

    const rate = dpc.asciidoc.split(`\n`).length / signsOfIntake;

    if (rate > 650 && dpc.edition.isDraft === false) {
      console.error(`${dpc.path}} likely not intaken`);
      err = true;
    }
  });

  if (err) {
    process.exit(1);
  }

  console.log(`√ All editions complete or correctly marked as draft.\n`);
}

const regexes = [
  /^\[quote]$/,
  /^\[quote\.scripture.*]$/,
  /^\[quote\.section-epigraph.*]$/,
  /^____$/,
  /style-blurb/,
  /chapter-subtitle--blurb/,
  /short="/,
  /chapter-synopsis/,
  /\.alt\b/,
  /\.old-style/,
  /\.blurb/,
  /^\[\.asterism\]$/,
  /^\[\.small-break\]$/,
  /^'''$/,
  /\.centered/,
  /^__Objection:__$/,
  /\.offset\b/,
  /\.salutation/,
  /\.signed-section/,
  /\.embedded-content-document/,
  /\.postscript/,
  /\.book-title/,
  /\.underline/,
  /\.section-author/,
  /\.section-date/,
  /\.heading-continuation-blurb/,
  /\.section-summary-preface/,
  /\.numbered/,
  /\.emphasized/,
  /\.the-end/,
  /\.syllogism/,
  /::$/,
  /\.discourse-part/,
  /^\[verse.+]$/,
];

main();
