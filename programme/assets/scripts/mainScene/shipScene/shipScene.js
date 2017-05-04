var utils = require("utils")
var log = utils.log;
var eventCenter = require("eventCenter");

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        this.registerEventCenter();
        var SpaceshipInfo = require("db").get("SpaceshipInfo");
        self.setBord(data);
    },

    registerEventCenter : function(){
        eventCenter.new("SpaceShipLayerSpaceshipInfo", "SpaceshipInfo", function(event, data){
            self.setBord(data)
        }, 0)
    },

    unRegisterEventCenter : function() {
        eventCenter.delete("SpaceShipLayerSpaceshipInfo");
    },

    onDestroy : function(){
        this.unRegisterEventCenter();
    },

    setBord : function(data){
        log("setBord ------", data)
    },
    
    onBtnCloseClicked : function(){
        var self   = this;
        var action = cc.sequence( cc.spawn(cc.fadeOut(0.3), cc.scaleTo(0.3, 0.4)), cc.callFunc(function() {
            self.onDestroy();
            self.node.destroy();
            self.node.parent.removeAllChildren();
        }))
        this.node.runAction(action);    
    },
});
