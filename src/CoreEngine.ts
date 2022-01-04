import * as vscode from 'vscode';
import { WIN32 } from './constants';
import { AppModelWin32 } from './IAppModelWin32';


export class CoreEngine{

    private terminal:vscode.Terminal;
    private internalCoreWin32:AppModelWin32;
    private platform: string;

    public constructor(terminal:vscode.Terminal, extensionPath: string){
        this.terminal=terminal;
        this.internalCoreWin32=new AppModelWin32(this.terminal,extensionPath);
        this.platform=process.platform.toString();
    }

    public compile():boolean{
        switch(this.platform){
            case WIN32:
                return this.internalCoreWin32.compileProject(true);
        }
        return false;
    }

    public clean():boolean{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.cleanProject();
        }
        return false;
    }

    public create(rootPath:vscode.Uri): vscode.Uri| undefined{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.createProject(rootPath);
        }
        return undefined;
    }

    public compileAndRun():boolean{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.compileAndRunProject();
        }
        return false;
    }

    public run():boolean{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.runProject(false);
        }
        return false;
    }

    public compile4Debug():boolean{
        switch(this.platform){
            case WIN32:
                return  this.internalCoreWin32.compileForDebugging();
        }
        return false;
    }

    public tmxImport(tmxFilePath:vscode.Uri){
        this.internalCoreWin32.importTmxFile(tmxFilePath);
    }

    public tmxJsonImport(tmxJsonFilePath:vscode.Uri){
        this.internalCoreWin32.importTmxFile(tmxJsonFilePath);
    }

    public setRunPath(uri:string){
        this.internalCoreWin32.setRunPath(uri);
    }

    public deactivate(){
        this.terminal.dispose();
    }
}