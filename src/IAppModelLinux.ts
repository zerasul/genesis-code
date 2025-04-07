import * as vscode from "vscode";
import { DEFAULT_GENDEV_SGDK_MAKEFILE, DOCKER, DOCKERTAG, GENDEV_ENV, GENS_PATH, MAKEFILE, MARSDEV, MARSDEV_ENV, SGDK_GENDEV, TOOLCHAINTYPE, DORAGASU_IMAGE } from "./constants";
import { AppModel } from "./IAppModel";
import * as constants from "./constants";
import * as Path from 'path';
import * as fs from 'fs';


export class AppModelLinux extends AppModel{


    public cleanProject(): boolean {
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        let makefile = vscode.workspace.getConfiguration().get(MAKEFILE);
        switch(toolchainType){
            case SGDK_GENDEV:
                return this.cleanProjectSgdk(makefile);
            case MARSDEV:
                return this.cleanProjectMarsDev(makefile);
            case DOCKER:
                return this.cleanProjectDocker();
            default:
                return false;
        }
    

    }
    cleanProjectDocker(): boolean {
        let tag = vscode.workspace.getConfiguration().get(DOCKERTAG);
        let dockerTag = tag !== "" ? tag : constants.SGDK_DEFAULT_DOCKER_IMAGE;
        let volumeInfo = this.buildVolumeInfo();
        this.getTerminal().sendText(`docker run --rm -v ${volumeInfo} -u $(id -u):$(id -g) ${dockerTag} clean`);
        return true;
    }    
    cleanProjectMarsDev(makefile:unknown): boolean {
        this.setmardevenv();
        let mkfile = (makefile !== "") ? "-f " + makefile : " ";
        this.getTerminal().sendText(`make ${mkfile} clean`);
        return true;    }

    setmardevenv() {
        let marsdev = vscode.workspace.getConfiguration().get(MARSDEV_ENV);

        this.getTerminal().sendText(`export MARSDEV=${marsdev}`,true);
    }
    public createProject(rootPath: vscode.Uri): vscode.Uri {
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
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
            if (toolchainType === MARSDEV) {
                let sourcefile = Path.join(this.extensionPath, "resources", "launch.json.linuxmarsdev.template");
                fs.copyFileSync(sourcefile, Path.join(vscodedirpath, "launch.json"));
                let settingssourcefile = Path.join(this.extensionPath, "resources", "ccppsettings.linuxmarsdev.template");
                let fileContent:string = fs.readFileSync(settingssourcefile).toLocaleString();
                let configGendev:string= vscode.workspace.getConfiguration().get(MARSDEV_ENV,"${env:MARSDEV}");
                fileContent= fileContent.replace(/{{env:MARSDEV}}/g,configGendev);
                fs.writeFileSync(Path.join(vscodedirpath, "settings.json"),fileContent);
            } else if (toolchainType === SGDK_GENDEV || toolchainType===DOCKER) {
                let sourcefile = Path.join(this.extensionPath, "resources", "ccppsettings.linuxgendev.template");
                let fileContent:string = fs.readFileSync(sourcefile).toLocaleString();
                let configGendev:string= vscode.workspace.getConfiguration().get(GENDEV_ENV,"${env:GENDEV}");
                fileContent= fileContent.replace(/{{env:GENDEV}}/g,configGendev);
                fs.writeFileSync(Path.join(vscodedirpath, "settings.json"),fileContent); 
            }   
        }
        let makefiletemppath = Path.join(this.extensionPath, "resources", "Makefile.template");
        if (toolchainType === MARSDEV) {
            fs.copyFileSync(makefiletemppath, Path.join(rootPath.fsPath, "Makefile"));
            //add boot directory
            fs.mkdirSync(Path.join(rootPath.fsPath, "boot"));
            fs.copyFileSync(Path.join(this.extensionPath, "resources", "boot", "sega.s.template"), Path.join(rootPath.fsPath, "boot", "sega.s"));
            fs.copyFileSync(Path.join(this.extensionPath, "resources", "boot", "rom_head.c.template"), Path.join(rootPath.fsPath, "boot", "rom_head.c"));
        }
        
