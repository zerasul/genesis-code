import path = require("path");
import * as vscode from "vscode";
import { DOCKER, DOCKERTAG, GENS_PATH, MAKEFILE, MARSDEV, MARSDEV_ENV, SGDK_GENDEV, TOOLCHAINTYPE, DORAGASU_IMAGE } from "./constants";
import { AppModel } from "./IAppModel";
import * as Path from "path";
import * as fs from "fs";



export class AppModelDarwin extends AppModel{


    public cleanProject(): boolean {
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        let makefile = vscode.workspace.getConfiguration().get(MAKEFILE);
        switch(toolchainType){
            case SGDK_GENDEV:
                return this.cleanSGDKGenDev();
            case MARSDEV:
                return this.cleanMarsDev(makefile);
            case DOCKER:
                return this.cleanDocker();
        }
        return false;

    }
    private cleanSGDKGenDev(): boolean {
        let currentdir = (vscode.workspace.workspaceFolders !== undefined) ? vscode.workspace.workspaceFolders[0].uri : undefined;
        this.copybuildmacos(currentdir);
        this.terminal.sendText("WINEPREFIX=$GENDEV/wine wine64 cmd /C %cd%\\\\build.bat clean && ",false);
        this.terminal.sendText("echo 'This is a deprecated Feature. Change to Docker or Marsdev'");
        return true;
    }
    private cleanMarsDev(makefile: unknown): boolean {
        this.setmarsdevenv();
        let make = (makefile!=='')?`-f ${makefile}`: ' ';
        this.terminal.sendText(`make ${make} clean`);
        return true;
    }
    private cleanDocker(): boolean {
        let tag = vscode.workspace.getConfiguration().get(DOCKERTAG);
        let dockerTag = tag !== "" ? tag : "sgdk";
        let volumeInfo = this.buildVolumeInfo();
        this.terminal.sendText(`docker run --rm -v ${volumeInfo} -u $(id -u):$(id -g) ${dockerTag} clean`);
        return true;
    }


    private setmarsdevenv() {
        let marsdev = vscode.workspace.getConfiguration().get(MARSDEV_ENV);
        this.terminal.sendText("export MARSDEV=" + marsdev, true);
    }

