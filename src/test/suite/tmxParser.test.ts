import * as assert from 'assert';
import { TmxParser } from '../../TmsParser';
import * as Path from 'path';
import * as vscode from 'vscode';

suite('TmxParser Test', () => {

    test('tmxParser', () => {
        let tmx = TmxParser.parseTmxFile(Path.join(__dirname, '../../../src/test/suite/ejemplo1.tmx'));
        assert.equal(tmx.map.version, "1.2");
        assert.equal(tmx.map.layer[0].id, 1);
    });
});