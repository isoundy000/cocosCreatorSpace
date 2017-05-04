var eventCenter   = require("eventCenter");
var configDataMgr = require("configDataMgr");
var music         = require("music")
var log           = require("utils").log;
var db            = require("db");
var GameDefine    = require("GameDefine");
var utils         = require("utils");
var nativerServer = require("nativeServer");
var DataMgr       = require("DataMgr");

cc.Class({
    extends: cc.Component,

    properties: {
        detailsBoxNode: cc.Node,
        itemBox: cc.Node,
        itemProp: cc.Node,
        saleBox: cc.Node,
        equipBtn: cc.Node,
        promptBox: cc.Prefab,
        priceL   : cc.Label, //价格
    },

    onLoad: function () {
        this.registerEventCenter();
    },

    registerEventCenter: function() {
        var self = this;
        eventCenter.new("DetailsBoxRemove", "DetailsBoxRemove", function(event, data) {
            self.onMaskLayerClick();
        }, 1);
    },

    unRegisterEventCenter : function() {
        eventCenter.delete("DetailsBoxRemove");
    },

    onDestroy : function() {
        this.unRegisterEventCenter();
    },

    detailsBoxShow: function (detailInfo) {
        var self           = this;
        this.detailInfo    = detailInfo;
        this.priceL.string = detailInfo.itemData.salePrice;
        var isEquip        = (detailInfo.itemData.type === GameDefine.PROPS_TYPE.EQUIP)
        var isMaterial     = (detailInfo.itemData.type === GameDefine.PROPS_TYPE.MATERIAL)
        if(isEquip) {
            this.equipmentAttributesShow();
            this.setEquipBasicInfo();
        }else if(isMaterial) {
            this.showMeterialDetail();
            this.setMaterialBasicInfo();
        }
        var item                               = this.itemBox.getChildByName("Item");
        var itemIcon                           = item.getChildByName("itemImg").getComponent(cc.Sprite)
        itemIcon.spriteFrame                   = this.detailInfo.atlas; //frame;
    },

    setEquipBasicInfo : function () {
        var data                               = this.detailInfo.itemData;
        var item                               = this.itemBox.getChildByName("Item");
        this.qualityColor(item, this.detailInfo.itemData.quality);
        var levelN                             = item.getChildByName("LnBox").getChildByName("text");
        levelN.getComponent(cc.Label).string   = "+"+ data.level; //this.itemInfo.strLevel;
        var equLevel                           = this.itemBox.getChildByName("level");
        equLevel.active                        = true;
        equLevel.getComponent(cc.Label).string = "Lv "+data.level;
        var equName                            = this.itemBox.getChildByName("name");
        equName.active                         = true;
        equName.getComponent(cc.Label).string  = data.localName;//require("utils").getText(data.name);
        var nameNode                           = this.itemBox.getChildByName("mName");
        nameNode.active                        = false;
        this.textColor(equLevel, data.quality);
        this.textColor(equName, data.quality);
    },

    setMaterialBasicInfo : function () {
        var data = this.detailInfo.itemData;
        var item                                    = this.itemBox.getChildByName("Item");
        this.qualityColor(item, 1);
        var num                                     = item.getChildByName("LnBox").getChildByName("text");
        num.getComponent(cc.Label).string           = data.number;
        this.itemBox.getChildByName("level").active = false;
        this.itemBox.getChildByName("name").active  = false;
        var mateName                                = this.itemBox.getChildByName("mName");
        mateName.active                             = true;
        mateName.getComponent(cc.Label).string      = require("utils").getText(data.name);
        this.textColor(mateName, 1);
    },

    /* 装备属性 */
    equipmentAttributesShow: function () {
        var isUserEquiped = (this.detailInfo.from === "heroLayer");
        var scrollView = this.itemProp.getChildByName("PropScrollView");
        var content    = scrollView.getChildByName("view").getChildByName("content");
        var baseProp   = content.getChildByName("baseProp");
        var extraProp  = content.getChildByName("extraProp");
        var remove     = content.getChildByName("remove");

        baseProp.getChildByName("title").getComponent(cc.Label).string  = "基础属性";
        extraProp.getChildByName("title").getComponent(cc.Label).string = "额外属性";
        var changedLabel = remove.getChildByName("title").getComponent(cc.Label)
        changedLabel.string = isUserEquiped ? "卸下后" : "装备后";
    	for(var k = 1; k <= 10; k++) {
    		if (k <= 2)
    			baseProp.getChildByName("prop"+k).active = false;
    		if (k <= 4)
    			extraProp.getChildByName("prop"+k).active = false;
    		remove.getChildByName("prop"+k).active = false;
    	}
        var basePropData = this.detailInfo.itemData.baseProp
        var propData = this.detailInfo.itemData.Prop;
        var bCount = 0;
        //基本属性
    	for(var item in basePropData) {
    		bCount++;
            var itemName = require("utils").getText("pn_"+item);
    		var msg = itemName + " +" + utils.getAttrRealDisplay(item, basePropData[item]); //basePropData[item];
            var bPropT = baseProp.getChildByName("prop"+bCount);
	    	bPropT.getComponent(cc.Label).string = msg;
	    	bPropT.active = true;
            this.textColor(bPropT, this.detailInfo.itemData.quality);
    	}
        //扩展属性
    	var eCount = 0;
    	for(var item in propData) {
    		eCount++;
            var itemName                         = require("utils").getText(item);
            var itemValue                        = utils.getAttrRealDisplay(item,propData[item]);
            var msg                              = itemName + " +" + itemValue 
            var ePropT                           = extraProp.getChildByName("prop"+eCount);
            ePropT.getComponent(cc.Label).string = msg;
            ePropT.active                        = true;
            this.textColor(ePropT, this.detailInfo.itemData.quality);
    	}
        if(this.detailInfo.from === "heroLayer"){
            var inEquip      = this.detailInfo.itemData;
            var reEquip      = {};
            reEquip.baseProp = {};
            reEquip.Prop     = {};
            this.ifEquipmentChanged(remove, inEquip, reEquip);
        }else if (this.detailInfo.from === "bagLayer"){
            var reEquip = this.detailInfo.itemData;
            var inEquip = utils.getPartOfEquipment(reEquip.part);
            //该槽位没有穿戴装备
            if(!inEquip){
                inEquip          = {};
                inEquip.baseProp = {};
                inEquip.Prop     = {};
            }
            this.ifEquipmentChanged(remove, inEquip, reEquip);
        }

    },

    //假如装备卸载下去的一些属性变化
    //inEquip 正在装备的道具, reEquip替换的装备
    ifEquipmentChanged : function(remove, inEquip, reEquip ) {
        var self = this;
        var rCount = 0;
        var setRemoveLabel = function(changeValue, extendKey, childIndex) {
            var itemName      = utils.getText(extendKey);
            var removeNode    = remove.getChildByName("prop"+ childIndex);
            var removeL       = removeNode.getComponent(cc.Label);
            removeNode.active = true;
            var itemValue     = utils.getAttrRealDisplay(extendKey, changeValue);
            if(changeValue > 0){
                self.textColor(removeNode, "green");
                removeL.string    = itemName+" +"+itemValue;
            }else {
                self.textColor(removeNode, "red");
                removeL.string    = itemName+" "+itemValue;
            }
        }

        var baseAttrList  = GameDefine.BaseEquipAttrList;
        var otherAttrList = GameDefine.PropNotBaseAttrList;
        for(let index in baseAttrList){
            let baseKey   = baseAttrList[index];
            let extendKey = "pn_" + baseKey;
            //如果数据有变换
            if(inEquip.baseProp[baseKey] || reEquip.baseProp[baseKey] ||
                inEquip.Prop[extendKey] || reEquip.Prop[extendKey]) {
                var addValue    = reEquip.baseProp[baseKey] || 0;
                addValue        = reEquip.Prop[extendKey] ? reEquip.Prop[extendKey] + addValue : addValue;
                var subValue    = inEquip.baseProp[baseKey] || 0;
                subValue        = inEquip.Prop[extendKey] ? inEquip.Prop[extendKey] + subValue : subValue
                var changeValue = addValue - subValue;
                if(changeValue !== 0) {
                    rCount += 1;
                    setRemoveLabel(changeValue, extendKey, rCount);
                }
                
            }
        }

        for(let index in otherAttrList){
            let extendKey = otherAttrList[index];
            //如果数据有变换
            if(inEquip.Prop[extendKey] || reEquip.Prop[extendKey]){
                var addValue    = reEquip.Prop[extendKey] || 0;
                var subValue    = inEquip.Prop[extendKey] || 0;
                var changeValue = addValue - subValue;
                if(changeValue !== 0) {
                    rCount += 1;
                    setRemoveLabel(changeValue, extendKey, rCount);
                }
            }
        }
    },

    showMeterialDetail : function(){
        this.equipBtn.active = false;
        var scrollView       = this.itemProp.getChildByName("PropScrollView");
        scrollView.active    = false;
        var mateProp         = this.itemProp.getChildByName("mateProp");
        mateProp.active      = true;
        mateProp.getChildByName("title").getComponent(cc.Label).string = "材料详情:";
        mateProp.getChildByName("content").getComponent(cc.Label).string = this.detailInfo.itemData.localDesc;        
    },

    onOrOffBtn: function () {
        var self = this;
        var callback = function(msgType, content) {
            if(msgType === DataMgr.DataDynType.FAILE) {
                self.getPromptShow(content);
                return;
            }
            self.onMaskLayerClick();
        }
        var sendData = {};
        sendData.UniqueID = this.detailInfo.itemData.UniqueID;
        
        //卸载装备
        if (this.detailInfo.from == "heroLayer") {
            DataMgr.start(DataMgr.DataDynType.EQUIP_OFF.typeId, sendData, callback)
        } 
        //穿戴改载装备
        else if (this.detailInfo.from == "bagLayer") {
            DataMgr.start(DataMgr.DataDynType.EQUIP_ON.typeId, sendData, callback)
            /*
            var item = configDataMgr.EquipCfg[parseInt(this.itemInfo.id)]
            if (item.level > userinfo.Grade) {
                this.getPromptShow("hero_not_enough_grade", item.level);
            }
            else {
                var equips = userinfo.Equips
                var isHaveFlag = false;
                var kk;
                for (var k in equips) {
                    if (this.itemInfo.id.substring(2,3) == equips[k].id.substring(2,3)) {
                        isHaveFlag = true;
                        kk = k;
                    }
                }
                var arraySub = this.getBagArraySub(this.itemInfo.UniqueID);
                if (isHaveFlag)
                {
                    var equK = equips[kk];
                    equips.splice(kk, 1, this.itemInfo);
                    baginfo.splice(arraySub, 1, equK);
                } else {
                    equips.push(this.itemInfo);
                    baginfo.splice(arraySub, 1);
                }
                this.onMaskLayerClick();
            }*/       
        }
        //baginfo.sort(function(a,b){ return a.id - b.id })
        //db.set("UserInfo", userinfo, 1);
        // db.set("BagInfo", baginfo, 1);
    }, 

    getEquipArraySub: function (UniqueID) {
        var equip = db.get("UserInfo", true).Equips;
        for (var k in equip)
            if (UniqueID == equip[k].UniqueID)
                return k;
    },

    getBagArraySub: function (UniqueID) {
        var bag = db.get("BagInfo", true);
        for (var k in bag)
            if (UniqueID == bag[k].UniqueID)
                return k;
    },

    textColor: function (item, quality) {
    	if (quality == 1) 
    		item.color = new cc.color(255,255,255);
	    else if (quality == 2)
	        item.color = new cc.color(0,255,0);
	    else if (quality == 3)
	        item.color = new cc.color(0,0,255);
	    else if (quality == 4)
	        item.color = new cc.color(128,0,128);
	    else if (quality == 5)
	        item.color = new cc.color(255,165,0);
        else if (quality == "red")
            item.color = new cc.color(255, 0, 0);
        else if (quality == "green")
            item.color = new cc.color(0, 238, 0);
    },

    qualityColor: function (item, quality) {
        cc.loader.loadRes("images/Character/character", cc.SpriteAtlas, function(err, atlas){
            if (err) { log (err); return; }
            var img = "fquality" + (quality-1).toString();
            var frame = atlas.getSpriteFrame(img);
            item.getComponent(cc.Sprite).spriteFrame = frame;
        });
    },
    
    onMaskLayerClick: function () {
        this.onDestroy();
        this.detailsBoxNode.removeFromParent();
    },

    getPromptShow: function (cs, data) {
        var promptBox = cc.instantiate(this.promptBox);
        promptBox.setPosition(cc.p(0,0));
        promptBox.getComponent("PromptBox").getMsgFrom(cs, data);
        this.detailsBoxNode.addChild(promptBox);
    }
});
