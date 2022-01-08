import * as vscode from 'vscode';
import { LINUX, MACOS, WIN32 } from './constants';
import { AppModelDarwin } from './IAppModelDarwin';
import { AppModelLinux } from './IAppModelLinux';
import { AppModelWin32 } from './IAppModelWin32';


export class CoreEngine{

    private terminal:vscode.Terminal;
    private internalCoreWin32:AppModelWin32;
    private internalCoreLinux: AppModelLinux;
    private internalCoreMacOs: AppModelDarwin;
    private platform: string;

    public constructor(terminal:vscode.Terminal, extensionPath: string){
        this.terminal=terminal;
        let statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        statusBar.text = "Genesis Code Ready";
        statusBar.show();
        this.internalCoreWin32=new AppModelWin32(this.terminal,extensionPath);
        this.internalCoreLinux=new AppModelLinux(this.terminal,extensionPath);
        this.internalCoreMacOs=new AppModelDarwin(this.terminal,extensionPath);
        this.platform=process.platform.toString();
    }

    public compile():boolean{
        switch(this.platform){
            case WIN32:
                return this.internalCoreWin32.compileProject(true);
            case LINUX:
                return this.internalCoreLinux.compileProject(true);
            case MACOS:
                return this.internalCoreMacOs.compileProject(true);
           
        }
        return false;
    }

    public clean():boolean{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.cleanProject();
            case LINUX:
                return this.internalCoreLinux.cleanProject();
            case MACOS:
                return this.internalCoreMacOs.cleanProject();
        }
        return false;
    }

    public create(rootPath:vscode.Uri): vscode.Uri| undefined{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.createProject(rootPath);
            case LINUX:
                return this.internalCoreLinux.createProject(rootPath);
            case MACOS:
                return this.internalCoreMacOs.createProject(rootPath);
        }
        return undefined;
    }

    public compileAndRun():boolean{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.compileAndRunProject();
            case LINUX:
                return this.internalCoreLinux.compileAndRunProject();
            case MACOS:
                return this.internalCoreMacOs.compileAndRunProject();
        }
        return false;
    }

    public run():boolean{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.runProject(true);
            case LINUX:
                return this.internalCoreLinux.runProject(true);
            case MACOS:
                return this.internalCoreMacOs.runProject(true);
        }
        return false;
    }

    public compile4Debug():boolean{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.compileForDebugging();
            case LINUX:
                return this.internalCoreLinux.compileForDebugging();
            case MACOS:
                return this.internalCoreMacOs.compileForDebugging();
        }
        return false;
    }

    public tmxImport(tmxFilePath:vscode.Uri){
        this.internalCoreWin32.importTmxFile(tmxFilePath);
    }

    public tmxJsonImport(tmxJsonFilePath:vscode.Uri){
        this.internalCoreWin32.importJsonTmxFile(tmxJsonFilePath);
    }

    public setRunPath(uri:string){
        this.internalCoreWin32.setRunPath(uri);
    }

    public deactivate(){
        this.terminal.dispose();
    }
}