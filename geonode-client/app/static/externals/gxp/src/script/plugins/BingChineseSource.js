/**
 * @requires plugins/LayerSource.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = BingChineseSource
 */

/** api: (extends)
 *  plugins/LayerSource.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: BingChineseSource(config)
 *
 *    Plugin for using BingChinese layers with :class:`gxp.Viewer` instances. The
 *    plugin uses the BMaps v3 API and also takes care of loading the
 *    required BingChinese resources.
 *
 *    Available layer names for this source are "ROAD"
 */
/** api: example
 *  The configuration in the ``sources`` property of the :class:`gxp.Viewer` is
 *  straightforward:
 *
 *  .. code-block:: javascript
 *
 *    "bingchinesesource": {
 *        ptype: "gxp_bingchinesesource"
 *    }
 *
 *  A typical configuration for a layer from this source (in the ``layers``
 *  array of the viewer's ``map`` config option would look like this:
 *
 *  .. code-block:: javascript
 *
 *    {
 *        source: "bingchinese",
 *        name: "ROAD"
 *    }
 *
 */
gxp.plugins.BingChineseSource = Ext.extend(gxp.plugins.LayerSource, {

    /** api: ptype = gxp_bingchinesesource */
    ptype: "gxp_bingchinesesource",

    /** config: config[timeout]
     *  ``Number``
     *  The time (in milliseconds) to wait before giving up on the BingChinese Maps
     *  script loading.  This layer source will not be availble if the script
     *  does not load within the given timeout.  Default is 7000 (seven seconds).
     */
    timeout: 7000,

    /** api: config[title]
     *  ``String``
     *  A descriptive title for this layer source (i18n).
     */
    title: "Chinese Bing Layers",

    /** api: config[bingChineseRoadAbstract]
     *  ``String``
     *  An abstract for the Chinese Bing road layer.
     */
    bingChineseRoadAbstract: "Show Chinese Bing Road",

    /** api: config[bingChineseRoadTitle]
     *  ``String``
     *  A title for the Chinese Bing road layer.
     */
    bingChineseRoadTitle: "Chinese Bing Road",

    /** api: config[bingChineseRoadURL]
     *  ``String",
     *  The TMS url for Chinese Bing road layer
     */
    bingChineseRoadURL: "https://{subdomain}.dynamic.tiles.ditu.live.com/comp/ch/{quadkey}" +
    "?mkt={culture}&ur=CN&it=G,TW,L&n=z&og=206&cstl=rd&src=h",

    /** api: config[bingChineseRoadSubdomains]
     *  ``Array",
     *  A list of subdomains for Chinese Bing road layer
     */
    bingChineseRoadSubdomains: ["t0", "t1", "t2", "t3"],

    /** api: config[apiKey]
     *  ``String``
     *  API key generated from http://bingmapsportal.com/ for your domain.
     */
    apiKey: "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf",

    /** api: method[createStore]
     *
     *  Creates a store of layer records.  Fires "ready" when store is loaded.
     */
    createStore: function () {
        var layers = [
            new OpenLayers.Layer.BingChinese({
                key: this.apiKey,
                name: this.bingChineseRoadTitle,
                type: "Road",
                buffer: 1,
                transitionEffect: "resize",
                bingChineseURL: this.bingChineseRoadURL,
                bingChineseSubdomains: this.bingChineseRoadSubdomains
            })
        ];
        this.store = new GeoExt.data.LayerStore({
            layers: layers,
            fields: [
                {name: "source", type: "string"},
                {name: "name", type: "string", mapping: "type"},
                {name: "abstract", type: "string", mapping: "attribution"},
                {name: "group", type: "string", defaultValue: "background"},
                {name: "fixed", type: "boolean", defaultValue: true},
                {name: "selected", type: "boolean"}
            ]
        });
        this.store.each(function (l) {
            l.set("group", "background");
        });
        this.fireEvent("ready", this);
    },

    /** api: method[createLayerRecord]
     *  :arg config:  ``Object``  The application config for this layer.
     *  :returns: ``GeoExt.data.LayerRecord``
     *
     *  Create a layer record given the config.
     */
    createLayerRecord: function (config) {
        var record;
        var index = this.store.findExact("name", config.name);
        if (index > -1) {

            record = this.store.getAt(index).copy(Ext.data.Record.id({}));
            var layer = record.getLayer().clone();

            // set layer title from config
            if (config.title) {
                /**
                 * Because the layer title data is duplicated, we have
                 * to set it in both places.  After records have been
                 * added to the store, the store handles this
                 * synchronization.
                 */
                layer.setName(config.title);
                record.set("title", config.title);
            }

            // set visibility from config
            if ("visibility" in config) {
                layer.visibility = config.visibility;
            }

            record.set("selected", config.selected || false);
            record.set("source", config.source);
            record.set("name", config.name);
            if ("group" in config) {
                record.set("group", config.group);
            }

            record.data.layer = layer;
            record.commit();
        }
        return record;
    }

});

Ext.preg(gxp.plugins.BingChineseSource.prototype.ptype, gxp.plugins.BingChineseSource);
