import * as vscode from "vscode";
import { AppModel} from "./IAppModel";
import * as constants from "./constants";
import * as Path from 'path';
import * as fs from 'fs';

export class AppModelWin32 extends AppModel{
    
    public compileProject(newLine: boolean=true, withArg:string='release'): boolean {
        let toolchainType = vscode.workspace.getConfiguration().get(constants.TOOLCHAINTYPE);     
        switch(toolchainType){
            case constants.SGDK_GENDEV:
                return this.compilesgdk(newLine,withArg);
            case constants.MARSDEV:
                return this.compileMarsdev(newLine,withArg);
            case constants.DOCKER:
                return this.compileDocker(newLine,withArg);
            default:
                return false;
        }
    }
    private compileDocker(newLine: boolean,withArg:string): boolean {
        let tag = vscode.workspace.getConfiguration().get(constants.DOCKERTAG);
        let dockerTag = tag !== "" ? tag : "sgdk";
        let volumeInfo = this.buildVolumeInfo();
        this.getTerminal().sendText(`docker run --rm -v ${volumeInfo} ${dockerTag} ${withArg}` , newLine);
        return true;
    }
    private compileMarsdev(newLine: boolean, withArg:string): boolean {
        this.setMarsDevEnv();
        let makefile = vscode.workspace.getConfiguration().get(constants.MAKEFILE);
        this.getTerminal().sendText(`make ${makefile} clean ${withArg}`, newLine);
        return true;
    }
    private compilesgdk(newLine: boolean, withArg:string): boolean {
        let makefile = vscode.workspace.getConfiguration().get(constants.MAKEFILE, constants.DEFAULT_WIN_SGDK_MAKEFILE);
        let gdk = vscode.workspace.getConfiguration().get(constants.GDK_ENV);
        if(gdk!==""){
            this.getTerminal().sendText("set GDK=" + gdk, true);
        }
        if(makefile===""){
            makefile=constants.DEFAULT_WIN_SGDK_MAKEFILE;
        }
        this.getTerminal().sendText(`%GDK%\\bin\\make -f ${makefile} ${withArg}`, newLine);
        return true;
    }
    public compileAndRunProject(): boolean {
        this.compileProject(false);
        this.getTerminal().sendText(" && ",false);
        return this.runProject(true);
    }
    public runProject(newLine: boolean): boolean {
        let genspath = vscode.workspace.getConfiguration().get(constants.GENS_PATH);
        let toolchainType = vscode.workspace.getConfiguration().get(constants.TOOLCHAINTYPE);
        let romPath = (toolchainType=== constants.MARSDEV)? "%CD%/rom.bin":"%CD%/out/rom.bin";
        this.getTerminal().sendText(`START /B ${genspath} ${romPath}`);
        return true;
    }
    public compileForDebugging(): boolean {
        return this.compileProject(true,'debug');
    }

    
    public createProject(rootPath: vscode.Uri): vscode.Uri {
        let sourcepath = Path.join(rootPath.fsPath, "src");
        if (!fs.existsSync(sourcepath)) {
            fs.mkdirSync(sourcepath);
        }
        let includePath = Path.join(rootPath.fsPath, "inc");
        if (!fs.existsSync(includePath)) {
            fs.mkdirSync(includePath);
            // Added gitkeep files to show it on git repo
            let gitinckeep = Path.join(this.extensionPath, "resources", "gitkeep.template");
            let gitinckeeppath = Path.join(rootPath.fsPath, "inc", ".gitkeep");
            fs.copyFileSync(gitinckeep, gitinckeeppath);
        }
        let resourcePath = Path.join(rootPath.fsPath, "res");
        if (!fs.existsSync(resourcePath)) {
            fs.mkdirSync(resourcePath);
            // Added gitkeep files to show it on git repo
            let gitreskeep = Path.join(this.extensionPath, "resources", "gitkeep.template");
            let gitreskeeppath = Path.join(rootPath.fsPath, "res", ".gitkeep");
            fs.copyFileSync(gitreskeep, gitreskeeppath);
        }
        //Add README.md File
        let readmetemppath = Path.join(this.extensionPath, "resources", "README.md.template");
        let readmemdpath = Path.join(rootPath.fsPath, "README.MD");
        fs.copyFileSync(readmetemppath, readmemdpath);
        //add .gitignorefile
        let ignoretemppath = Path.join(this.extensionPath, "resources", "gitignore.template");
        let ignorepath = Path.join(rootPath.fsPath, ".gitignore");
        fs.copyFileSync(ignoretemppath, ignorepath);
        //add main.c hello world Example
        let mainctemppath = Path.join(this.extensionPath, "resources", "mainc.template");
        let maincpath = Path.join(rootPath.fsPath, "src", "main.c");
        fs.copyFileSync(mainctemppath, maincpath);
        //add launch.json file with debuging configuration.
        let vscodedirpath = Path.join(rootPath.fsPath, ".vscode");
        if(!fs.existsSync(vscodedirpath)){
            fs.mkdirSync(vscodedirpath);
            let sourcefile = Path.join(this.extensionPath, "resources", "launch.json.windowssgdk.template");
            fs.copyFileSync(sourcefile, Path.join(vscodedirpath, "launch.json"));
        }
        //add marsdev makefile
        let toolchainType = vscode.workspace.getConfiguration().get(constants.TOOLCHAINTYPE);
        let sourcefile = Path.join(this.extensionPath, "resources", "ccppsettings.windowssgdk.template");
        if(toolchainType===constants.MARSDEV){
            this.createMakefileMarsDev(rootPath);        
            sourcefile = Path.join(this.extensionPath, "resources", "ccppsettings.windowsmarsdev.template");

        }
        //add settings.json
        fs.copyFileSync(sourcefile, Path.join(vscodedirpath, "settings.json"));
        this.getTerminal().sendText(`cd "${rootPath.fsPath}" && git init`);
        return rootPath;
    }

