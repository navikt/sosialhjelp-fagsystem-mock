const fs = require('fs');
const jstt = require('json-schema-to-typescript');

// compile from file
jstt.compileFromFile('./hendelse-schema.json')
    .then(ts => fs.writeFileSync('foo.d.ts', ts));
