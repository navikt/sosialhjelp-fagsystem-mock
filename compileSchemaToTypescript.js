const fs = require('fs');
const jstt = require('json-schema-to-typescript');

const filnavn = process.argv[2];

if (!filnavn){
    console.warn('navn på fil mangler som input parameter. F eks "node compileSchemaToTypescript.js foo.json"');
    process.exit(1);
}

const match = filnavn.match(/^(.+?)\.json$/);

if (!match){
    console.warn('filnavnet må ende på .json. F eks: foo.json');
    process.exit(1);
}

jstt.compileFromFile(`./${filnavn}`)
    .then(ts => fs.writeFileSync(`${match[1]}.d.ts`, ts));
