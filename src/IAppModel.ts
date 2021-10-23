/**
 * (C) 2020. This code is under MIT license.
 * You can get a copy of the license with this software.
 * For more information please see https://opensource.org/licenses/MIT
 */
 import * as vscode from 'vscode';
 import * as Path from 'path';
 import { TmxJsonFileParser, TmxXMLParser } from './TmxParser';

 /**
  * AppModel: abstract classs with all the minimum methods needed for genesis code extension.
  */
export abstract class AppModel{

    /**
     * Terminal Object
     */
    protected terminal: vscode.Terminal;
    /**
     * extension Path
     */
    protected extensionPath: string;

    /**
     * class consctructor
     * @param extensionPath Extension Path
     */
    constructor(extensionPath: string){
        this.terminal=vscode.window.createTerminal('gens-code');
        this.extensionPath=extensionPath;
    }

    /** Clean the current Project (Depends from selected Toolchain configuration) */
    public abstract cleanProject(): boolean;

    public abstract createProject(rootPath: vscode.Uri):vscode.Uri;

    public abstract compileProject(newLine:boolean):boolean;

    public abstract compileAndRunProject():boolean;

    public setRunPath(uri: string):boolean{
        vscode.workspace.getConfiguration().update("gens.path", uri, vscode.ConfigurationTarget.Global).then(
            r => {
                vscode.window.showInformationMessage("Updated gens command path Configuration");
            });
        return true;
    }

    public abstract runProject(newLine:boolean):boolean;

    public abstract compileForDebugging():boolean;

    public importTmxFile(tmxFilePath: vscode.Uri) {
        let parser = new TmxXMLParser();
        let tmx = parser.parseFile(tmxFilePath.fsPath);
        let currentdir = (vscode.workspace.workspaceFolders !== undefined) ? vscode.workspace.workspaceFolders[0].uri : undefined;
        if (currentdir !== undefined) {
            tmx.writeCHeaderFile(Path.join(currentdir.fsPath, "res"), Path.join(this.extensionPath, "resources", "headerfile.h.template"));
        }
    }

    public importJsonTmxFile(tmxJsonFilePath: vscode.Uri) {
        let parser = new TmxJsonFileParser();
        let tmx = parser.parseFile(tmxJsonFilePath.fsPath);
        let currentdir = (vscode.workspace.workspaceFolders !== undefined) ? vscode.workspace.workspaceFolders[0].uri : undefined;
        if (currentdir !== undefined) {
            tmx.writeCHeaderFile(Path.join(currentdir.fsPath, "res"), Path.join(this.extensionPath, "resources", "headerfile.h.template"));
        }
    }

    public deactivate() {
        this.terminal.dispose();

    }
}