         //add git repository to the project
         this.getTerminal().sendText("cd \"" + rootPath.fsPath + "\" && git init");
         return rootPath;
    }

    public compileProject(newLine: boolean=true, withArg: string="release"): boolean {
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        let makefile:string = vscode.workspace.getConfiguration().get(MAKEFILE,DEFAULT_GENDEV_SGDK_MAKEFILE);
        switch(toolchainType){
            case SGDK_GENDEV:
                return this.compilesgdk(newLine,withArg, makefile);
            case MARSDEV:
                return this.compileMarsDev(newLine,withArg,makefile);
            case DOCKER:
                return this.compileDocker(newLine, withArg);
        }
        return false;
    }
    compileDocker(newLine: boolean, withArg: string): boolean {
        let tag = vscode.workspace.getConfiguration().get(DOCKERTAG);

        let dockerTag = tag !== "" ? tag : constants.SGDK_DEFAULT_DOCKER_IMAGE;
        let volumeInfo = this.buildVolumeInfo();
        this.getTerminal().sendText(`docker run --rm -v ${volumeInfo} -u $(id -u):$(id -g) ${dockerTag} ${withArg}` , newLine);
        return true;
        }

    compileMarsDev(newLine: boolean=true, withArg: string, makefile:string): boolean {

        this.setmardevenv();
        let mkfile = (makefile !== "") ? "-f " + makefile : " ";
        let parallelCompile = vscode.workspace.getConfiguration().get(constants.PARALEL_COMPILE,constants.PARALLEL_COMPILE_DEFAULT);
        this.getTerminal().sendText(`make  ${mkfile} -j${parallelCompile} clean ${withArg}`, newLine);
        return true;
    }
    
    compilesgdk(newLine: boolean, withArg: string, makefile:string): boolean {
        let gendev = vscode.workspace.getConfiguration().get(GENDEV_ENV);
        let parallelCompile = vscode.workspace.getConfiguration().get(constants.PARALEL_COMPILE,constants.PARALLEL_COMPILE_DEFAULT);
        if (gendev !== "") {
            this.getTerminal().sendText(`export GENDEV=${gendev}`, true);
        }
        let cmakefile = (makefile !== "") ? makefile : DEFAULT_GENDEV_SGDK_MAKEFILE;
        this.getTerminal().sendText(`make -f ${cmakefile} -j${parallelCompile} ${withArg}`, newLine);   
        return true;
    }
    public compileAndRunProject(): boolean {
        this.compileProject(false);
        this.getTerminal().sendText(" && ");
        this.runProject(true);
        return true;
    }
    public runProject(newLine: boolean): boolean {
        let genspath = vscode.workspace.getConfiguration().get(GENS_PATH);
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        let romPath = (toolchainType=== MARSDEV)? "$PWD/rom.bin":"$PWD/out/rom.bin";
        let command = `${genspath} "${romPath}"`;
        this.getTerminal().sendText(`${command} &`, newLine);
        return true;
    }
    public compileForDebugging(): boolean {
        let toolchainType = vscode.workspace.getConfiguration().get(TOOLCHAINTYPE);
        if(toolchainType=== SGDK_GENDEV){
            vscode.window.showErrorMessage("Toolchain SGDK/GENDEV can't compile for Debugging in Linux. Change to Marsdev or Docker on configuration.");
            return false;
        }
        return this.compileProject(true,"debug");
    }
    
    private cleanProjectSgdk(makefile:unknown):boolean {
        let gendev = vscode.workspace.getConfiguration().get(GENDEV_ENV);
        if (gendev !== "") {
          this.getTerminal().sendText(`export GENDEV=${gendev}`, true);
        }
        //linux
        let cmakefile = (makefile !== "") ? makefile : DEFAULT_GENDEV_SGDK_MAKEFILE;
        this.getTerminal().sendText(`make -f ${cmakefile} clean\n`);
        return true;    }
    


    private buildVolumeInfo():string{
        let dogaratsu:boolean = vscode.workspace.getConfiguration().get(DORAGASU_IMAGE,false);
        let volumeInfo ="/src";
        if(dogaratsu){
            volumeInfo="/m68k -t";
        }
        return `"$PWD":${volumeInfo}`;
    }
}


