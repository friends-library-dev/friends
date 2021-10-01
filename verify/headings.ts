import '@friends-library/env/load';
// @ts-ignore -- dpc-fs pkg is installed in CI env to run this test
import { query, hydrate } from '@friends-library/dpc-fs';
// @ts-ignore -- evaluator pkg is installed in CI env to run this test
import { evaluate, ParserError } from '@friends-library/evaluator';

function main(): void {
  let numFails = 0;
  query.getByPattern().forEach((dpc) => {
    hydrate.entities(dpc);
    hydrate.asciidoc(dpc, { chapterHeadingsOnly: true });

    try {
      var result = evaluate.toPdfSrcHtml(dpc);
    } catch (err) {
      if (err instanceof ParserError) {
        console.log(err.codeFrame);
        process.exit(1);
      } else {
        throw err;
      }
    }

    let someShortHeadingsIncludeSequence = false;
    let allSequencedShortHeadingsIncludeSequence = true;
    result.chapters.forEach((c) => {
      const shortHeadingIncludesSequence = c.shortHeading.match(
        /^(Capítulo|Chapter|Section|Sección) /,
      );

      if (c.sequenceNumber && shortHeadingIncludesSequence) {
        someShortHeadingsIncludeSequence = true;
      }

      if (c.sequenceNumber && !shortHeadingIncludesSequence) {
        allSequencedShortHeadingsIncludeSequence = false;
      }
    });

    if (someShortHeadingsIncludeSequence && !allSequencedShortHeadingsIncludeSequence) {
      numFails++;
      console.log(`\nEdition \`${dpc.path}\` has inconsistent short headings:`);
      console.log(`  - ${result.chapters.map(utf8ShortTitle).join(`\n  - `)}`);
    }
  });

  console.log(`\nHeading verification ${numFails > 0 ? `failed` : `succeeded`}.\n`);
  process.exit(numFails);
}

main();

function utf8ShortTitle({ shortHeading }: { shortHeading: string }): string {
  return shortHeading.replace(`&#8212;`, `—`);
}
