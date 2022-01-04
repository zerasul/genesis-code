import * as vscode from 'vscode';
import { LINUX, WIN32 } from './constants';
import { AppModelLinux } from './IAppModelLinux';
import { AppModelWin32 } from './IAppModelWin32';


export class CoreEngine{

    private terminal:vscode.Terminal;
    private internalCoreWin32:AppModelWin32;
    private internalCoreLinux: AppModelLinux;
    private platform: string;

    public constructor(terminal:vscode.Terminal, extensionPath: string){
        this.terminal=terminal;
        let statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        statusBar.text = "Genesis Code Ready";
        statusBar.show();
        this.internalCoreWin32=new AppModelWin32(this.terminal,extensionPath);
        this.internalCoreLinux=new AppModelLinux(this.terminal,extensionPath);
        this.platform=process.platform.toString();
    }

    public compile():boolean{
        switch(this.platform){
            case WIN32:
                return this.internalCoreWin32.compileProject(true);
            case LINUX:
                return this.internalCoreLinux.compileProject(true);
        }
        return false;
    }

    public clean():boolean{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.cleanProject();
            case LINUX:
                return this.internalCoreLinux.cleanProject();
        }
        return false;
    }

    public create(rootPath:vscode.Uri): vscode.Uri| undefined{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.createProject(rootPath);
            case LINUX:
                return this.internalCoreLinux.createProject(rootPath);
        }
        return undefined;
    }

    public compileAndRun():boolean{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.compileAndRunProject();
            case LINUX:
                return this.internalCoreLinux.compileAndRunProject();
        }
        return false;
    }

    public run():boolean{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.runProject(false);
            case LINUX:
                return this.internalCoreLinux.runProject(false);
        }
        return false;
    }

    public compile4Debug():boolean{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.compileForDebugging();
            case LINUX:
                return this.internalCoreLinux.compileForDebugging();
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