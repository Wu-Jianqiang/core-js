import semver from 'semver';

const { coerce, cmp } = semver;
const { cyan, green } = chalk;
const ALL = !argv._.includes('main-only');
const downloadsByPatch = {};
const downloadsByMinor = {};
const downloadsByMajor = {};
let total = 0;

async function getStat(pkg) {
  const res = await fetch(`https://www.npmjs.com/package/${ pkg }`);
  const html = await res.text();
  const [, json] = html.match(/>window\.__context__ = ([^<]+)<\//);
  return JSON.parse(json).context.versionsDownloads;
}

const [core, pure, bundle] = await Promise.all([
  getStat('core-js'),
  // eslint-disable-next-line unicorn/prefer-top-level-await -- false positive
  ALL && getStat('core-js-pure'),
  // eslint-disable-next-line unicorn/prefer-top-level-await -- false positive
  ALL && getStat('core-js-bundle'),
]);

for (let [patch, downloads] of Object.entries(core)) {
  const version = coerce(patch);
  const { major } = version;
  const minor = `${ major }.${ version.minor }`;
  if (ALL) downloads += (pure[patch] || 0) + (bundle[patch] || 0);
  downloadsByPatch[patch] = downloads;
  downloadsByMinor[minor] = (downloadsByMinor[minor] || 0) + downloads;
  downloadsByMajor[major] = (downloadsByMajor[major] || 0) + downloads;
  total += downloads;
}

function log(kind, map) {
  echo(green(`downloads for 7 days by ${ cyan(kind) } releases:`));
  console.table(Object.entries(map).sort(([a], [b]) => {
    return cmp(coerce(a), '>', coerce(b)) ? 1 : -1;
  }).reduce((memo, [version, downloads]) => {
    memo[version] = { downloads, '%': `${ (downloads / total * 100).toFixed(2).padStart(5) } %` };
    return memo;
  }, {}));
}

log('patch', downloadsByPatch);
log('minor', downloadsByMinor);
log('major', downloadsByMajor);
