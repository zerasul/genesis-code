import * as assert from 'assert';
import { TmxParser } from '../../TmxParser';
import * as Path from 'path';
import * as fs from 'fs';

suite('TmxParser Test', () => {

    test('tmxParser', () => {
        let tmx = TmxParser.parseTmxFile(Path.join(__dirname, '../../../src/test/suite/ejemplo1.tmx'));
        assert.equal(tmx.map['@_version'], "1.2");
        assert.equal(tmx.map.layer['@_id'], 1);
    });

    test('writeCHeader', () => {
        let tmx = TmxParser.parseTmxFile(Path.join(__dirname, '../../../src/test/suite/ejemplo1.tmx'));
        tmx.writeHeaderFile(Path.join(__dirname, '../../../src/test/suite/'), Path.join(__dirname, '../../../resources/headerfile.h.template'));
        let file = fs.readFileSync(Path.join(__dirname, '../../../src/test/suite/ejemplo1Map.h'));
        assert.ok(file.toLocaleString().indexOf('Capa de patrones 1') >= 0);
        fs.unlinkSync(Path.join(__dirname, '../../../src/test/suite/ejemplo1Map.h'));
    });
});