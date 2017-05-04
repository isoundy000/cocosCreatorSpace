var log                = require("utils").log;
var nativeServer       = require("nativeServer");
var eventCenter        = require("eventCenter");
var LogicObjectManager = require("LogicObjectManager");
var music              = require("music")
var configDataMgr      = require("configDataMgr");
var db                 = require("db");
var utils              = require("utils");

cc.Class({
    extends: cc.Component,
    properties: {
        paranetNode: cc.Node,
        bagPrefab: cc.Prefab,
        detailsBox: cc.Prefab,
        layoutProp: cc.Node,
        yPropBtn: cc.Sprite,
        yBagBtn: cc.Sprite,
        userGrade: cc.Label,
        progressBar: cc.Sprite,
        heroBox: cc.Node,
        attributes: cc.Node,
    },

    onLoad: function () {
        this.initHeroLayer();
        this.initUserEquipment();
        this.refreshHeroAtt();
        this.initBagNode();
        this.registerEventCenter();
    },

    registerEventCenter: function() {
        var self = this;
        eventCenter.new("HeroLayerHeroInfo", "HeroListInfo",  function(event, data) {
            self.refreshHeroEuipment();
            self.refreshHeroAtt();
        }, 1);
        eventCenter.new("HeroLayerEquips", "HeroEquipsOnOff", function(event, data) {
            self.heroEquipsOnOff(data);
        }, 1);
    },

    unRegisterEventCenter : function() {
        eventCenter.delete("HeroLayerHeroInfo");
        eventCenter.delete("HeroLayerEquips");
    },

    onDestroy : function() {
        this.unRegisterEventCenter();
    },

    initHeroLayer: function () {
        this.layoutProp.active = false;
        this.yPropBtn.enabled  = true;
        this.yBagBtn.enabled   = false;
        this.attributes.active = false;
        this.heroBox.active    = true;
    },

    initBagNode : function() {
        this.newBagPrefab      = cc.instantiate(this.bagPrefab);
        this.paranetNode.addChild(this.newBagPrefab);
    },

    initUserEquipment : function() {
        var self = this;
        this.apparelEquipmentNode = this.heroBox.getChildByName("Equips");
        this.apparelEquipmentNode.updateEquipFunc = function(index, equipmentData) {
            if(!self.loadedAtlas){return}            
            var equipNode                         = self.apparelEquipmentNode.children[index];
            self.setEquipDefaultView(equipNode) 
            if(!equipmentData){return}; 
            var frame             = self.loadedAtlas.getSpriteFrame(equipmentData.name); 
            var spriteNode        = equipNode.getChildByName("image");
            spriteNode.active     = true;
            var picSprite         = spriteNode.getComponent(cc.Sprite)
            picSprite.spriteFrame = frame;
            var textLabel         = equipNode.getChildByName("text");
            textLabel.active      = false;
            var qualityBox        = equipNode.getChildByName("qualityBox");
            qualityBox.active     = true;
            var quality           = equipmentData.quality;
            self.qualityColor(qualityBox, quality-1);
            var lnBox             = equipNode.getChildByName('LnBox');
            lnBox.active          = true;
            var lnBText           = lnBox.getChildByName('text').getComponent(cc.Label);
            lnBText.string        = "+" + equipmentData.level;
        }
        //加载装备图集
        cc.loader.loadRes("images/equips/equips", cc.SpriteAtlas, function(err, atlas){
            if (err) { log (err); return; }
            self.loadedAtlas = atlas;
            self.refreshHeroEuipment();
            self.showInAnim();
        });
    },

    //刷新英雄的穿戴装备
    refreshHeroEuipment : function() {
        for(let k in this.apparelEquipmentNode.children){
            this.apparelEquipmentNode.updateEquipFunc(k, utils.getPartOfEquipment(k));
        }
    },
    //刷新英雄的属性
    refreshHeroAtt : function () {
        var heroData               = nativeServer.getCurHeroData();
        this.userGrade.string      = heroData.level;
        this.progressBar.fillRange = heroData.exp/heroData.sumExp;
        var attListNode            = this.attributes.getChildByName("prop").getChildByName("value");
        for (var k in attListNode.children) {
            var attNode = attListNode.children[k];
            var name    = attNode.name;
            var label   = attNode.getComponent(cc.Label);
            var showStr = utils.getAttrRealDisplay(name, heroData[name]) //heroData[name]
            label.string = showStr;
        }
      
    },

    qualityColor: function (item, quality) {
        cc.loader.loadRes("images/Character/character", cc.SpriteAtlas, function(err, atlas){
            if (err) { log (err); return; }
            var img = "yquality" + quality.toString();
            var frame = atlas.getSpriteFrame(img);
            item.getComponent(cc.Sprite).spriteFrame = frame;
        });
    },
    //设置装备项为默认显示
    setEquipDefaultView : function (equipNode) {
        var equChildren = this.heroBox.getChildByName("Equips").children;
        equipNode.getChildByName('text').active       = true;
        equipNode.getChildByName('image').active      = false;
        equipNode.getChildByName('qualityBox').active = false;
        equipNode.getChildByName('LnBox').active      = false;
    },

    onChangeBtnClick: function () {
        this.layoutProp.active = !this.layoutProp.active;
        this.heroBox.enabled   = !this.heroBox.enabled;
        this.yPropBtn.enabled  = !this.yPropBtn.enabled;
        this.yBagBtn.enabled   = !this.yBagBtn.enabled;
        this.attributes.active = !this.attributes.active;
        this.heroBox.active    = !this.heroBox.active;
    },

    onEquipBtnInit: function (event, index) {
        index = parseInt(index);
        var equBtn = this.heroBox.getChildByName("Equips").getChildByName("EquipBtn_"+index);
        var flag = equBtn.getChildByName("image").active;
        if (flag) {
            this.newDetailsBox        = cc.instantiate(this.detailsBox);
            this.paranetNode.addChild(this.newDetailsBox);
            this.newDetailsBox.active = true;
            var detailInfo            = {};
            detailInfo.itemData       = utils.getPartOfEquipment(index -1)
            detailInfo.atlas          = this.loadedAtlas.getSpriteFrame(detailInfo.itemData.name); 
            detailInfo.from           = "heroLayer"
            this.newDetailsBox.getComponent("DetailsBox").detailsBoxShow(detailInfo);
        }
    },

    heroEquipsOnOff: function (data) {
        var equBtn = this.heroBox.getChildByName("Equips").getChildByName("EquipBtn_"+data[1]);
        if (data[0] === "off") {
            equBtn.getChildByName("image").active      = false;
            equBtn.getChildByName("text").active       = true;
            equBtn.getChildByName("qualityBox").active = false;
        }
    },

    closeBtn: function () {
        this.newBagPrefab.getChildByName("bagPrefabScript").getComponent("BagPrefab").onDestroy();
        this.onDestroy();
        this.paranetNode.removeFromParent();
    },
    
    initCanvaseNode : function(canvasNode) {
        this.canvasNode = canvasNode;
    },
    //播放英雄角色界面的进入动画
    showInAnim : function() {
        this.canvasNode.getComponent("MainSceneAnim").showHeroLayer();
    },
    
});
