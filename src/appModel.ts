import * as vscode from 'vscode';
import * as Path from 'path';
import * as fs from 'fs';
import { DH_UNABLE_TO_CHECK_GENERATOR } from 'constants';

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

    /**
     * Compile the project. It call to make with the SGDK makefile.gen file.
     *  @returns true if the project runs properly or false otherwise.
     */
    public compileProject(newline : boolean = true): boolean {
        let platform = process.platform.toString();
        if (platform === 'win32'){
            this.terminal.sendText("%GDK%\\bin\\make -f %GDK%\\makefile.gen",newline);
            return true;
        } else if (platform === 'linux'){
            this.terminal.sendText("make -f $GENDEV/sgdk/mkfiles/makefile.gen",newline);
            return true;
        } else {
            vscode.window.showWarningMessage("Operating System not yet supported");
            return false;
        }
    }

    public compileAndRunProject(): boolean {
        
         Promise.resolve(this.compileProject(false)).then( res =>{
             if(res === true){
                this.terminal.sendText(" && ", false);
                this.runProject();
             }else{
                 vscode.window.showWarningMessage("An error ocurred while Compile & Run");
             }
         });
         return true;
    }

    /**
     * Sets the current gens emulator bash command and update the configuration
     * @param uri the new gens emulator command to be updated.
     * @returns true if the configuration has been updated.
     */
    public setRunPath(uri: string):boolean{
        vscode.workspace.getConfiguration().update("gens.path",uri, vscode.ConfigurationTarget.Global).then(
            r =>{
                vscode.window.showInformationMessage("Updated gens command path Configuration");
        });
        return true;
    }

    /**
     * Runs the current project  using the gens command configuration and the rom.bin file path.
     * Before execute this method, the project must be compiled.
     * @returns true if the emulator runs properly
     */
    public runProject(newline:boolean=true): boolean {
        let platform = process.platform.toString();
        let currentPath = (vscode.workspace.workspaceFolders !== undefined)? vscode.workspace.workspaceFolders[0].uri: undefined;
       
        let rompath = (currentPath!== undefined)?Path.join(currentPath.fsPath, "out", "rom.bin"):undefined; 
        
        let genspath = vscode.workspace.getConfiguration().get("gens.path");
        
        let command =genspath + " "+ rompath;
        let platfm = process.platform.toString();
        if(platfm === 'win32'){
            //Run command on background in cmd
            command = 'START /B '+ command;
        }else if(platfm === 'linux'){
            command = command + ' &';
        }else{
            return false;
        }
        this.terminal.sendText(command,newline);
        
        return true;
    }
    
    public deactivate()
    {
        this.terminal.dispose();
        
    }
}