import { readFileSync,createReadStream } from 'fs';
import * as Path from 'path';
import * as imagesize from 'image-size';
import * as vscode from 'vscode';
let imageJS = require('imagejs');



export class ImagePreviewDocument extends vscode.Disposable implements vscode.CustomDocument{

    constructor(uri: vscode.Uri){
        super(ImagePreviewDocument._disposable);
        this.uri=uri;
        this.filename=Path.basename(this.uri.fsPath);
        this.imagedata=readFileSync(uri.fsPath);
        this.imagedatab64= ImagePreviewDocument.convertB64(this.imagedata);
        let imagesizes = imagesize.imageSize(this.imagedata);
        this.width=imagesizes.width;
        this.height=imagesizes.height;
        this.bitmap = new imageJS.Bitmap();
      
    }

    uri: vscode.Uri;
    width: number|undefined;
    height: number|undefined;
    imagedatab64:any;
    imagedata:Buffer;
    filename:String;
    bitmap: any;
    palette: any;

    private static _disposable(){
        
    }

    private static convertB64(imagedata:Buffer){
        
        let base64String=imagedata.toString('base64');
        return base64String;
    }
    dispose(){
        super.dispose();
    }
    
}

export class ImagePreviewProvider implements vscode.CustomReadonlyEditorProvider<ImagePreviewDocument>{

    extensionContext:vscode.ExtensionContext;

    constructor(context:vscode.ExtensionContext){
        this.extensionContext=context;
    }
    openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): ImagePreviewDocument | Thenable<ImagePreviewDocument> {
        
        return new ImagePreviewDocument(uri);
    }
    resolveCustomEditor(document: ImagePreviewDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void | Thenable<void> {
        let imageuri="data:image/png;base64 ,"+document.imagedatab64;
        
        let width = document.width;
        let height = document.height;
        let tilesw = (document.width!==undefined)?document.width/8:0;
        let tilesh = (document.height!==undefined)?document.height/8:0;
        let filename= document.filename;
        let htmltemplate= readFileSync(Path.join(this.extensionContext.extensionPath , "resources","imageviewer.html")).toLocaleString();
        
        htmltemplate=htmltemplate.replace(new RegExp("{{filename}}", 'g'), ""+filename);
        htmltemplate=htmltemplate.replace(new RegExp("{{imageuri}}", 'g'),imageuri);
        htmltemplate=htmltemplate.replace(new RegExp("{{width}}", 'g'), String(width));
        htmltemplate=htmltemplate.replace(new RegExp("{{height}}", 'g'),String(height));
        htmltemplate=htmltemplate.replace(new RegExp("{{tilesw}}", 'g'),String(tilesw));
        htmltemplate=htmltemplate.replace(new RegExp("{{tilesh}}", 'g'),String(tilesh));
        document.bitmap.readFile(document.uri.fsPath).then(() =>{
            this.parsePalette(document.bitmap,webviewPanel.webview);
        })
        .catch(() =>{
            console.log("ERROR");
        });
        webviewPanel.webview.html=htmltemplate;
    }

    private parsePalette(bitmap: any, webView:vscode.Webview){
        let palette = new Set<String>();
        for (let index = 0; index < bitmap.width;index++){
            for(let index2=0; index2<bitmap.height;index2++){
                let color = bitmap.getPixel(index,index2);
                palette.add(JSON.stringify(color));
            }
        }
        let htmlcolours:string=this.generateHtmlGrid(palette);
        let html=webView.html;
        html=html.replace(new RegExp("Loading Palette...",'g'), htmlcolours);
        webView.html=html;  
    }

    private generateHtmlGrid(palette:Set<String>):string{
        let html:string=`<p>${palette.size} Colours</p>`;
        html+="<div class='grid-container'>";
        palette.forEach(element=> {
            let {a,r,g,b}=JSON.parse(element as string);
            let htmlelement=`<div class="grid-element" style="background-color:rgba(${r},${g},${b},${a});"></div>`;
            html+=htmlelement;
        });
        html+="</div>";
        return html;
    }
   
}
class ColorPalette {

    constructor(public r:number,
        public g:number,
        public b:number) {
        
    }

    public equals(another:ColorPalette):boolean{
        return JSON.stringify(this)===JSON.stringify(another);
    }
}