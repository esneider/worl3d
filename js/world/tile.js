/* global define */
/* jshint bitwise: false */

define(function() {

    'use strict';

    var slashPattern = /\/(\d+)\/(\d+)\/(\d+)/;
    var paramPattern = /([xyz])=(\d+)&([xyz])=(\d+)&([xyz])=(\d+)/i;
    var genericPattern = /(\d+)([^A-Za-z0-9])(\d+)\2(\d+)/;
    var replacePattern = /{{(p|x|y|z)}}/gi;

    var minLatitude = -85.05112878;
    var maxLatitude = 85.05112878;
    var minLongitude = -180;
    var maxLongitude = 180;

    var defaultParams = {
        format: 'wmts',
        urlPattern: '',
        urlPrefixes: [''],
        size: 256,
        minZ: 0,
        maxZ: 23
    };

    /**
     * Switch between TMS and WMTS y coordinates.
     *
     * @param {number} y - Old y coordinate.
     * @param {number} z - Zoom level.
     * @param {string} format - Tile format.
     * @return {number} New y coordinate.
     */
    function switchTms(y, z, format) {

        if (format === 'tms') {

            y = (1 << z) - y - 1;
        }

        return y;
    }

    /**
     * Limit a number to a specific range range.
     *
     * @param {number} n - Number to trim.
     * @param {number} min - Minimum possible value, included.
     * @param {number} max - Maximum possible value, included.
     * @returns {number} Trimmed number.
     */
    function rangeLimit(n, min, max) {

        return n < min ? min : (n > max ? max : n);
    }

    /**
     * Create a new tile.
     * The supported tile formats are:
     * <pre>
     * - ['wmts']{@link http://bit.ly/b5fn2j}
     * - ['google']{@link http://bit.ly/18xaPQy}
     * - ['tms']{@link http://bit.ly/17IFF5X}
     * </pre>
     * 'wmts' and 'google' are exactly the same. 'tms' differs just in where
     * the 0 for the y coordinate is.
     *
     * @name Tile
     * @constructor
     * @throws {Error} Invalid parameters.
     */
    function Tile() {

        switch (arguments.length) {

            case 0:
                this.x = this.y = this.z = 0;
                return;

            case 1:
                Tile.fromUrl.apply(this, arguments);
                return;

            case 2:
                Tile.fromLatLon.apply(this, arguments);
                return;

            case 3:
                Tile.fromXYZ.apply(this, arguments);
                return;

            default:
                throw new Error('Invalid parameters');
        }
    }

    /**
     * Create a new tile, which is determined by the coordinates x, y and the
     * zoom level z.
     *
     * @memberof Tile
     *
     * @param {number} x - Coordinate.
     * @param {number} y - Coordinate.
     * @param {number} z - Zoom level.
     */
    Tile.fromXYZ = function(x, y, z) {

        y = switchTms(y, z, this.format);
        x = rangeLimit(x, 0, (1 << z) - 1);
        y = rangeLimit(y, 0, (1 << z) - 1);

        var dif;

        if (z < this.minZ) {

            dif = this.minZ - z;
            x <<= dif;
            y <<= dif;
            z += dif;
        }

        if (z > this.maxZ) {

            dif = z - this.maxZ;
            x >>= dif;
            y >>= dif;
            z -= dif;
        }

        var tile = this instanceof Tile ? this : new this();

        tile.x = x;
        tile.y = y;
        tile.z = z;

        return tile;
    };

    /**
     * Create a new tile from string parameters.
     *
     * @param {string} x - Coordinate.
     * @param {string} y - Coordinate.
     * @param {string} z - Zoom level.
     * @returns {Tile} New tile.
     */
    function tileFromStrings(This, x, y, z) {

        x = parseInt(x, 10);
        y = parseInt(y, 10);
        z = parseInt(z, 10);

        return Tile.fromXYZ.call(This, x, y, z);
    }

    /**
     * Create a new tile from a tile url. The url information won't be stored,
     * just the coordinates.
     *
     * @memberof Tile
     *
     * @param {string} url - Url for the tile.
     * @returns {Tile} New tile.
     * @throws {Error} Invalid url.
     */
    Tile.fromUrl = function(url) {

        var res = slashPattern.exec(url);

        if (res !== null) {

            return tileFromStrings(this, res[2], res[3], res[1]);
        }

        res = paramPattern.exec(url);

        if (res !== null) {

            var args = {};

            args[res[1].toLowerCase()] = res[2];
            args[res[3].toLowerCase()] = res[4];
            args[res[5].toLowerCase()] = res[6];

            if ('x' in args && 'y' in args && 'z' in args) {

                return tileFromStrings(this, args.x, args.y, args.z);
            }
        }

        res = genericPattern.exec(url);

        if (res !== null) {

            return tileFromStrings(this, res[3], res[4], res[1]);
        }

        throw new Error('Invalid url');
    };

    /**
     * Create a new tile from a Microsoft QuadKey: {@link http://bit.ly/56kDpD}
     *
     * @memberof Tile
     *
     * @param {string} key - Base-4 number.
     * @returns {Tile} New tile.
     * @throws {Error} Invalid tile path.
     */
    Tile.fromQuadKey = function(key) {

        var t = new this();

        t.x = t.y = t.z = 0;

        return t.descendant(key);
    };

    /**
     * Create a new tile from geodetic coordinates (latitude and longitude in
     * degrees). The geodetic coordinates are expected to use the WGS84 datum.
     *
     * @memberof Tile
     *
     * @param {number} lat - Latitude.
     * @param {number} lon - Longitude.
     * @param {number} z - Zoom level.
     * @returns {Tile} New tile.
     */
    Tile.fromLatLon = function(lat, lon, z) {

        lat = rangeLimit(lat, minLatitude, maxLatitude);
        lon = rangeLimit(lon, minLongitude, maxLongitude);

        var x = (lon + 180) / 360;
        var s = Math.sin(lat * Math.PI / 180);
        var y = 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI);

        var size = this.size << z;

        x = ~~(rangeLimit(x * size /* + 0.5 */, 0, size - 1) / this.size);
        y = ~~(rangeLimit(y * size /* + 0.5 */, 0, size - 1) / this.size);

        return Tile.fromXYZ.call(this, x, y, z);
    };

    /**
     * Create a new tile from zoom plane coordinates (in pixels).
     *
     * @memberof Tile
     *
     * @param {number} x - Coordinate.
     * @param {number} y - Coordinate.
     * @param {number} z - Zoom level.
     * @returns {Tile} New tile.
     */
    Tile.fromPixel = function(x, y, z) {

        x = (x * this.size) >> z;
        y = (y * this.size) >> z;

        return Tile.fromXYZ.call(this, x, y, z);
    };

    /**
     * Extend an object's properties with another's.
     *
     * @param {object} target - Target object.
     * @param {object} source - Source object.
     */
    function extend(target, source) {

        for (var attr in source) {
            if (source.hasOwnProperty(attr)) {
                target[attr] = source[attr];
            }
        }
    }

    /**
     * Create a specialized constructor for Tile.
     *
     * @memberof Tile
     *
     * @param {object}  param
     * @param {number} [param.minZ=0] - Minimum zoom level (inclusive).
     * @param {number} [param.maxZ=23] - Maximum zoom level (inclusive).
     * @param {number} [param.size=256] - Size of (square) tile side.
     * @param {string} [param.format='wmts'] - See {@link Tile} documentation.
     * @param {string} [param.urlPattern=''] - Pattern for url building.
     * @param {string[]} [param.urlPrefixes=['']] - Possible url subdomains.
     * @returns {function} New tile constructor.
     *
     * @example
     * GoogleTile = Tile.extend({
     *     urlPattern: 'http://mt{{p}}.google.com/vt/x={{x}}&y={{y}}&z={{z}}',
     *     urlPrefixes: ['0','1','2','3'],
     *     format: 'google'
     * });
     * var g = new GoogleTile(2, 2, 2);
     */
    Tile.extend = function(param) {

        var _super = this;
        function Tile() { _super.apply(this, arguments); }

        Tile.prototype = new this();
        Tile.prototype.constructor = Tile;

        extend(Tile, this);
        extend(Tile, param);
        extend(Tile.prototype, this.prototype);
        extend(Tile.prototype, param);

        return Tile;
    };

    /**
     * Return a tile containing this one (lower zoom level).
     *
     * @memberof Tile
     *
     * @param {number} levels - How many zoom levels to traverse up.
     * @return {Tile} New tile.
     */
    Tile.prototype.ancestor = function(levels) {

        levels = levels || 1;

        if (this.z - levels < this.minZ) {
            levels = this.z - this.minZ;
        }

        var x = this.x >> levels;
        var y = this.y >> levels;
        var z = this.z - levels;

        return new this.constructor(x, y, z);
    };

    /**
     * Return a tile contained by this one (higher zoom level). For each
     * further zoom level, we can choose between 4 tiles, numbered as follows:
     * <pre>
     *  -------
     * | 0 | 1 |
     * |---+---|
     * | 2 | 3 |
     *  -------
     * </pre>
     * Thus, the path to a tile is the concatenation of the numbers
     * representing this choices.
     *
     * @memberof Tile
     *
     * @param {string} path - Base-4 number.
     * @returns {Tile} New tile.
     * @throws {Error} Invalid tile path.
     */
    Tile.prototype.descendant = function(path) {

        path = path || '0';

        if (this.z + path.length > this.maxZ) {
            path.slice(0, this.maxZ - this.z);
        }

        var x = this.x;
        var y = this.y;

        for (var i = 0; i < path.length; i++) {

            x <<= 1;
            y <<= 1;

            switch (path.charAt(i)) {
                case '0': break;
                case '1': x++; break;
                case '2': y++; break;
                case '3': x++; y++; break;
                default:
                    throw new Error('Invalid tile path');
            }
        }

        return new this.constructor(x, y, this.z + path.length);
    };

    /**
     * Generate the url for the tile from a url pattern. The pattern can have
     * one or more of the following markers, which will be replaced by the
     * appropriate value:
     * <pre>
     * {{x}}, {{y}}, {{z}}, {{p}}
     * </pre>
     * where x and y are the coordinates, z the zoom level and p the random
     * prefix.
     *
     * @memberof Tile
     *
     * @param {string} urlPattern - Url pattern.
     * @param {string[]} urlPrefixes - Url prefixes.
     * @returns {string} Url.
     */
    Tile.prototype.toUrl = function(urlPattern, urlPrefixes) {

        urlPattern  = urlPattern  || this.urlPattern;
        urlPrefixes = urlPrefixes || this.urlPrefixes;

        var tile = this, random = Math.random();

        return urlPattern.replace(replacePattern, function(match, par) {

            switch (par.toLowerCase()) {
                case 'x': return tile.x;
                case 'y': return switchTms(tile.y, tile.z, tile.format);
                case 'z': return tile.z;
                case 'p': return urlPrefixes[~~(random * urlPrefixes.length)];
            }
        });
    };

    /**
     * Return the x, y coordinates in the current zoom plane corresponding to a
     * given tile pixel.
     *
     * @memberof Tile
     *
     * @param {number} x - Tile pixel x coordinate, between 0 and 255.
     * @param {number} y - Tile pixel y coordinate, between 0 and 255.
     * @returns {object} Object with x and y fields.
     */
    Tile.prototype.toPixel = function(x, y) {

        x += this.x * this.size;
        y += this.y * this.size;

        return {x: x, y: y};
    };

    /**
     * Return the geodetic coordinates corresponding to a given tile pixel.
     *
     * @memberof Tile
     *
     * @param {number} x - Tile pixel x coordinate, between 0 and 255.
     * @param {number} y - Tile pixel y coordinate, between 0 and 255.
     * @returns {object} Object with lat and lon fields.
     */
    Tile.prototype.toLatLon = function(x, y) {

        var size = this.size << this.z;

        x = rangeLimit(x + (this.x * this.size), 0, size - 1) / size - 0.5;
        y = 0.5 - rangeLimit(y + (this.y * this.size), 0, size - 1) / size;

        var lat = 90 - 360 * Math.atan(Math.exp(-y * 2 * Math.PI)) / Math.PI;
        var lon = 360 * x;

        return {lat: lat, lon: lon};
    };

    /**
     * Compare with another tile for equality. Two tiles are equal if they have
     * the same coordiantes (x, y, z).
     *
     * @memberof Tile
     *
     * @param {Tile} tile - Another tile.
     * @returns {boolean} True if the tile coordinates are equal.
     */
    Tile.prototype.equals = function(tile) {

        return this.x === tile.x &&
               this.y === tile.y &&
               this.z === tile.z;
    };

    extend(Tile, defaultParams);
    extend(Tile.prototype, defaultParams);

    return Tile;
});

