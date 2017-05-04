cc.Class({
    extends: cc.Component,

    properties: {
       skillNode : cc.Node,
       warehouseNode : cc.Node,
       heroLayerNode : cc.Node,
       equipStoreNode : cc.Node,
       shipNode : cc.Node,
    },

    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    showSkill : function() {
        var animManager = this.skillNode.getComponent(cc.Animation);  
        animManager.playAdditive("showSkill");
    },

    showWarehouse : function(){
        var animManager = this.warehouseNode.getComponent(cc.Animation);
        animManager.playAdditive("showWarehouse");
    },

    showHeroLayer : function () {
        var animManager = this.heroLayerNode.getComponent(cc.Animation);
        animManager.playAdditive("showWarehouse");
    },

    showStore : function(){
        var animManager = this.equipStoreNode.getComponent(cc.Animation);
        animManager.playAdditive("showStore");
    },

    showShip : function(){
        var animManager = this.shipNode.getComponent(cc.Animation);
        animManager.playAdditive("showShip");
    },
});
