import * as assert from 'assert';
import { before } from 'mocha';
import { CodeProvider } from '../../codeProvider';
import * as Path from 'path';
import * as vscode from 'vscode';




suite('Codecompletion Test', () =>{
    
    test('loadconf Test', ()=>{
        let currentpath = Path.join(__dirname, "../../../");
        let fixture = new CodeProvider(currentpath);
        let firstElement = fixture.getCodeProviderItems()[0];
        assert.equal(firstElement.label,"BITMAP");
        assert.equal(firstElement.kind, vscode.CompletionItemKind.Keyword);
    });
});