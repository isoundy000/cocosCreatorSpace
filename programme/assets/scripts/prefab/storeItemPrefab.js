var log = require("utils").log;
cc.Class({
    extends: cc.Component,

    properties: {
        iconPrefab : cc.Prefab,
        iconNode : cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        var node = cc.instantiate(this.iconPrefab);
        this.iconNode.addChild(node);
        node.setPosition(cc.p(0,  -50));
        this.itemIconN = this.iconNode.children[0];
    },

    seticonData : function(Data){

    }, 

    onBtnBuyClicked : function(){
        log("--onBtnBuyClicked--");
    },
});
