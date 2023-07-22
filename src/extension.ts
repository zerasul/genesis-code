/**
 * (C) 2020. This code is under MIT license.
 * You can get a copy of the license with this software.
 * For more information please see https://opensource.org/licenses/MIT 
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CodeProvider } from './codeProvider';
import * as Path from 'path';
import * as fs from 'fs';
import { ImagePreviewProvider } from './imagePreviewProvider';
import { CoreEngine } from './CoreEngine';


let appModel: CoreEngine;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	appModel= new CoreEngine(context.extensionPath);
	let codeprovider = CodeProvider.getCodeProviderInstance(context);
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "genesis-code" is now active!');
	// adding a status bar element 
	// Add code completion for sgdk files
	let codecompletion = vscode.languages.registerCompletionItemProvider('Sgdk Resource File', {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, newcontext: vscode.CompletionContext) {


			return codeprovider;
		}
	});
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.cleancode', () => {

		console.log("current platform is: " + process.platform);
		console.log(appModel.clean());


	});
	//Create Project Command; create a new Project for SGDK
	let disposablecreate = vscode.commands.registerCommand('extension.createproject', () => {
		//First, select the folder where the project will be created
		vscode.window.showOpenDialog({
			canSelectFiles: false,
			canSelectFolders: true,
			canSelectMany: false
		}).then(r => {
			if (r !== undefined) {
				let uripath = appModel.create(r[0]);
				vscode.commands.executeCommand('vscode.openFolder', uripath).
				then((value) => 
					{if(value)
						{vscode.window.showInformationMessage("Created New SGDK Project");}});

			}
		});
	});
	// Compiple Command;
	let disposableCompile = vscode.commands.registerCommand('extension.compileproject', () => {
		appModel.compile();
	});
	//Set gens emulator path
	let disposablesetpath = vscode.commands.registerCommand('extension.setrunpath', () => {
		vscode.window.showInputBox({
			placeHolder: 'Please insert Gens Emulator Command',
			value: vscode.workspace.getConfiguration().get("gens.path")
		}).then(r => {
			if (r !== undefined) {
				appModel.setRunPath(r);
			}
		});
	});
	//Run the current rom with the gens emulator
	let disposableRun = vscode.commands.registerCommand('extension.runproject', () => {
		appModel.run();
	});

	// Compiles and then run the current rom with the gens emulator
	let disposableCompileAndRun = vscode.commands.registerCommand('extension.compileandrunproject', () => {
		appModel.compileAndRun();
	});

	let disposableCompile4debugging = vscode.commands.registerCommand('extension.compile4debug', () => {
		appModel.compile4Debug();
	});

	let disposableimportTmx = vscode.commands.registerCommand('extension.tmximport', () => {
		vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: false,
			filters: {
				'TmxFiles': ['tmx']
			}
		}).then(f => {
			if (f !== undefined) {
				appModel.tmxImport(f[0]);
			}
		});
	});

	let disposableImportJsonTmx = vscode.commands.registerCommand('extension.tmxjsonimport', () => {
		vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: false,
			filters: {
				'TmxJsonFiles': ['json']
			}
		}).then(f => {
			if (f !== undefined) {
				appModel.tmxJsonImport(f[0]);
			}
		});
	});

	let disposableAbout = vscode.commands.registerCommand('extension.aboutgenscode', () =>{
		const column = vscode.window.activeTextEditor? vscode.window.activeTextEditor.viewColumn:undefined;
		const panel = vscode.window.createWebviewPanel('about', "About Genesis Code",column || vscode.ViewColumn.One,{enableScripts:true});
		const strabouthtmlpath = Path.join(context.extensionPath , "resources", "about.html");
		panel.webview.html= fs.readFileSync(strabouthtmlpath).toLocaleString();
		panel.reveal();
	});

	let diposablecursomEditor = vscode.window.registerCustomEditorProvider("genesiscode.imageViewer",
	new ImagePreviewProvider(context));
	context.subscriptions.push(disposable);
	context.subscriptions.push(disposablecreate);
	context.subscriptions.push(disposableCompile);
	context.subscriptions.push(disposablesetpath);
	context.subscriptions.push(disposableRun);
	context.subscriptions.push(disposablesetpath);
	context.subscriptions.push(disposableCompileAndRun);
	context.subscriptions.push(codecompletion);
	context.subscriptions.push(disposableCompile4debugging);
	context.subscriptions.push(disposableimportTmx);
	context.subscriptions.push(disposableImportJsonTmx);
	context.subscriptions.push(disposableAbout);
	context.subscriptions.push(diposablecursomEditor);
}



// this method is called when your extension is deactivated
export function deactivate() {
	appModel.deactivate();
}
