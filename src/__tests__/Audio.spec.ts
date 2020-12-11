import { Lang } from '@friends-library/types';
import { describe, it, expect, test } from '@jest/globals';
import Audio from '../Audio';

const HOUR = 60 * 60;
const MINUTE = 60;

describe(`Audio.humanDuration()`, () => {
  it(`returns human formatted string of duration`, () => {
    const duration = Audio.humanDuration([MINUTE, MINUTE, MINUTE, 5.2]);
    expect(duration).toBe(`3:05`);
  });

  const clockCases: [number[], string][] = [
    [[HOUR * 3], `3:00:00`],
    [[HOUR * 3, MINUTE * 5, 5], `3:05:05`],
    [[HOUR * 5, MINUTE * 19, 43], `5:19:43`],
    [[3318], `55:18`],
    [[3203], `53:23`],
    [[1815, 1807, 1834, 1691, 2573], `2:42:00`],
    [[3], `3`],
  ];

  test.each(clockCases)(`%s should convert to %s`, (secondses, expected) => {
    const duration = Audio.humanDuration(secondses);
    expect(duration).toBe(expected);
  });

  const abbrevCases: [number[], string, Lang][] = [
    [[HOUR * 3], `3 hr`, `en`],
    [[HOUR * 3], `3 h`, `es`],
    [[HOUR * 3, 5 * MINUTE], `3 hr 5 min`, `en`],
    [[HOUR * 3, 5 * MINUTE], `3 h 5 min`, `es`],
    [[MINUTE * 13], `13 min`, `en`],
    [[MINUTE * 13], `13 min`, `es`],
  ];

  test.each(abbrevCases)(`%s should convert to %s`, (secondses, expected, lang) => {
    const duration = Audio.humanDuration(secondses, `abbrev`, lang);
    expect(duration).toBe(expected);
  });
});
