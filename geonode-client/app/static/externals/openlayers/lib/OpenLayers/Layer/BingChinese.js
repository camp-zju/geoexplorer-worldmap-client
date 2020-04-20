/**
 * @requires OpenLayers/Layer/XYZ.js
 */

/**
 * Class: OpenLayers.Layer.BingChinese
 *
 * Inherits from:
 *  - <OpenLayers.Layer.XYZ>
 */
OpenLayers.Layer.BingChinese = OpenLayers.Class(OpenLayers.Layer.XYZ, {

    /**
     * Property: key
     * {String} API key for Bing maps, get your own key
     *     at http://bingmapsportal.com/ .
     */
    key: null,

    /**
     * Property: serverResolutions
     * {Array} the resolutions provided by the Bing servers.
     */
    serverResolutions: [
        156543.03390625, 78271.516953125, 39135.7584765625,
        19567.87923828125, 9783.939619140625, 4891.9698095703125,
        2445.9849047851562, 1222.9924523925781, 611.4962261962891,
        305.74811309814453, 152.87405654907226, 76.43702827453613,
        38.218514137268066, 19.109257068634033, 9.554628534317017,
        4.777314267158508, 2.388657133579254, 1.194328566789627,
        0.5971642833948135, 0.29858214169740677, 0.14929107084870338,
        0.07464553542435169
    ],

    /**
     * Property: zoomMin
     * {Array} the min zoom provided by the Bing servers.
     */
    zoomMin: 1,

    /**
     * APIProperty: type
     * {String} The layer identifier.  Any non-birdseye imageryType
     *     from http://msdn.microsoft.com/en-us/library/ff701716.aspx can be
     *     used.  Default is "Road".
     */
    type: "Road",

    /**
     * APIProperty: culture
     * {String} The culture identifier.  See http://msdn.microsoft.com/en-us/library/ff701709.aspx
     * for the definition and the possible values.  Default is "zh-CN".
     */
    culture: "zh-CN",

    /** APIProperty: tileOptions
     *  {Object} optional configuration options for <OpenLayers.Tile> instances
     *  created by this Layer. Default is
     *
     *  (code)
     *  {crossOriginKeyword: 'anonymous'}
     *  (end)
     */
    tileOptions: null,

    /**
     * Property: bingChineseURL
     * {String}
     */
    bingChineseURL: null,

    /**
     * Property: bingChineseSubdomains
     * {Array}
     */
    bingChineseSubdomains: [],

    /**
     * Constructor: OpenLayers.Layer.BingChinese
     * Create a new Chinese Bing layer.
     *
     * Example:
     * (code)
     * var road = new OpenLayers.Layer.BingChinese({
     *     name: "My Chinese Bing Aerial Layer",
     *     type: "Road",
     *     key: "my-api-key-here",
     * });
     * (end)
     *
     * Parameters:
     * options - {Object} Configuration properties for the layer.
     *
     * Required configuration properties:
     * key - {String} Bing Maps API key for your application. Get one at
     *     http://bingmapsportal.com/.
     * type - {String} The layer identifier.  Any non-birdseye imageryType
     *     from http://msdn.microsoft.com/en-us/library/ff701716.aspx can be
     *     used.
     *
     * Any other documented layer properties can be provided in the config object.
     */
    initialize: function (options) {
        options = OpenLayers.Util.applyDefaults({
            sphericalMercator: true
        }, options);
        var name = options.name || "Bing Chinese" + (options.type || this.type);

        var newArgs = [name, null, options];
        OpenLayers.Layer.XYZ.prototype.initialize.apply(this, newArgs);
        this.tileOptions = OpenLayers.Util.extend({
            crossOriginKeyword: 'anonymous'
        }, this.options.tileOptions);
        this.initLayer();
    },

    /**
     * Method: initLayer
     *
     * Sets layer properties according to the metadata provided by the API
     */
    initLayer: function () {
        var url = this.bingChineseURL.replace("{quadkey}", "${quadkey}");
        url = url.replace("{culture}", this.culture);
        this.url = [];
        for (var i = 0; i < this.bingChineseSubdomains.length; ++i) {
            this.url.push(url.replace("{subdomain}", this.bingChineseSubdomains[i]));
        }
        this.addOptions({
            maxResolution: Math.min(
                this.serverResolutions[this.zoomMin],
                this.maxResolution || Number.POSITIVE_INFINITY
            ),
            numZoomLevels: this.numZoomLevels
        }, true);
        this.updateAttribution();
    },

    /**
     * Method: drawTileFromQueue
     * Draws the first tile from the tileQueue, and unqueues that tile
     */
    drawTileFromQueue: function () {
        // don't start working on the queue before we have a url from initLayer
        if (this.url) {
            OpenLayers.Layer.XYZ.prototype.drawTileFromQueue.apply(this, arguments);
        }
    },

    /**
     * Method: getURL
     *
     * Paramters:
     * bounds - {<OpenLayers.Bounds>}
     */
    getURL: function (bounds) {
        var xyz = this.getXYZ(bounds), x = xyz.x, y = xyz.y, z = xyz.z;
        var quadDigits = [];
        for (var i = z; i > 0; --i) {
            var digit = '0';
            var mask = 1 << (i - 1);
            if ((x & mask) != 0) {
                digit++;
            }
            if ((y & mask) != 0) {
                digit++;
                digit++;
            }
            quadDigits.push(digit);
        }
        var quadKey = quadDigits.join("");
        var url = this.selectUrl('' + x + y + z, this.url);

        return OpenLayers.String.format(url, {'quadkey': quadKey});
    },

    /**
     * Method: updateAttribution
     * Updates the attribution according to the requirements outlined in
     * http://gis.638310.n2.nabble.com/Bing-imagery-td5789168.html
     */
    updateAttribution: function () {
        this.map && this.map.events.triggerEvent("changelayer", {
            layer: this,
            property: "attribution"
        });
    },

    /**
     * Method: setMap
     */
    setMap: function () {
        OpenLayers.Layer.XYZ.prototype.setMap.apply(this, arguments);
        this.map.events.register("moveend", this, this.updateAttribution);
    },

    /**
     * APIMethod: clone
     *
     * Parameters:
     * obj - {Object}
     *
     * Returns:
     * {<OpenLayers.Layer.BingChinese>} An exact clone of this <OpenLayers.Layer.BingChinese>
     */
    clone: function (obj) {
        if (obj == null) {
            obj = new OpenLayers.Layer.BingChinese(this.options);
        }
        //get all additions from superclasses
        obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this, [obj]);
        // copy/set any non-init, non-simple values here
        return obj;
    },

    /**
     * Method: destroy
     */
    destroy: function () {
        this.map &&
        this.map.events.unregister("moveend", this, this.updateAttribution);
        OpenLayers.Layer.XYZ.prototype.destroy.apply(this, arguments);
    },

    CLASS_NAME: "OpenLayers.Layer.BingChinese"
});
