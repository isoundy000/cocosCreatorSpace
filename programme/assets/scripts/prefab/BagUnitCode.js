var nativeServer = require("nativeServer");
var configDataMgr = require("configDataMgr");
var GameDefine  = require("GameDefine");
var eventCenter = require("eventCenter");
var log = require("utils").log;
var db = require("db");

cc.Class({
    extends: cc.Component,

    properties: {
        itemBtn: cc.Node,
        highLightImg: cc.Sprite,
        itemImg: cc.Sprite,
        bgLayout: cc.Sprite,
        delBtn: cc.Sprite,
        lnBox: cc.Node,
        newImg: cc.Sprite,
        cLayout: cc.Node
    },

    initIndex: function (cs) {
        this.cs = cs;
    },

    onItemBtnClick: function () {
        if(!this.itemData){return}
        if(this.newImg.enabled){
            nativeServer.setBagItemIsRead(this.itemData.UniqueID);
        }
        var callData   = {};
        callData.type  = "BgDetailsShow";
        callData.data  = this.itemData; 
        callData.atlas = this.imgFrame;       
        this.parentCallback(callData);
    },

    //初始化数据
    setBagUnitsData : function(content){        
        this.setBagUnitsNil();
        if(!content.itemData){
            return
        }
        var itemData = content.itemData;
        this.newImg.enabled = itemData.isNew;
        this.parentCallback = content.bagUnitsCB;
        this.loadIconRes(itemData);
        this.qualityColor(this.itemBtn, itemData.quality);
        this.itemData = itemData;
    },

    //加载icon图片
    loadIconRes : function(itemData) {
        var self             = this;
        var iconName         = itemData.name; 
        if(!itemData.loadResPath) {return}
        this.itemImg.enabled = true;
        var getData          = {};
        getData.type         = "getAltase";
        getData.resName      = itemData.loadResPath;
        var parentAtlas      = this.parentCallback(getData);
        if(parentAtlas) {
            this.imgFrame = parentAtlas.getSpriteFrame(iconName);
            this.itemImg.getComponent(cc.Sprite).spriteFrame = this.imgFrame;
        }else {
            cc.loader.loadRes(itemData.loadResPath, cc.SpriteAtlas, function(err, atlas){
                self.imgFrame = atlas.getSpriteFrame(iconName);
                self.saveAltas(itemData.loadResPath, atlas);
                self.itemImg.getComponent(cc.Sprite).spriteFrame = self.imgFrame;
            });
        }
        
    },

    //加载的资源存起来，下次就用存储的
    saveAltas : function(resName, atlas) {
        var saveData = {};
        saveData.type = "saveAltas";
        saveData.resName = resName;
        saveData.atlas = atlas;
        this.parentCallback(saveData);
    },

    qualityColor: function (item, quality) {
        if (!item) var item = this.itemBtn;
        cc.loader.loadRes("images/Character/character", cc.SpriteAtlas, function(err, atlas){
            if (err) { log (err); return; }
            var img = "fquality" + (quality-1).toString();
            var frame = atlas.getSpriteFrame(img);
            item.active = true;
            item.getComponent(cc.Sprite).spriteFrame = frame;
        });
    },

    setAbandonItem: function (abanCs, gou) {
        this.gou = gou;
        this.abanCs = abanCs;
        if (abanCs) {
            this.delBtn.enabled = true;
            this.cLayout.active = true;
            this.cLayout.getComponent(cc.Sprite).enabled = true;
        }
        else {
            this.delBtn.enabled = false;
            this.cLayout.active = false;
            this.highLightImg.enabled = false;
        }
    },

    onCLayoutBtnClick: function () {
        if (this.gou) {
            if (this.abanCs) {
                this.delBtn.enabled = false;
                this.cLayout.getComponent(cc.Sprite).enabled = false;
                this.highLightImg.enabled = true;
                this.abanCs = !this.abanCs;
            } else {
                this.delBtn.enabled = true;
                this.cLayout.getComponent(cc.Sprite).enabled = true;
                this.highLightImg.enabled = false;
                this.abanCs = !this.abanCs;
            }
        }
    },

    itemIsChoose: function () {
        if (this.highLightImg.enabled) {
            return this.cs;
        }
        else
            return "cancel";
    },

    setBagUnitsNil: function () {
        this.highLightImg.enabled = false;
        this.cLayout.active       = false;
        this.itemImg.enabled      = false;
        this.bgLayout.enabled     = false;
        this.delBtn.enabled       = false;
        this.lnBox.active         = false;
        this.newImg.enabled       = false;
        this.itemBtn.active       = false;
    }

});