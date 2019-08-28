import * as vscode from 'vscode';
import * as Path from 'path';
import * as fs from 'fs';

/**
 * AppModel class; this class have all the internalFunctionality for use with SGDK tasks.
 */
export class AppModel {
    // Terminal opened for use with SGDK
     terminal: vscode.Terminal;

    constructor(){
        this.terminal= vscode.window.createTerminal('gens-code');
        this.terminal.show();
        let varitem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left,1);
        varitem.text="Genesis Code Ready";
        varitem.show();
    }

    /**
     * Clean the project calling the SGDK make clean command (using SGDK or GENDEV)
     * @returns true if success or false otherwise
     */
    public cleanProject(): boolean
    {
        if(process.platform.toString() === 'win32')
		{
			//Windows
           this.terminal.sendText("%GDK%\\bin\\make -f %GDK%\\makefile.gen clean\n");
            
            return true;
		}else if(process.platform.toString() === 'linux')
		{
			//linux
           
            this.terminal.sendText("make -f $GENDEV/sgdk/mkfiles/makefile.gen clean\n");
            
            return true;
		}else
		{
            vscode.window.showWarningMessage("Operating System not yet supported");
            return false;
		}
    }

    /**
     * Create a new Project for SGDK. Create on a specific folder, three subfolders called _src_, _inc_ and _res_.
     * @param projectPath Root Path for the project
     * @returns Initial Project folder
     */
    public createProject(rootPath: vscode.Uri)
    {
        let sourcepath = Path.join(rootPath.fsPath, "src");
        if(!fs.existsSync(sourcepath)){
            fs.mkdirSync(sourcepath);
        }
        let includePath = Path.join(rootPath.fsPath, "inc");
        if(!fs.existsSync(includePath)){
            fs.mkdirSync(includePath);
        }
        let resourcePath = Path.join(rootPath.fsPath, "res");
        if(!fs.existsSync(resourcePath)){
            fs.mkdirSync(resourcePath);
        }
        this.terminal.sendText("git init");
        return rootPath;
    }

    public deactivate()
    {
        this.terminal.dispose()
    }
}