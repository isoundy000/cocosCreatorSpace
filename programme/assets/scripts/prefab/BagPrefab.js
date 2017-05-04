var BagUnitCode = require('BagUnitCode');
var nativeServer = require("nativeServer");
var eventCenter = require("eventCenter");
var music = require("music")
var LogicObjectManager = require("LogicObjectManager");
var GameDefine = require("GameDefine");
var configDataMgr = require("configDataMgr");
var log = require("utils").log;
var db = require("db");

var BagPrefabScript =  cc.Class({
    extends: cc.Component,

    properties: {
        bagUnit: cc.Prefab,
        paranetNode: cc.Node,
        bagBtn_num3: cc.Sprite,
        bagBtn_num4: cc.Sprite,
        promptBox: cc.Prefab,
        detailsBox: cc.Prefab,
        varBtn: cc.Node
    },

    onLoad: function () {
        BagPrefabScript.instance = this;
        this.initBagUnits();
        this.onBagBtnInit(null, 1);
        this.setBagLocked(db.get("UserInfo", true));
        this.registerEventCenter();
        this.isAbandon = false;
    },

    registerEventCenter: function() {
        var self = this;
        eventCenter.new("BagPrefabUserInfo", "UserInfo",  function(event, data) {
            self.setBagLocked(data);
        }, 1);

        eventCenter.new("BagPrefabBagInfo", "BagInfo",  function(event, data) {
            self.onBagBtnInit(null, self.curPageIndex);
        }, 1);


        eventCenter.new("BagPrefabBagNum", "onBagNumClick",  function(event, data) {
            self.onBagBtnInit(null, data);
        }, 1);

        eventCenter.new("BagPrefabAbandonItemMsg", "BagAbandonItemMsg", function(event, data){
            self.bagAbandonItem(data);
        }, 1);
    },

    unRegisterEventCenter : function() {
        eventCenter.delete("BagPrefabUserInfo");
        eventCenter.delete("BagPrefabBagInfo");
        eventCenter.delete("BagPrefabBagNum");
        eventCenter.delete("BagPrefabAbandonItemMsg");
    },

    onDestroy : function() {
        this.unRegisterEventCenter();
    },

    update: function (dt) {

    },

    initBagUnits: function () {        
        this.bagUnits  = [];
        var totalCount = 15; //总共15个
        var totalRow   = 3; //3行
        for(let index = 0; index < totalCount; index++){
            let row = Math.floor(index / totalCount * totalRow); //行 0开头
            let col = index - row * totalCount / totalRow; //列 0开头
            let pos = cc.p(col * 110 - 220, -260 - row * 110);
            let newBagUnit = cc.instantiate(this.bagUnit);
            newBagUnit.setPosition(pos);
            this.paranetNode.addChild(newBagUnit);
            newBagUnit.getComponent("BagUnitCode").initIndex(index);
            this.bagUnits.push(newBagUnit);
        }
        this.pageTotalCout = totalCount;
        this.pageTotalRow  = totalRow;
    },

    

    setBagUnitsNil: function (index) {
        for (var i = index; i < 15; i++) {
            this.bagUnits[i].getComponent("BagUnitCode").setBagUnitsNil();
            this.bagUnits[i].getComponent("BagUnitCode").qualityColor(null, 1);
        }
    },
    //获取当前仓库的数据
    getPageBagData : function(index) {
        var bagInfo    = db.get("BagInfo");
        var pageData   = [];
        var pageIndex  = index - 1;
        var startIndex = this.pageTotalCout * pageIndex; 
        var endIndex   = this.pageTotalCout * (pageIndex + 1);
        for(let i = startIndex; i < endIndex; i++) {
            if(bagInfo[i]) {
                let itemData;
                if(bagInfo[i].type === GameDefine.PROPS_TYPE.EQUIP) {
                    itemData = LogicObjectManager.getEquipmentObj(bagInfo[i].UniqueID);
                }else if(bagInfo[i].type === GameDefine.PROPS_TYPE.MATERIAL){
                    itemData = LogicObjectManager.getMaterialtObj(bagInfo[i].UniqueID);
                }
                pageData.push(itemData);
            }
        }
        return pageData;
    },

    setBagUnits: function (bagNum, index) {
        this.bagNum = bagNum;
        this.setBagUnitsNil(0);
        for (var i = 0; i < index; i++) {
            this.bagUnits[i].getComponent("BagUnitCode").setBagUnits(bagNum, i);
            this.clearVarBtnAbandon();
        }
    },

    onBagBtnInit: function (event, btn) {
        this.curPageIndex = btn;
        var pageData = this.getPageBagData(btn);
        for(var i =0; i < this.pageTotalCout; i++){
            let content = {};
            content.itemData   = pageData[i];
            content.curIndex   = i; 
            content.bagUnitsCB = this.onUnitsCallback;
            this.bagUnits[i].getComponent("BagUnitCode").setBagUnitsData(content);
        }
    },

    initIndex: function (index) {
        this.index = index;
    },

    detailsBoxShow : function (cbData) {
        var newDetailsBox = cc.instantiate(this.detailsBox);
        this.paranetNode.addChild(newDetailsBox);
        var detailInfo      = {}
        detailInfo.from     = "bagLayer";
        detailInfo.itemData = cbData.data;
        detailInfo.atlas    = cbData.atlas;
        newDetailsBox.getComponent("DetailsBox").detailsBoxShow(detailInfo);
    },

    setBagLocked: function (data) {
        var self = this;
        cc.loader.loadRes("images/Character/character", cc.SpriteAtlas, function(err, atlas){
            if (err) { log (err); return; }
            var img3Frame = atlas.getSpriteFrame("cha_fy_03");
            var img4Frame = atlas.getSpriteFrame("cha_fy_04");
            var imgLockFrame = atlas.getSpriteFrame("cha_fy_suo");
            if (data.BagNum == 3) {
                self.bagBtn_num3.getComponent(cc.Sprite).spriteFrame = img3Frame;
                self.bagBtn_num4.getComponent(cc.Sprite).spriteFrame = imgLockFrame;
            } else if (data.BagNum == 4) {
                self.bagBtn_num3.getComponent(cc.Sprite).spriteFrame = img3Frame;
                self.bagBtn_num4.getComponent(cc.Sprite).spriteFrame = img4Frame;
            }
        });
    },

    onBagVarBtnClick : function () {
        var self = this;
        self.isAbandon = !self.isAbandon;
        cc.loader.loadRes("images/Character/character", cc.SpriteAtlas, function(err, atlas){
            if (err) { log (err); return; }
            var img
            if (self.isAbandon)
                img = "cha_bu_gou";
            else {
                img = "cha_bu_dq";
            }
            var frame = atlas.getSpriteFrame(img);
            self.varBtn.getComponent(cc.Sprite).spriteFrame = frame;
        });

        var isChoose = false;
        for (var i = 0; i < this.bagLayerIndex; i++) {
            if (self.isAbandon)
                this.bagUnits[i].getComponent("BagUnitCode").setAbandonItem(1, "gou");
            else
                if (this.bagUnits[i].getComponent("BagUnitCode").itemIsChoose() != "cancel")
                    isChoose = true;
        }
        if (!self.isAbandon && !isChoose) {
            for (var i = 0; i < this.bagLayerIndex; i++) {
                this.bagUnits[i].getComponent("BagUnitCode").setAbandonItem(0);
            }
        } else if (!self.isAbandon && isChoose) 
            self.getPromptShow("bag_abandon_item");
    },

    bagAbandonItem: function (data) {
        if (data) {
            var baginfo = db.get("BagInfo");
            var abandonTable = [];
            var count = -1;
            for (var i = 0; i < this.bagLayerIndex; i++) {
                var isChoose = this.bagUnits[i].getComponent("BagUnitCode").itemIsChoose();
                if (isChoose != "cancel") {
                    count++;
                    abandonTable[count] = isChoose;
                }
            }
            for (var k = abandonTable.length-1; k >= 0 ; k--)
            {
                var index = abandonTable[k];
                if (this.bagNum == 2)
                    index = index + 15;
                else if (this.bagNum == 3)
                    index = index + 30;
                else if (this.bagNum == 4)
                    index = index + 45;
                baginfo.splice(index, 1);
            }
            db.set("BagInfo", baginfo);
        }
        this.clearVarBtnAbandon();
    },

    clearVarBtnAbandon: function () {
        var self = this;
        self.isAbandon = false;
        for (var i = 0; i < this.bagLayerIndex; i++) {
            this.bagUnits[i].getComponent("BagUnitCode").setAbandonItem(0);
        }
    },

    getPromptShow: function (cs) {
        this.paranetNode.active = true;
        var promptBox = cc.instantiate(this.promptBox);
        promptBox.setPosition(cc.p(0,0));
        promptBox.getComponent("PromptBox").getMsgFrom(cs);
        this.paranetNode.addChild(promptBox);
    },

    //子节点与当前node的
    //saveAltas 存储图片资源
    //getAltase 获取图片资源
    //BgDetailsShow 显示仓库道具的详情
    onUnitsCallback : function(cbData){
        var self = BagPrefabScript.instance;
        self.saveAltasList = self.saveAltasList || {};
        if(cbData.type === "saveAltas"){
            self.saveAltasList[cbData.resName] = cbData.atlas
        }else if(cbData.type === "getAltase"){
            return self.saveAltasList[cbData.resName];
        }else if(cbData.type === "BgDetailsShow"){
            self.detailsBoxShow(cbData);
        }
    },

});
