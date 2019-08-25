// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


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
		
		if(process.platform.toString() == 'win32')
		{
			//Windows
			terminal.sendText("%GDK%\\bin\\make -f %GDK%\\makefile.gen clean\n");
		}else if(process.platform.toString() == 'linux')
		{
			//linux
			terminal.sendText("make -f $GENDEV\\sgdk\\mkfiles\\makefile.gen clean\n");
		}else
		{
			vscode.window.showWarningMessage("Operating System not yet supported");
		}
		
	});
	context.subscriptions.push(disposable);
}


// this method is called when your extension is deactivated
export function deactivate() {}
