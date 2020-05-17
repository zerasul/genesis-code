/**
 * (C) 2020. This code is under MIT license.
 * You can get a copy of the license with this software.
 * For more information please see https://opensource.org/licenses/MIT 
 */

import * as xmlparser from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';




/**
 * Class tmxParser: this class reads a TMX File and parse it into a C Header File.
 * 
 * @copyright 2020
 * 
 * @author Victor Suarez <zerasul@gmail.com>
 */
export class TmxParser {

    /**
     * Parse a TMX file and return the TMX information
     * @param file tmx file path
     * 
     * @returns TMX Object Information
     */
    public static parseTmxFile(file: string): TMX {
        let content = fs.readFileSync(file).toLocaleString();
        let json = xmlparser.parse(content, { ignoreAttributes: false, ignoreNameSpace: true });
        //GetMapName
        let start = file.lastIndexOf(path.sep) + 1;
        let filename = file.substr(start, file.lastIndexOf(".") - start);
        let tmx = this.parseJSON(json);
        tmx.map.file = filename;
        return tmx;
    }

    /**
     * Parse a json with the TMX information
     * @param json json object with the TMX information
     * 
     * @returns TMX object information 
     */
    public static parseJSON(json: any): TMX {
        let tmx = new TMX();
        tmx.map.version = json.map['@_version'];
        tmx.map.tiledVersion = json.map['@_tiledversion'];
        tmx.map.orientation = json.map['@_orientation'];
        tmx.map.renderorder = json.map['@_renderorder'];
        tmx.map.compressionlevel = (json.map['@_compressionlevel'] !== null) ? json.map['@_compressionlevel'] : -1;
        tmx.map.width = Number(json.map['@_width']);
        tmx.map.height = Number(json.map['@_height']);
        tmx.map.tilewidth = Number(json.map['@_tilewidth']);
        tmx.map.tileheight = Number(json.map['@_tileheight']);
        tmx.map.hexsidelength = Number(json.map['@_hexsidelength']);
        tmx.map.infinite = json.map['@_infinite'];
        tmx.map.nextlayerid = Number(json.map['@_nextlayerid']);
        tmx.map.nextobjectid = Number(json.map['@_nextobjectid']);
        //layer
        tmx.map.layer[0].id = Number(json.map.layer['@_id']);
        tmx.map.layer[0].width = Number(json.map.layer['@_width']);
        tmx.map.layer[0].height = Number(json.map.layer['@_height']);
        tmx.map.layer[0].name = json.map.layer['@_name'];
        tmx.map.layer[0].data.data = json.map.layer.data['#text'];
        tmx.map.layer[0].data.encoding = json.map.layer.data['@_encoding'];
        return tmx;
    }

}

/**
 * Class TMX: TMX format information
 * 
 * @copyright 2020
 * 
 * @author Victor Suarez <zerasul@gmail.com>
 */
export class TMX {
    private _map: any = {
        version: '1.0',
        file: '',
        tiledVersion: '1.0.1',
        orientation: 'orthogonal',
        renderorder: 'right-down',
        compressionlevel: -1,
        width: 0,
        height: 0,
        tilewidth: 8,
        tileheight: 8,
        hexsidelength: 0,
        infinite: "0",
        nextlayerid: 0,
        nextobjectid: 0,
        layer: [{
            id: 0,
            width: 0,
            height: 0,
            name: "my layer",
            data: {
                encoding: "csv",
                data: ""
            }
        }]
    };


    public get map(): any {
        return this._map;
    }

    public set map(v: any) {
        this._map = v;
    }

    public writeHeaderFile(directoryPath: string, templatePath: string) {
        let strfile = fs.readFileSync(templatePath).toLocaleString();
        let currdate = new Date();
        let formatedDate = currdate.getFullYear() + "-" + (currdate.getMonth() + 1) + "-" + currdate.getDate();
        strfile = strfile.replace(new RegExp("{{date}}"), formatedDate);
        strfile = strfile.replace(new RegExp("{{file}}", 'g'), this._map.file);
        strfile = strfile.replace(new RegExp("{{fileMap}}", 'g'), this._map.file.toUpperCase());
        strfile = strfile.replace(new RegExp("{{width}}", 'g'), this._map.width);
        strfile = strfile.replace(new RegExp("{{height}}", 'g'), this._map.height);
        strfile = strfile.replace(new RegExp("{{tilewidth}}", 'g'), this._map.tilewidth);
        strfile = strfile.replace(new RegExp("{{tileheight}}", 'g'), this._map.tileheight);
        strfile = strfile.replace(new RegExp("{{numLayers}}", 'g'), this.map.layer.length);
        strfile = strfile.replace(new RegExp("{{layerid}}", 'g'), this.map.layer[0].id);
        strfile = strfile.replace(new RegExp("{{name}}", 'g'), this.map.layer[0].name);

        let numData = 1;
        let csv = '';
        if (this.map.layer[0].data.encoding === 'csv') {
            csv = this.map.layer[0].data.data;
            numData = this.map.layer[0].data.data.split(",").length.toString();
        } else {
            //Base 64
            if (this.map.layer[0].data.encoding === 'base64') {
                let buff = new Buffer(this.map.layer[0].data.data, 'base64');
                for (let index = 0; index < buff.length; index += 4) {
                    csv += buff.readUInt32LE(index) + ",";
                }
                csv = csv.substring(0, csv.lastIndexOf(",") - 2);
                numData = csv.split(",").length;
            }
        }
        strfile = strfile.replace(new RegExp("{{data}}", 'g'), "{" + csv + "}");
        strfile = strfile.replace(new RegExp("{{numData}}", 'g'), numData.toString());
        fs.writeFileSync(path.join(directoryPath, this._map.file + "Map.h"), strfile, {
            flag: 'w'
        });
    }
}
