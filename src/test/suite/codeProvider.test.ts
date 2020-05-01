import * as assert from 'assert';
import { CodeProvider } from '../../codeProvider';
import * as Path from 'path';
import * as vscode from 'vscode';




suite('Codecompletion Test', () => {

    test('CodeProvider', () => {
        let currentpath = Path.join(__dirname, "../../../");
        let fixture = new CodeProvider(currentpath);
        let firstElement = fixture.getCodeProviderItems()[0];
        assert.equal(firstElement.label, "BITMAP");
        assert.equal(firstElement.kind, vscode.CompletionItemKind.Keyword);
    });
});