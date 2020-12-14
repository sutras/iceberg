const fs = require('fs');
const pkgJson = fs.readFileSync(`${process.cwd()}/package.json`);
const pkgObj = JSON.parse( pkgJson );

module.exports = 
`
/**
 * @version v${pkgObj.version}
 * @link ${pkgObj.homepage}
 * @license MIT
 */
`.trimStart();