// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as Path from 'path';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "genesis-code" is now active!');
	// adding a status bar element 
	let varitem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left,1);
	varitem.text="Genesis Code Ready";
	varitem.show();
	//adding the common gens-code terminal where all the commands will be executed.
	let terminal = vscode.window.createTerminal("gens-code");
	terminal.show(true);
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.cleancode', () => {

		console.log("current platform is: "+process.platform);
		
		if(process.platform.toString() === 'win32')
		{
			//Windows
			terminal.sendText("%GDK%\\bin\\make -f %GDK%\\makefile.gen clean\n");
		}else if(process.platform.toString() === 'linux')
		{
			//linux
			terminal.sendText("make -f $GENDEV/sgdk/mkfiles/makefile.gen clean\n");
		}else
		{
			vscode.window.showWarningMessage("Operating System not yet supported");
		}
		
	});
	//Create Project Command; create a new Project for SGDK
	let disposablecreate = vscode.commands.registerCommand('extension.createproject', () =>{
		//First, select the folder where the project will be created
		vscode.window.showOpenDialog({
			canSelectFiles: false,
			canSelectFolders: true,
			canSelectMany: false
		}).then(r =>{
			if(r!== undefined){
				let uripath = createproject(r[0]);
				let uri = vscode.Uri.file(uripath.fsPath);
				let sucess = vscode.commands.executeCommand('vscode.openFolder', uri);
				if( sucess){
					vscode.window.showInformationMessage("Created New SGDK Project");
				}
			}
		});
	});
	context.subscriptions.push(disposable);
	context.subscriptions.push(disposablecreate);
}

/**
 * Create a new Project for SGDK. Create on a specific folder, three subfolders called _src_, _inc_ and _res_.
 * @param projectPath Root Path for the project
 * @returns Initial Project folder
 */
export function createproject(projectPath: vscode.Uri): vscode.Uri
{
	let sourcepath = Path.join(projectPath.fsPath, "src");
	if(!fs.existsSync(sourcepath)){
		fs.mkdirSync(sourcepath);
	}
	let includePath = Path.join(projectPath.fsPath, "inc");
	if(!fs.existsSync(includePath)){
		fs.mkdirSync(includePath);
	}
	let resourcePath = Path.join(projectPath.fsPath, "res");
	if(!fs.existsSync(resourcePath)){
		fs.mkdirSync(resourcePath);
	}
	return projectPath;
}
// this method is called when your extension is deactivated
export function deactivate() {
	
}
