/**
 * (C) 2020. This code is under MIT license.
 * You can get a copy of the license with this software.
 * For more information please see https://opensource.org/licenses/MIT 
 */

import * as xmlparser from 'fast-xml-parser';
import * as fs from 'fs';

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
        return this.parseJSON(json);
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
        tmx.map.heigth = Number(json.map['@_height']);
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
        tiledVersion: '1.0.1',
        orientation: 'orthogonal',
        renderorder: 'right-down',
        compressionlevel: -1,
        width: 0,
        heigth: 0,
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

    public writeHeaderFile(directoryPath: string) {


    }
}
