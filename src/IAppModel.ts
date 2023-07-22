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
    protected terminal: vscode.Terminal|null;
    /**
     * extension Path
     */
    protected extensionPath: string;

    /**
     * class consctructor
     * @param extensionPath Extension Path
     */
    constructor(extensionPath: string){
        this.terminal=null;
        this.extensionPath=extensionPath;
    }

    protected getTerminal():vscode.Terminal{
        if(this.terminal==null){
            let terminals = vscode.window.terminals.filter(terminal => terminal.name === 'gens.code');
            this.terminal= terminals.length>0?terminals[0]:vscode.window.createTerminal('gens.code');
        }
        return this.terminal;
    }

    /** Clean the current Project (Depends from selected Toolchain configuration) */
    public abstract cleanProject(): boolean;

    /**
     * Create a new Project
     * @param rootPath Project Location
     */
    public abstract createProject(rootPath: vscode.Uri):vscode.Uri;

    /**
     * Compile the current project
     * @param newLine run the compile project with a new Line.
     */
    public abstract compileProject(newLine:boolean, withArg:string):boolean;

    /**
     * Compile the project and run the rom in an emulator
     */
    public abstract compileAndRunProject():boolean;

    /**
     * Set the Emulator Run Path
     * @param uri Emularor Run Path
     * @returns True if the command was succesful
     */
    public setRunPath(uri: string):boolean{
        vscode.workspace.getConfiguration().update("gens.path", uri, vscode.ConfigurationTarget.Global).then(
            r => {
                vscode.window.showInformationMessage("Updated gens command path Configuration");
            });
        return true;
    }

    /**
     * Run the current rom in an emulator
     * @param newLine Run the command in a new Line
     */
    public abstract runProject(newLine:boolean):boolean;

    /**
     * Compile the project with debug flag
     */
    public abstract compileForDebugging():boolean;

    /**
     * Import a new TMX file and generate a new .h file
     * @param tmxFilePath Tmx File path 
     */
    public importTmxFile(tmxFilePath: vscode.Uri) {
        let parser = new TmxXMLParser();
        let tmx = parser.parseFile(tmxFilePath.fsPath);
        let currentdir = (vscode.workspace.workspaceFolders !== undefined) ? vscode.workspace.workspaceFolders[0].uri : undefined;
        if (currentdir !== undefined) {
            tmx.writeCHeaderFile(Path.join(currentdir.fsPath, "res"), Path.join(this.extensionPath, "resources", "headerfile.h.template"));
        }
    }

    /**
     * Import a new JSON TMX file and generate a new .h file
     * @param tmxJsonFilePath 
     */
    public importJsonTmxFile(tmxJsonFilePath: vscode.Uri) {
        let parser = new TmxJsonFileParser();
        let tmx = parser.parseFile(tmxJsonFilePath.fsPath);
        let currentdir = (vscode.workspace.workspaceFolders !== undefined) ? vscode.workspace.workspaceFolders[0].uri : undefined;
        if (currentdir !== undefined) {
            tmx.writeCHeaderFile(Path.join(currentdir.fsPath, "res"), Path.join(this.extensionPath, "resources", "headerfile.h.template"));
        }
    }

    /**
     * Deactivate the extension
     */
    public deactivate() {
        this.terminal?.dispose();

    }

   

}


