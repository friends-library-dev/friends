import '@friends-library/env/load';
import fetch from 'node-fetch';
import pLimit from 'p-limit';
import env from '@friends-library/env';
import * as docMeta from '@friends-library/document-meta';
import {
  AUDIO_QUALITIES,
  SQUARE_COVER_IMAGE_SIZES,
  THREE_D_COVER_IMAGE_WIDTHS,
} from '@friends-library/types';
import { eachEdition } from '../query';

async function main(): Promise<void> {
  const meta = await docMeta.fetch();
  const promises: Promise<any>[] = [];
  const result = { success: true };

  eachEdition(({ edition }) => {
    const { isDraft, audio } = edition;
    if (isDraft) {
      return;
    }

    promises.push(verify(edition.filepath(`web-pdf`), result));
    promises.push(verify(edition.filepath(`mobi`), result));
    promises.push(verify(edition.filepath(`epub`), result));
    promises.push(verify(edition.filepath(`speech`), result));

    const edMeta = meta.get(edition.path);
    if (!edMeta) {
      console.error(`Missing edition meta for ${edition.path}`);
      result.success = false;
    } else if (edMeta.paperback.volumes.length > 1) {
      edMeta.paperback.volumes.forEach((_, idx) => {
        promises.push(verify(edition.filepath(`paperback-cover`, idx + 1), result));
        promises.push(verify(edition.filepath(`paperback-interior`, idx + 1), result));
      });
    } else {
      promises.push(verify(edition.filepath(`paperback-cover`), result));
      promises.push(verify(edition.filepath(`paperback-interior`), result));
    }

    THREE_D_COVER_IMAGE_WIDTHS.forEach((width) =>
      promises.push(verify(edition.threeDCoverImagePath(width), result)),
    );

    SQUARE_COVER_IMAGE_SIZES.forEach((size) =>
      promises.push(verify(edition.squareCoverImagePath(size), result)),
    );

    if (audio) {
      promises.push(verify(audio.zipFilepathHq, result));
      promises.push(verify(audio.zipFilepathHq, result));
      promises.push(verify(audio.m4bFilepathLq, result));
      promises.push(verify(audio.m4bFilepathLq, result));

      audio.parts.forEach((_, idx) => {
        AUDIO_QUALITIES.forEach((quality) => {
          const audioPath = audio.partFilepath(idx, quality);
          promises.push(verify(audioPath, result));
        });
      });
    }
  });

  await Promise.all(promises);

  if (!result.success) {
    process.exit(1);
  }

  console.log(`√ All cloud assets verified successfully.\n`);
}

function verify(path: string, result: { success: boolean }): Promise<void> {
  const { CLOUD_STORAGE_BUCKET_URL: URL } = env.require(`CLOUD_STORAGE_BUCKET_URL`);
  return limit(async () => {
    try {
      const res = await fetch(`${URL}/${path}`, { method: `HEAD` });
      if (res.status !== 200) {
        console.error(`Bad status for asset ${path} : ${res.status}`);
        result.success = false;
      }
    } catch (err) {
      console.error(`Error thrown retrieving asset ${path} : ${err}`);
      result.success = false;
    }
  });
}

const limit = pLimit(process.env.CI ? 10 : 100);

try {
  main();
} catch (err: any) {
  console.error(err.message);
  process.exit(1);
}
