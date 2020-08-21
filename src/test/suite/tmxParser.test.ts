import * as assert from 'assert';
import { TmxXMLParser, TmxJsonFileParser, TMXJsonFile } from '../../TmxParser';
import * as Path from 'path';
import * as fs from 'fs';

suite('TmxParser Test', () => {

    test('tmxParser', () => {
        let parser = new TmxXMLParser();
        let tmx = parser.parseFile(Path.join(__dirname, '../../../src/test/suite/ejemplo1.tmx'));
        assert.equal(tmx.map['@_version'], "1.2");
        assert.equal(tmx.map.layer['@_id'], 1);
    });

    test('writeCHeader', () => {
        let parser = new TmxXMLParser();
        let tmx = parser.parseFile(Path.join(__dirname, '../../../src/test/suite/ejemplo1.tmx'));
        tmx.writeCHeaderFile(Path.join(__dirname, '../../../src/test/suite/'), Path.join(__dirname, '../../../resources/headerfile.h.template'));
        let file = fs.readFileSync(Path.join(__dirname, '../../../src/test/suite/ejemplo1Map.h'));
        assert.ok(file.toLocaleString().indexOf('Capa de patrones 1') >= 0);
        fs.unlinkSync(Path.join(__dirname, '../../../src/test/suite/ejemplo1Map.h'));
    });

    test('parseJson', () => {
        let parser = new TmxJsonFileParser();
        let tmx = parser.parseFile(Path.join(__dirname, '../../../src/test/suite/ejemplo1.json'));
        assert.equal(tmx.map.version, "1.2");
        assert.equal(tmx.map.layers[0].id, 1);

    });

    test('writecheaderjson', () => {
        let parser = new TmxJsonFileParser();
        let tmx = parser.parseFile(Path.join(__dirname, '../../../src/test/suite/ejemplo1.json'));
        tmx.writeCHeaderFile(Path.join(__dirname, '../../../src/test/suite/'), Path.join(__dirname, '../../../resources/headerfile.h.template'));
        fs.unlinkSync(Path.join(__dirname, '../../../src/test/suite/ejemplo1Map.h'));
    });
});