var utils             = require("utils");
var log               = utils.log;
var AStar             = require("AStarJs");
var music             = require("music")
var FightLogicManager = require("FightLogicManager");
var configDataMgr     = require("configDataMgr");
var eventCenter       = require("eventCenter");
var GameDefine        = require("GameDefine");
var nativeServer      = require("nativeServer");
var DataMgr           = require("DataMgr");
var mainSceneClass = cc.Class({
    extends: cc.Component,

    properties: {
        canvasNode : cc.Node,
        heroPrefab : cc.Prefab,
        monsterPrefab : cc.Prefab,
        mapNode   : cc.Node,
        escapeBtn : cc.Node,
        monsterInfoBar : cc.Node,
        chooseMapPrefab : cc.Prefab,
        chooseMapContent : cc.Node,
        buildClickAudio : cc.AudioClip,
        transportStartAudio : cc.AudioClip,
        heroLayer : cc.Prefab,       //角色
        heroLayerNode : cc.Node,     //角色
        SkillLayerPrefab : cc.Prefab,//技能
        SkillLayerNode : cc.Node,    //技能
        warehousePrefab : cc.Prefab, //仓库
        warehouseNode : cc.Node,     //仓库
        storePrefab : cc.Prefab,     //商店
        storeNode : cc.Node,    //装备商店
        shipPrefab : cc.Prefab, //飞船
        shipNode   : cc.Node,   //飞船
        playerHpN : cc.Node, //英雄的声明条
        playerExpN : cc.Node,//英雄的经验条
        PlayerDieN : cc.Node,//死亡菜单
    },

    // use this for initialization
    onLoad: function () {
        mainSceneClass.instance = this;
        this.initGameData();
        this.initMap();
        this.initMonsterInfoBar();
        this.registerEventCenter();        
    },
    update : function(dt){
        FightLogicManager.update(dt);
    },

    registerEventCenter : function() {
        var self = this;
        var db = require("db");
        eventCenter.new("FightLayerHeroInfo", "HeroListInfo", function(event, data){
            //self.showHeroData(data)
        }, true)
        eventCenter.new("FightLayerBackEnd", "playerBackEnd", function(event, data){
            self.battleEnd(data);   
        })
    },

    onDestroy : function() {
        this.onExit();
    },

    onExit : function() {
        eventCenter.delete("FightLayerHeroInfo")
        eventCenter.delete("FightLayerBackEnd")
        //eventCenter.new("FightLayerResurFixMapPos")
    },

    initMonsterInfoBar : function(){
        var self                   = this; 
        this.escapeBtn.active      = false;
        this.monsterInfoBar.active = false;
        this.PlayerDieN.active     = false;
        this.monsterInfoBar.refreshNode = function(data){
            var hpBar                                   = self.monsterInfoBar.getChildByName("hpBar");
            hpBar.getComponent(cc.ProgressBar).progress = data.hp / data.hpMax;
            var displayL                                = hpBar.getChildByName("content").getComponent(cc.Label);
            displayL.string                             = data.hp + "/" +  data.hpMax
            var name                                    = self.monsterInfoBar.getChildByName("name").getChildByName("content");
            name.getComponent(cc.Label).string          = data.name;
        }
    },

    //初始化地图
    initMap : function() {
        FightLogicManager.initBlockList(this.mapNode.getComponent(cc.TiledMap), this.mapNode);
        FightLogicManager.initMainCity(this.onManangerCallback);
        this.addhero();
        this.addMonster();
        this.registerBuildOpenCBList();
    },

    addhero : function() {
        var heroNode  = cc.instantiate(this.heroPrefab);
        this.mapNode.addChild(heroNode, 10);
        heroNode.setPosition(FightLogicManager.playerInfo.pos);
        this.player   = heroNode.getComponent("FightHero");
        var userData  = {};
        userData.info = FightLogicManager.playerInfo;
        this.player.initData(userData);
        FightLogicManager.addHeroObj(this.player);
        FightLogicManager.setMapPosition();
    },

    addMonster : function(){
        //是否消灭了主城的怪物
        var isBateCityMonster = require("db").get("UserInfo").IsBateCityMonster;
        if(!isBateCityMonster){
            var mapCfg = configDataMgr.MapCfg[999];
            FightLogicManager.initFightMonsterInfo(mapCfg);
            var fightMonsterInfo = FightLogicManager.fightMonsterInfo;
            for(let k in fightMonsterInfo) {
                let v          = fightMonsterInfo[k]
                let monserNode = cc.instantiate(this.monsterPrefab);
                this.mapNode.addChild(monserNode, 9);
                monserNode.setPosition(v.objPos.pos)
                let monsterJS  = monserNode.getComponent("FightMonster");
                monsterJS.initData(this.monsterInfoBar, this.escapeBtn, v);
                FightLogicManager.addMonsterObj(v.objPos.posIndex, monsterJS)
            }
        }
    },

    //注册每个建筑的打开方法 //名字是策划标记在地图文件里的
    registerBuildOpenCBList : function() {
        var cbList = {};
        cbList["EquipmentStore"]         = this.onShopBtnClick;
        cbList["DepartmentStore"]        = this.onShopZhBtnClick;
        cbList["PharmaceuticalWorkshop"] = this.onWorkBtnClick;
        cbList["EquipmentWorkshop"]      = this.onUserBtnClick;
        cbList["Warehouse"]              = this.onWarehouseBtnClick;
        cbList["Airship"]                = this.onLoadingPortalBtnClick;
        this.BuildOpenCBList = cbList;
    },
    //初始化游戏数据
    initGameData : function(){
        music.init();
        configDataMgr.init();
        nativeServer.login(); 
        DataMgr.init();
    },   

    //点击地图
    onTiledMapChilked : function(eventTouch){
        var touchPos      = this.mapNode.convertTouchToNodeSpaceAR ( eventTouch )
        FightLogicManager.mainCityFindPath(this.player.getInfo().posIndex, touchPos);
    },

     onUserBtnClick: function() {
        music.playEffect(this.buildClickAudio, false)
        var heroNode               = cc.instantiate(this.heroLayer);
        heroNode.setPosition(cc.p(0,0));
        this.heroLayerNode.active  = true;
        this.heroLayerNode.opacity = 0;
        var heroLayerScript        = heroNode.getChildByName("heroLayerScript").getComponent("HeroLayer")
        heroLayerScript.initCanvaseNode(this.canvasNode);
        this.heroLayerNode.addChild(heroNode);

    },

    //材料商店
    onShopZhBtnClick: function() {
        music.playEffect(this.buildClickAudio, false)
        this.showStoreNode(GameDefine.STORETYPE.MATERIAL);
    },

    onSkillBtnClick: function() {
        music.playEffect(this.buildClickAudio, false)
        this.SkillLayerNode.active = true;
        var skillNode = cc.instantiate(this.SkillLayerPrefab);
        skillNode.setPosition(cc.p(0,0));
        this.SkillLayerNode.addChild(skillNode);
        this.canvasNode.getComponent("MainSceneAnim").showSkill();
    },

    //统计
    onStatisticsBtnClick: function() {
       music.playEffect(this.buildClickAudio, false)
    },

    //设置
    onSetBtnClick: function() {
        music.playEffect(this.buildClickAudio, false)
    },

    //战斗地图选择
    onPortalBtnClick: function() {
        this.chooseMapContent.active = true;
        var chooseNode = cc.instantiate(this.chooseMapPrefab);
        chooseNode.setPosition(cc.p(0,0));
        this.chooseMapContent.addChild(chooseNode);
    },
    //仓库
    onWarehouseBtnClick: function() {
        music.playEffect(this.buildClickAudio, false)
        this.warehouseNode.active = true;
        var warehose = cc.instantiate(this.warehousePrefab);
        warehose.setPosition(cc.p(0,0));
        this.warehouseNode.addChild(warehose);
        this.canvasNode.getComponent("MainSceneAnim").showWarehouse();
    },

    //
    onWorkBtnClick: function() {
        music.playEffect(this.buildClickAudio, false)

    },
    //图书馆
    onLabBtnClick: function() {
        music.playEffect(this.buildClickAudio, false)
    },

    //装备商店
    onShopBtnClick: function() {
        music.playEffect(this.buildClickAudio, false)
        this.showStoreNode(GameDefine.STORETYPE.EQUIP);
    },

    onStoreBtnClick: function() {
    },

    onShipBtnClick: function() {
        music.playEffect(this.buildClickAudio, false)
        this.warehouseNode.active = true;
        var ship = cc.instantiate(this.shipPrefab);
        ship.setPosition(cc.p(0,0));
        this.shipNode.addChild(ship);
        this.canvasNode.getComponent("MainSceneAnim").showShip();
    },

    onHeadBtnClick: function() {
       music.playEffect(this.buildClickAudio, false)
    },

    onGoldBtnClick: function() {
        music.playEffect(this.buildClickAudio, false)
    },

    onDiamondBtnClick: function() {
       music.playEffect(this.buildClickAudio, false)
    },

    onLoadingBarBtnClick: function() {
       music.playEffect(this.buildClickAudio, false)
    },

    onLoadingPortalBtnClick: function() {
        music.playEffect(this.transportStartAudio, false)
        cc.director.loadScene("LoadingProtal");
    },

    showStoreNode : function(type) {
        this.storeNode.active = true;
        var storePrefab = cc.instantiate(this.storePrefab);
        storePrefab.setPosition(cc.p(0,0));
        this.storeNode.addChild(storePrefab);
        storePrefab.getComponent("storeScene").showStoreList(type);
        this.canvasNode.getComponent("MainSceneAnim").showStore();
    },

    PlayerDie : function(){
        this.hideMonsterBar();
        this.showPlayerDieN();
    },

    hideMonsterBar : function() {
        this.escapeBtn.active      = false;
        this.monsterInfoBar.active = false;
    },

    showMonsterBar : function() {
        this.escapeBtn.active      = true;
        this.monsterInfoBar.active = true;
    },

    showPlayerDieN : function(){
        this.PlayerDieN.active = true;
    },

    hidePlayerDieN : function() {
        this.PlayerDieN.active = false;
    },

    EscapeResult : function(data) {
        this.escapeBtn.active = false;
    },

    battleEnd : function(data){
        var endType = GameDefine.END_BATTLE_TYPE;
        if(data.type === endType.PLAYERESCAPE){
            this.EscapeResult();
        }else if (data.type === endType.MONSTER_DEAD){
            FightLogicManager.onMonsterDie(data.content);
            this.saveMonsterData();
            this.hideMonsterBar();
            var startPosIndex = this.player.getInfo().posIndex;
            FightLogicManager.mainCityFindPath(startPosIndex, data.content.pos);
        }else if (data.type === endType.PLAYER_DEAD){
            this.PlayerDie();
        }
    },

    //保存地图上的怪物信息
    saveMonsterData : function() {
        var db = require("db");
        var userInfo = db.get("UserInfo");
        userInfo.IsBateCityMonster = true;
        db.set("UserInfo", userInfo);
    },

    onManangerCallback : function(type, data) {
        var self = mainSceneClass.instance;
        if(type === "openBuild") {
            var buildName = data
            var buildOpenCB = self.BuildOpenCBList[buildName];
            if(!buildOpenCB) { 
                log(" this buildName " + buildName + " not register clicked callback");
                return
            }
            buildOpenCB.call(self);
        }
    },

});
