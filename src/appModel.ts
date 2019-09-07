import * as vscode from 'vscode';
import * as Path from 'path';
import * as fs from 'fs';

/**
 * AppModel class; this class have all the internalFunctionality for use with SGDK tasks.
 */
export class AppModel {
	
    // Terminal opened for use with SGDK
     terminal: vscode.Terminal;
     statusBar: vscode.StatusBarItem| undefined;
     context: vscode.ExtensionContext;
    constructor(context: vscode.ExtensionContext){
        this.terminal= vscode.window.createTerminal('gens-code');
        this.terminal.show();
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left,1);
        this.statusBar.text="Genesis Code Ready";
        this.statusBar.show();
        this.context=context;
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
        //Add README.md File
        let readmetemppath=Path.join(this.context.extensionPath,"resources","README.md.template");
        let readmemdpath =Path.join(rootPath.fsPath,"README.MD");
        fs.copyFileSync(readmetemppath,readmemdpath);
        //add .gitignorefile
        let ignoretemppath=Path.join(this.context.extensionPath,"resources","gitignore.template");
        let ignorepath =Path.join(rootPath.fsPath,".gitignore");
        fs.copyFileSync(ignoretemppath,ignorepath);
        //add main.c hello world Example
        let mainctemppath=Path.join(this.context.extensionPath,"resources","mainc.template");
        let maincpath =Path.join(rootPath.fsPath,"src","main.c");
        fs.copyFileSync(mainctemppath,maincpath);
        //add git repository to the project
        this.terminal.sendText("cd "+ rootPath.fsPath+" && git init");
        return rootPath;
    }


    public compileProject(): boolean {
        let platform = process.platform.toString();
        if (platform === 'win32'){
            this.terminal.sendText("%GDK%\\bin\\make -f %GDK%\\makefile.gen");
            return true;
        } else if (platform === 'linux'){
            this.terminal.sendText("make -f $GENDEV/sgdk/mkfiles/makefile.gen");
            return true;
        } else {
            vscode.window.showWarningMessage("Operating System not yet supported");
            return false;
        }
    }

    public setRunPath(uri: string):boolean{
        vscode.workspace.getConfiguration().update("gens.path",uri, vscode.ConfigurationTarget.Global).then(
            r =>{
                console.log("Updated gens command path");
        });
        return true;
    }

    //Run Project command
    public runProject(): boolean {
        let platform = process.platform.toString();
        let currentPath = (vscode.workspace.workspaceFolders !== undefined)? vscode.workspace.workspaceFolders[0].uri: undefined;
       
        let rompath = (currentPath!== undefined)?Path.join(currentPath.fsPath, "out", "rom.bin"):undefined; 
        
        let genspath = this.context.globalState.get("genspath");
        
        this.terminal.sendText(genspath + " "+ rompath);
        return true;
    }
    
    public deactivate()
    {
        this.terminal.dispose();
        
    }
}