var log = require("utils").log;
var eventCenter = require("eventCenter");
var GameDefine = require("GameDefine");
cc.Class({
    extends: cc.Component,

    properties: {
       listScroll : cc.ScrollView,
       storeItemP : cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {        
        this.registerEventCenter();
    },

    onDestroy : function(){
        this.unRegisterEventCenter();
    },

    showStoreList : function(type) {
        //假数据
        var testData;
        if(type === GameDefine.STORETYPE.EQUIP){
            testData = new Array(6);
        }else if(type === GameDefine.STORETYPE.MATERIAL){
            testData = new Array(3);
        } 
        if(!testData) {return};
        this.storeListData = testData;
        var boxList = require("boxList")
        this.listSys    = boxList.New(this.listScroll, this.storeItemP, false, testData.length, 5, false);
        this.listSys.updateItemData = this.updateLevelListItem;
        this.listSys.onItemSelected = this.onLevelListItemSelected;
        this.listSys.initItems();
        this.showInAnim();
    },

    showInAnim : function(){
        var self = this;
        var contentList = this.listScroll.content;
        var positionList = [];
        var offHeight = contentList.height
        //最多有六个动画
        for(let i = 0; i <6;i++){
            let v = contentList.children[i]
            if(v){
                let lastPos = v.getPosition()
                positionList.push(lastPos)
                //先将item下移offHeight距离
                v.setPosition(cc.p(lastPos.x, lastPos.y - offHeight));
            }
        }
        let index = 0;
        var shinIn = function(){
            if(index >= positionList.length) {return}
            let actionNode = contentList.children[index];
            let moveAct = cc.moveTo(0.2, positionList[index]);
            moveAct.easing(cc.easeQuarticActionOut())
            actionNode.runAction(moveAct)
            setTimeout(function(){
                index += 1;
               shinIn();
            }, 100)//0.1秒执行一次
        }
        shinIn();
        
        
    },
    updateLevelListItem : function(){
        log("-----updateLevelListItem----", arguments);

    },

    onLevelListItemSelected : function(){
        log("-----onLevelListItemSelected----", arguments);
    },

    onBtnCloseClick : function(){
        var self   = this;
        var action = cc.sequence( cc.spawn(cc.fadeOut(0.3), cc.scaleTo(0.3, 0.4)), cc.callFunc(function() {
            self.node.destroy();
            self.node.parent.removeAllChildren();
        }))
        this.node.runAction(action);   
    },

    onBtnSellClicked : function(){

    },

    onBtnRefreshClicked : function(){
        
    },

    registerEventCenter : function(){
        var self = this;
        eventCenter.new("ShopEquipsInfoShopLayer", "ShopEquipsInfo", function(event, data){
            if(data ) {
                //self.setShopItemsShow(data)
                //self.soldOutText.setVisible(false)
                if(next(data) == null) {
                    //self.soldOutText.setVisible(true)
                }
            }
        }, 0)
        eventCenter.new("ShopBuyEquipDispatchShopLayer", "ShopBuyEquipDispatch", function(event, data){
            if(data === 1) {
                //self.sureRefreshTime()
            }else{
                //self.couldTouch = true
            }
        }, 0)
        eventCenter.new("ShopSureBuyDispatchShopLayer", "ShopSureBuyDispatch", function(event, data){
            if(data === 1) {
                //self.sureBuy()
            }
        }, 0)
        eventCenter.new("UserGoldExchangedDispatchShopLayer", "UserGoldExchangedDispatch", function(event, data){
            if(data === 1) {
                //self.userMoneyShow()
            }
        }, 0)
    },

    unRegisterEventCenter : function() {
        eventCenter.delete("ShopEquipsInfoShopLayer")
        eventCenter.delete("ShopBuyEquipDispatchShopLayer")
        eventCenter.delete("ShopSureBuyDispatchShopLayer")
        eventCenter.delete("UserGoldExchangedDispatchShopLayer")
        //self.shopPanel:release()
    },
    
});
