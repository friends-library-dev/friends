# because we also expose the `@friends-library/friends/query` entrypoint
# we need to copy the typescript typings up in to the root dir modifying
# the relative paths to TS is happy
cat ./dist/query.d.ts | perl -pe "s/from '\.\//from '.\/dist\//" > ./query.d.ts
