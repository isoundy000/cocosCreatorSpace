var log = require("utils").log;
var eventCenter = require("eventCenter")

cc.Class({
    extends: cc.Component,

    properties: {
        bagListPrefab : cc.Prefab, 
        bagListN : cc.Node, 
        categoryN : cc.Node,
        warehouseContentN : cc.Node,
        itemPrefab : cc.Prefab, 

    },

    // use this for initialization
    onLoad: function () {
        //this.addBagList();
        this.registerEventCenter();
        this.curCategoryIndex = 0;
        this.initWarehouseNode();
        this.setBord(require("db").get("WarehouseInfo"))
    },

    onDestroy : function(){
        this.unRegisterEventCenter();
    },
    unRegisterEventCenter: function(){
        eventCenter.delete("WarehouseLayerWarehouseInfo")
        eventCenter.delete("UtilUserInfoWarehouseLayer")
        eventCenter.delete("PromptDispatchWarehouseLayer")
        eventCenter.delete("WareBuyDispatchWarehouseLayer")
    },
    registerEventCenter: function(){
        var self = this;
        eventCenter.new("WarehouseLayerWarehouseInfo","WarehouseInfo", function(event, data){
            self.setBord(data)
        })
        eventCenter.new("UtilUserInfoWarehouseLayer", "UserInfo", function(event, data){
            //self.isBagLocked(data);
        })
        eventCenter.new("PromptDispatchWarehouseLayer", "GetItemsToBagDispatch", function(event, data){
            //self:sureGetItemsToBag()
            //self:setVisibleFalse(db.get("WarehouseInfo", 0))
        })
        eventCenter.new("WareBuyDispatchWarehouseLayer", "WareBuyDispatch",function(event, data){
            //self:sureBuyBagItems(data)
        })
    },

    //添加背包列表
    addBagList : function() {
        var bag = cc.instantiate(this.bagListPrefab);
        this.bagListN.addChild(bag);
    }, 

    onBtnCloseClicked : function(){
        var self   = this;
        var action = cc.sequence( cc.spawn(cc.fadeOut(0.3), cc.scaleTo(0.3, 0.4)), cc.callFunc(function() {
            self.node.destroy();
            self.node.parent.removeAllChildren();
        }))
        this.node.runAction(action);   
    },
    //隐藏之前的仓库列表
    hideItemListNode : function(){
        if(this.lastCategoryIndex) {
            var hideIndex = this.lastCategoryIndex;
            var hdieNode  = this.warehouseContentN.children[hideIndex];
            hdieNode.runAction(cc.sequence(cc.fadeOut(0.2), cc.callFunc(function() {
                hdieNode.active = false;
            })))
        }
        this.lastCategoryIndex = this.curCategoryIndex;
    },

    onBtnCategoryShowClicked : function(event, clickIndex) {
        clickIndex = parseInt(clickIndex) -1;
        this.curCategoryIndex = clickIndex;
        this.showWarehouseList();
    },

    onBtnCategoryLockClicked : function(event, clickIndex) {
        clickIndex = parseInt(clickIndex) - 1;
        log("onBtnCategoryLockClicked", clickIndex)
    },

    showWarehouseList : function() {
        this.hideItemListNode();
        var showIndex    = this.curCategoryIndex;
        var showNode     = this.warehouseContentN.children[showIndex];
        showNode.active  = true;
        showNode.opacity = 0;
        showNode.runAction(cc.fadeIn(0.5));
    },

    setCategoryIndexStatus : function(index, isLocck) {
        var node                            = this.categoryN.children[index];
        node.getChildByName("close").active = isLocck;
        node.getChildByName("open").active  = !isLocck;
    },

    setBord : function(warehouseData){
        var warehouseDataList = [];
        warehouseDataList[0] = new Array();
        warehouseDataList[1] = new Array();
        warehouseDataList[2] = new Array();
        warehouseDataList[3] = new Array();
        this.warehouseDataList = warehouseDataList;
        for(let k in warehouseData) {
            let data = warehouseData[k]
            if (k <  20) {
                warehouseDataList[0].push(data)
            }else if (k < 40) {
                warehouseDataList[1].push(data)
            }else if (k < 60) {
                warehouseDataList[2].push(data)
            }else {
                warehouseDataList[3].push(data)
            }
        }
        this.updateCategory();
        this.showWarehouseList();
        this.updateWarehouseList();
    },
    //更新上面仓库的标签
    updateCategory : function() {
        for (let i = 0; i < 4; i++) {
            this.setCategoryIndexStatus(i, this.warehouseDataList[i].length < 1);
        }
    },
    //更新仓库的数据列表
    updateWarehouseList : function() {
        for (let i = 0; i < 4; i++) {
            let categoryData = this.warehouseDataList[i];
            let listNode    = this.warehouseContentN.children[i];
            let contentNode = listNode.getComponent(cc.ScrollView).content;
            for (let k = 0; k < 20; k++) {
                let itemNode = contentNode.children[k];
                //itemNode.getComponent("BagUnitCode").setBagUnits(i, k);
            }
        }
    }, 

    initWarehouseNode : function() {
        for (let i = 0; i < 4; i++) {
            let listNode    = this.warehouseContentN.children[i];
            let contentNode = listNode.getComponent(cc.ScrollView).content;
            for (var k = 0; k < 20; k++) {
                let bagNode = cc.instantiate(this.itemPrefab);
                contentNode.addChild(bagNode);
                let row =Math.floor( k / 5);
                let col = k % 5 ;
                bagNode.setPosition(col * 120 - contentNode.width /2 + 60, 0 - row * 110 - 60);
            }
        }
    },

});
