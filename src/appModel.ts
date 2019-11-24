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
        console.log(process.platform.toString());
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
		}else if(process.platform.toString() === 'darwin'){
            // MacOs using Wine
            //first check if the build.bat file is created
            let currentdir = (vscode.workspace.workspaceFolders!== undefined)? vscode.workspace.workspaceFolders[0].uri: undefined;
            this.copybuildmacos(currentdir);
            this.terminal.sendText("WINEPREFIX=$GENDEV/wine wine cmd /C %cd%\\\\build.bat clean");
            return true;
        }else
		{
            vscode.window.showWarningMessage("Operating System not yet supported");
            return false;
		}
    }

    /**
     * copy the current build.bat program for run it with wine.
     * @param rootPath current main path
     */
    private copybuildmacos(rootPath: vscode.Uri|undefined){
        if(rootPath!==undefined){
            if(!fs.existsSync(Path.join(rootPath.fsPath,"build.bat"))){
                let buildbatpath=Path.join(this.context.extensionPath,"resources","build.bat");
                let buildcurrentpath = Path.join(rootPath.fsPath, "build.bat");
                fs.copyFileSync(buildbatpath, buildcurrentpath);
            }
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
            // Added gitkeep files to show it on git repo
            let gitinckeep=Path.join(this.context.extensionPath,"resources","gitkeep.template");
            let gitinckeeppath =Path.join(rootPath.fsPath,"inc",".gitkeep");
            fs.copyFileSync(gitinckeep,gitinckeeppath);
        }
        let resourcePath = Path.join(rootPath.fsPath, "res");
        if(!fs.existsSync(resourcePath)){
            fs.mkdirSync(resourcePath);
            // Added gitkeep files to show it on git repo
            let gitreskeep=Path.join(this.context.extensionPath,"resources","gitkeep.template");
            let gitreskeeppath =Path.join(rootPath.fsPath,"res",".gitkeep");
            fs.copyFileSync(gitreskeep,gitreskeeppath);
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
        }else if(platform === 'darwin'){
            // MacOs using Wine
            //first check if the build.bat file is created
            let currentdir = (vscode.workspace.workspaceFolders!== undefined)? vscode.workspace.workspaceFolders[0].uri: undefined;
            this.copybuildmacos(currentdir);
            this.terminal.sendText("WINEPREFIX=$GENDEV/wine wine cmd /C %cd%\\\\build.bat release", newline);
            return true;
        
        } else {
            vscode.window.showWarningMessage("Operating System not yet supported");
            return false;
        }
    }
    /**
     * Compiles the project and run using the current emulator command path.
     * In this case, the emulator is not running in background.
     */
    private compileAndRunMacosProject(): boolean{
        this.terminal.sendText("WINEPREFIX=$GENDEV/wine wine cmd /C %cd%\\\\build.bat release", false);
        this.terminal.sendText(" && ", false);
        let genspath = vscode.workspace.getConfiguration().get("gens.path");
        this.terminal.sendText(genspath+ " "+ "$(pwd)/out/rom.bin", true);
        return true;
    }
    /**
     * Compiles and run the current project.
     * NOTE: In darwin (MACOs) the emulator is running in foreground.
     */
    public compileAndRunProject(): boolean {
         if(process.platform.toString() === 'darwin'){
             return this.compileAndRunMacosProject();
         }
         Promise.resolve(this.compileProject(false)).then( res =>{
             if(res){
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
       
        let currentPath = (vscode.workspace.workspaceFolders !== undefined)? vscode.workspace.workspaceFolders[0].uri: undefined;
       
        let rompath = (currentPath!== undefined)?Path.join(currentPath.fsPath, "out", "rom.bin"):undefined; 
        
        let genspath = vscode.workspace.getConfiguration().get("gens.path");
        
        let command =genspath + " "+ rompath;
        let platfm = process.platform.toString();
        if(platfm === 'win32'){
            //Run command on background in cmd
            command = 'START /B '+ command;
        }else if(platfm === 'linux' || platfm === 'darwin'){
            //for linux and mac run the command with &
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