    /**
     * copy the current build.bat program for run it with wine.
     * @param rootPath current main path
     */
     private copybuildmacos(rootPath: vscode.Uri | undefined) {
        if (rootPath !== undefined) {
            if (!fs.existsSync(Path.join(rootPath.fsPath, "build.bat"))) {
                let buildbatpath = Path.join(this.extensionPath, "resources", "build.bat");
                let buildcurrentpath = Path.join(rootPath.fsPath, "build.bat");
                fs.copyFileSync(buildbatpath, buildcurrentpath);
            }
        }
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
        if (!fs.existsSync(vscodedirpath)) {
            fs.mkdirSync(vscodedirpath);
            this.createlaunchjsonFile(vscodedirpath,this.extensionPath);
            this.createsettingsjsonFile(vscodedirpath,this.extensionPath);
        }
        let makefiletemppath = Path.join(this.extensionPath, "resources", "Makefile.template");
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        if (toolchainType === MARSDEV) {
            fs.copyFileSync(makefiletemppath, Path.join(rootPath.fsPath, "Makefile"));
            //add boot directory
            fs.mkdirSync(Path.join(rootPath.fsPath, "boot"));
            fs.copyFileSync(Path.join(this.extensionPath, "resources", "boot", "sega.s.template"), Path.join(rootPath.fsPath, "boot", "sega.s"));
            fs.copyFileSync(Path.join(this.extensionPath, "resources", "boot", "rom_head.c.template"), Path.join(rootPath.fsPath, "boot", "rom_head.c"));
        }
        
         //add git repository to the project
         this.terminal.sendText("cd \"" + rootPath.fsPath + "\" && git init");
        return rootPath;
    }
    private createsettingsjsonFile(vscodepath: string, extensionPath: string) {
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        if (toolchainType === MARSDEV) {
            let sourcefile = Path.join(extensionPath, "resources", "ccppsettings.linuxmarsdev.template");
            fs.copyFileSync(sourcefile, Path.join(vscodepath, "settings.json"));
        } else if (toolchainType === SGDK_GENDEV || toolchainType===DOCKER) {
            let sourcefile = Path.join(extensionPath, "resources", "ccppsettings.macossgdk.template");
            fs.copyFileSync(sourcefile, Path.join(vscodepath, "settings.json"));
        }    
    }
    private createlaunchjsonFile(vscodepath: string, extensionPath: string) {
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        if (toolchainType === MARSDEV) {
            let sourcefile = Path.join(extensionPath, "resources", "launch.json.linuxmarsdev.template");
            fs.copyFileSync(sourcefile, Path.join(vscodepath, "launch.json"));
        } else if (toolchainType === SGDK_GENDEV || toolchainType===DOCKER) {
            let sourcefile = Path.join(extensionPath, "resources", "launch.json.macossgdk.template");
            fs.copyFileSync(sourcefile, Path.join(vscodepath, "launch.json"));
        }    
    }
    public compileProject(newLine: boolean=true, withArg: string='release'): boolean {
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        switch(toolchainType){
            case SGDK_GENDEV:
                return this.compileProjectSGDK(newLine,withArg);
            case MARSDEV:
                return this.compileProjectMarsDev(newLine,withArg);
            case DOCKER:
                return this.compileProjectDocker(newLine,withArg);
        }

        return false;

    }
    private compileProjectSGDK(newLine: boolean, withArg: string): boolean {
        let currentdir = (vscode.workspace.workspaceFolders !== undefined) ? vscode.workspace.workspaceFolders[0].uri : undefined;
        this.copybuildmacos(currentdir);            
        this.terminal.sendText(`WINEPREFIX=$GENDEV/wine wine64 cmd /C %cd%\\\\build.bat release ${withArg}`, false);
        this.terminal.sendText(" && echo 'This is a deprecated Feature. Change to Docker or Marsdev'", newLine);
        return true;
    }
    private compileProjectMarsDev(newLine: boolean, withArg: string): boolean {
        this.setmarsdevenv();
        let makefile = vscode.workspace.getConfiguration().get(MAKEFILE);
        let mkfile = (makefile !== "") ? `-f ${makefile}` : " ";
        this.terminal.sendText(`make ${mkfile}  clean ${withArg}`, newLine);
        return true;
    }
    private compileProjectDocker(newLine: boolean, withArg: string): boolean {
        let tag = vscode.workspace.getConfiguration().get(DOCKERTAG);
        let dockerTag = tag !== "" ? tag : "sgdk";
        let volumeInfo = this.buildVolumeInfo();
        this.terminal.sendText(`docker run --rm -v ${volumeInfo} -u $(id -u):$(id -g) ${dockerTag} ${withArg}` , newLine);
        return true;    
    }
    public compileAndRunProject(): boolean {
        this.compileProject(false, 'release');
        this.terminal.sendText(" && ");
        return this.runProject(true);
    }
    public runProject(newLine: boolean): boolean {
        let genspath = vscode.workspace.getConfiguration().get(GENS_PATH);
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        let romPath = (toolchainType=== MARSDEV)? "$PWD/rom.bin":"$PWD/out/rom.bin";
        let command = `${genspath} "${romPath}"`;
        this.terminal.sendText(`${command} &`,newLine);
        return true;
    }
    public compileForDebugging(): boolean {
      return this.compileProject(true,'debug');
    }

    private buildVolumeInfo():String{
        let dogaratsu:Boolean = vscode.workspace.getConfiguration().get(DORAGASU_IMAGE,false);
        let volumeInfo ="/src";
        if(dogaratsu){
            volumeInfo="/m68k -t";
        }
        return `\"$PWD\":${volumeInfo}`;
    }

}