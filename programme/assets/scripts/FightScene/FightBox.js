var nativeServer      = require("nativeServer");
var DataMgr           = require("DataMgr");
var FightLogicManager = require("FightLogicManager");
var eventCenter       = require("eventCenter");
var utils             = require("utils");
var log               = utils.log;

var BoxAnimName = {
    OpenIng : "Kai",
    Normal  : "Dong",
    Opened  : "Guan",     
}

cc.Class({
    extends: cc.Component,

    properties: {
        spineNode : cc.Node,
    },

    // use this for initialization
    onLoad: function () {

    },

    initData : function(boxData){
        var self = this;
        cc.loader.loadRes(boxData.cfgData.res, sp.SkeletonData, function(err, spData) {
            if(err) {return}
            self.spine = self.spineNode.getComponent(sp.Skeleton);
            self.spine.skeletonData = spData;
            self.playIdle();
            self.setAnimationListener();
        })
        this.boxData = boxData;
        this.spineNode.color = new cc.color(70, 120, 90);
    },

    //设置动画监听
    setAnimationListener : function(){
        var self = this;
        var animationListener = function(event){
            if(event.animation.name === BoxAnimName.Opened) {
               if(self.boxData.cfgData.isDestroy){
                    self.node.removeFromParent();
                }
            }
        }
        this.spine.setCompleteListener(animationListener);
    },

    onBoxOpened : function(content) {
        this.playOpened();
        FightLogicManager.onBoxOpened(this.boxData);
        eventCenter.dispatch("showGetItemText", content)
    },

    openBox : function() {
        var self = this;
        var callBack = function(msgType, content) {
            if(msgType=== DataMgr.DataDynType.FAILE){
                return;
            }else if (msgType === DataMgr.DataDynType.OK) {
                self.onBoxOpened(content);
                
            }


        }
        var sendData = {};  
        sendData.boxCfgID = this.boxData.cfgData.id
        DataMgr.start(DataMgr.DataDynType.OPEN_BOX.typeId, sendData, callBack);
    },


    playIdle : function() {
        this.spine.setAnimation(0, BoxAnimName.Normal, true);
    },

    playOpening : function() {
        var self = this;
        this.spine.setAnimation(0, BoxAnimName.OpenIng, true);
        setTimeout(function() {
            self.openBox();
        }, 2000);
    },

    playOpened : function() {
        this.spine.setAnimation(0, BoxAnimName.Opened, false);
    },


});
