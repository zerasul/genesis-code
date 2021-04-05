import { env } from 'process';
import * as vscode from 'vscode'

export class ImagePreviewDocument extends vscode.Disposable implements vscode.CustomDocument{

    constructor(uri: vscode.Uri){
        super(ImagePreviewDocument._disposable);
        this.uri=uri;
    }

    uri: vscode.Uri;
    
    private static _disposable(){
        
    }

    dispose(){
        super.dispose()
    }
    
}

export class ImagePreviewProvider implements vscode.CustomReadonlyEditorProvider<ImagePreviewDocument>{

    openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): ImagePreviewDocument | Thenable<ImagePreviewDocument> {
        
        return new ImagePreviewDocument(uri);
    }
    resolveCustomEditor(document: ImagePreviewDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void | Thenable<void> {
        webviewPanel.webview.html="<html><head></head><body>"+
        "<h1>imagefile.png</h1>"+
        "<div id='image'></div><div>"+
        "<div id='details'>"+
        "<h2>Image Details</h2>"+
        "</div><div id='palette'><h2>Image Palette</h2></div></div>"+
        "</body></html>"
    }
}