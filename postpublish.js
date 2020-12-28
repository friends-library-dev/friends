require(`@friends-library/env/load`);
const exec = require(`x-exec`).default;
const { magenta, gray } = require(`x-chalk`);
const env = require(`@friends-library/env`).default;

const { POST_PUBLISH_API_BUILD_HOOK_URL } = env.require(
  `POST_PUBLISH_API_BUILD_HOOK_URL`,
);

gray(`\nWaiting 30 seconds for published package to be ready before rebuilding API...\n`);
exec.out(`sleep 30`);
exec.exit(`curl -X POST -d {} ${POST_PUBLISH_API_BUILD_HOOK_URL}`);
magenta(`API rebuild triggered.\n`);
