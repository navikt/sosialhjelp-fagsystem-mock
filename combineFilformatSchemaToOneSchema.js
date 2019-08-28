'use strict';
const fs = require('fs');
const traverse = require('json-schema-traverse');
const path = require('path')

// CONSTANTS
const digisosSokerSchemaFilename = 'digisos-soker.json';
const digisosSokerSchemaPath = "soknadsosialhjelp-filformat/json/digisos/soker/";
const REF = '$ref';


let digisosSokerSchema = JSON.parse(fs.readFileSync(path.resolve(digisosSokerSchemaPath, digisosSokerSchemaFilename)));



let shouldTraverse = true;
let foundRefToResolve = false;

let pathsRegister = {};

pathsRegister["digisosSoker"] = "";

while (shouldTraverse){
    traverse(digisosSokerSchema, (obj, obj2, obj3) => {
        if (Object.keys(obj)[0] === REF && !obj[REF].match(/^#.+?/)){
            const currentObjectMatchResult = obj2.match(/\/definitions\/(.+?)\/properties/);
            const currentObject = currentObjectMatchResult ? currentObjectMatchResult[1] : null;


            foundRefToResolve = true;

            let refObject = obj[REF];
            console.warn('REF OBJECT: ' + refObject);

            let relativePathToRefObjectMatch = refObject.match(/(.+?)\/(.+?).json/);
            let relativePathToRefObject = relativePathToRefObjectMatch ? relativePathToRefObjectMatch[1] : null;
            console.warn('REF OBJECT RELATIVE PATH: ' + relativePathToRefObject);

            pathsRegister[relativePathToRefObjectMatch[2]] = relativePathToRefObject;



            if (currentObject && currentObject === 'digisosSoker'){

                let jsonFilePath = path.resolve(digisosSokerSchemaPath, refObject);
                let jsonToInsertIntoDefinitions = JSON.parse(fs.readFileSync(jsonFilePath));
                const nameToAddToDefinitions = obj[REF].match(/\/(.+).json/)[1];
                if (nameToAddToDefinitions && !obj3['definitions'][nameToAddToDefinitions]){
                    obj3['definitions'][nameToAddToDefinitions] = jsonToInsertIntoDefinitions
                }
                obj[REF] = `#/definitions/${nameToAddToDefinitions}`;
            } else {
                obj[REF] = `##${obj[REF]}`

            }

        }
    });


    shouldTraverse = foundRefToResolve;
    foundRefToResolve = false;
}

console.warn('RELATIVE PATH TO JSON FILE:');
console.warn(JSON.stringify(pathsRegister, null, 4));




let data = JSON.stringify(digisosSokerSchema);

fs.writeFileSync('./src/digisos/test-file.json', data);



const minimalJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "soknadsosialhjelp-filformat/src/test/resources/json/digisos/soker/komplett.json")));
fs.writeFileSync('./src/digisos/komplett.json', JSON.stringify(minimalJson));

