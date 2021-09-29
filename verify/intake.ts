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

    if (intakeSafeList.includes(dpc.edition.path)) {
      return;
    }

    const adoc = dpc.asciidocFiles.reduce((acc, { adoc }) => acc + adoc, ``);
    const adocLines = adoc.split(`\n`);
    const signsOfIntake = adocLines.reduce((count: number, line: string) => {
      for (const regex of regexes) {
        if (regex.test(line)) {
          return count + 1;
        }
      }
      return count;
    }, 0);

    const rate = adocLines.length / signsOfIntake;

    if (rate > 650 && dpc.edition.isDraft === false) {
      console.error(`${dpc.path} likely not intaken`);
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

// add patterns of docs that appear to be not intaken
// and for some reason should not trigger CI failures
const intakeSafeList: string[] = [
  `en/jane-hoskens/life/modernized`,
  `en/jane-hoskens/life/original`,
  `en/anne-camm/life/modernized`,
  `en/anne-camm/life/original`,
  `es/john-gratton/seleccion-del-diario/updated`,
];

main();