    private createMakefileMarsDev(rootPath:vscode.Uri){
        let makefiletemppath = Path.join(this.extensionPath, "resources", "Makefile.template");
        
        fs.copyFileSync(makefiletemppath, Path.join(rootPath.fsPath, "Makefile"));
        //add boot directory
        fs.mkdirSync(Path.join(rootPath.fsPath, "boot"));
        fs.copyFileSync(Path.join(this.extensionPath, "resources", "boot", "sega.s.template"), Path.join(rootPath.fsPath, "boot", "sega.s"));
        fs.copyFileSync(Path.join(this.extensionPath, "resources", "boot", "rom_head.c.template"), Path.join(rootPath.fsPath, "boot", "rom_head.c"));
    }

    public cleanProject(): boolean {
        let toolchainType = vscode.workspace.getConfiguration().get(constants.TOOLCHAINTYPE);
        var makefile;

        switch(toolchainType){
            
            case constants.SGDK_GENDEV:
                makefile = vscode.workspace.getConfiguration().get(constants.MAKEFILE, constants.DEFAULT_WIN_SGDK_MAKEFILE);
                return this.cleanProjectSgdk(makefile);
            case constants.MARSDEV:
                makefile = vscode.workspace.getConfiguration().get(constants.MAKEFILE);
                return this.cleanProjectMarsDev(makefile);
            case constants.DOCKER:
                return this.cleanProjectDocker();
            default:
                return false;
            
        }
       
    }
    private cleanProjectDocker(): boolean {
        let tag = vscode.workspace.getConfiguration().get(constants.DOCKERTAG);
        let dockerTag = tag !== "" ? tag : "sgdk";
        let volumeInfo = this.buildVolumeInfo();
        this.getTerminal().sendText(`docker run --rm -v ${volumeInfo} ${dockerTag} clean` , true);
        return true;
    }

    private setMarsDevEnv(){
        let marsdev = vscode.workspace.getConfiguration().get(constants.MARSDEV_ENV);
        this.getTerminal().sendText(`set MARSDEV=${marsdev}`, true);
    }
    private cleanProjectMarsDev(makefile: unknown): boolean {
        this.setMarsDevEnv();
        let mkfile = (makefile !== "") ? "-f " + makefile : " ";
        this.getTerminal().sendText(`make ${mkfile} clean`);
        return true;
    }

    private cleanProjectSgdk(makefile:string):boolean{
        let gdk = vscode.workspace.getConfiguration().get(constants.GDK_ENV);
        if (gdk !== "") {
            this.getTerminal().sendText(`set GDK=${gdk}`, true);
          }
        let cmakefile = makefile !== "" ? makefile : constants.DEFAULT_WIN_SGDK_MAKEFILE;
        this.getTerminal().sendText(`%GDK%\\bin\\make -f ${cmakefile} clean\n`);
        return true;
    }

    private buildVolumeInfo():String{
        let dogaratsu:Boolean = vscode.workspace.getConfiguration().get(constants.DORAGASU_IMAGE,false);
        let volumeInfo ="/src";
        if(dogaratsu){
           volumeInfo="/m68k -t";
        }
        return `"%CD%":${volumeInfo}`;
    }
    


}