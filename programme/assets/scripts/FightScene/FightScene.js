/*
var Player = require(".Player")
var Monster = require(".Monster")
var MapMonsterCfg = require("config.MapMonster")
var MonsterCfg = require("config.MonsterCfg")*/
var utils              = require("utils")
var log                = utils.log;
var eventCenter        = require("eventCenter");
var configDataMgr      = require("configDataMgr");
var db                 = require("db");
var GameDefine         = require("GameDefine");
var nativeServer       = require("nativeServer");
var FightLogicManager  = require("FightLogicManager");
var LogicObjectManager = require("LogicObjectManager")

cc.Class({
    extends: cc.Component,

    properties: {
    	objectsMap : cc.Node,
    	characterPrefab : cc.Prefab,
    	monsterPrefab : cc.Prefab,
    	mapBoxPrefab  : cc.Prefab,
    	escapeBtn : cc.Node,
    	monsterInfoBar : cc.Node,
    	gradeText : cc.Label, 
    	playerHpN : cc.Node, //英雄的声明条
    	playerExpN : cc.Node,//英雄的经验条
    	PlayerDieN : cc.Node,//死亡菜单
    },

    // use this for initialization
    onLoad: function () {	    
	    this.loadMap()
	    this.registerEventCenter();
	    this.initMonsterInfoBar();
    },


    registerEventCenter : function() {
    	var self = this;
    	var db = require("db");
		eventCenter.new("FightLayerHeroInfo", "HeroListInfo", function(event, data){
			self.showHeroData(data)
		}, true)
		this.showHeroData(db.get("HeroListInfo"))
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

	battleEnd : function(data){
		var endType = GameDefine.END_BATTLE_TYPE;
		if(data.type === endType.PLAYERESCAPE){
			this.EscapeResult();
		}else if (data.type === endType.MONSTER_DEAD){
			FightLogicManager.onMonsterDie(data.content);
			this.hideMonsterBar();
			var startPosIndex = this.player.getInfo().posIndex;
			this.movePathList = FightLogicManager.battleMapFindPath(startPosIndex, data.content.pos);
		}else if (data.type === endType.PLAYER_DEAD){
			this.PlayerDie();
		}
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

	ResurFixMapPos : function() {
		log("FightLayerResurFixMapPos");
	},

    

    showHeroData: function() {
		var heroData          = nativeServer.getCurHeroData();
		this.gradeText.string = ("Lv." + heroData.level)
		var expPer            = heroData.exp / heroData.sumExp;
		var expLabel          = this.playerExpN.getChildByName("content").getComponent(cc.Label);
		expLabel.string       = heroData.exp + "/" + heroData.sumExp;
		this.playerExpN.getComponent(cc.ProgressBar).progress = expPer;
	},

	update : function(dt) {
		FightLogicManager.update(dt);
	},

	

	onObjectsMapEnd : function(eventTouch) {
		if(this.player.isInBattle){return}
		var touchPos      = this.objectsMap.convertTouchToNodeSpaceAR ( eventTouch )
		var startPosIndex = this.player.getInfo().posIndex; 
		FightLogicManager.battleMapFindPath(startPosIndex, touchPos);
		
	},

	loadMap : function() {
		var mapData = {}
		mapData.pic = "map/hospital/yiyuan_dt_01.png"
		mapData.tmx = "hospital/yy_map_text";
		var useInfo = require("db").get("UserInfo");
		this.MapCfg = configDataMgr.MapCfg[useInfo.battleMapIndex]; 
		var myThis  = this;
		cc.loader.loadRes("map/" + this.MapCfg.files, cc.TiledMapAsset, function(err, tmxAsset) {
			if(err){
				log("load fight map err"  + err);
				return
			}
			myThis.map          = myThis.objectsMap.getComponent(cc.TiledMap);
			myThis.map.tmxAsset = tmxAsset;
			FightLogicManager.initBlockList(myThis.map, myThis.objectsMap);
			FightLogicManager.initFight(myThis.MapCfg);
			myThis.initMap();
		})
	},

	initMap: function() {
		var fightMonsterInfo = FightLogicManager.fightMonsterInfo;
		this.objectsMap.on(cc.Node.EventType.TOUCH_END, this.onObjectsMapEnd,this);
		var self = this;
		var addHero = function() {
			var spineNode   = cc.instantiate(self.characterPrefab);
			self.objectsMap.addChild(spineNode, 10);
			spineNode.setPosition(FightLogicManager.playerInfo.pos)
			var userData    = {hpBar : self.playerHpN, info : FightLogicManager.playerInfo};
			self.player     = spineNode.getComponent("FightHero");
			self.player.initData(userData);
			FightLogicManager.addHeroObj(self.player);
			FightLogicManager.setMapPosition();
		}
		addHero();
		var addMonster  = function(){
			for(let k in fightMonsterInfo) {
				let v          = fightMonsterInfo[k]
				let monserNode = cc.instantiate(self.monsterPrefab);
				self.objectsMap.addChild(monserNode, 9);
				monserNode.setPosition(v.objPos.pos)
				let monsterJS  = monserNode.getComponent("FightMonster");
				monsterJS.initData(self.monsterInfoBar, self.escapeBtn, v);
				FightLogicManager.addMonsterObj(v.objPos.posIndex, monsterJS)
			}
		}
		addMonster();
		var fightBoxInfo = FightLogicManager.fightBoxInfo
		var addMapBox = function() {
			for(let k in fightBoxInfo) {
				var boxData = fightBoxInfo[k];
				let boxNode = cc.instantiate(self.mapBoxPrefab);
				self.objectsMap.addChild(boxNode, 8);
				boxNode.setPosition(boxData.objPos.pos)
				let boxJs = boxNode.getComponent('FightBox');
				FightLogicManager.addFightBoxObj(boxData.objPos.posIndex, boxJs);
				boxJs.initData(boxData)
			}
		}
		addMapBox();
	},
  
    onMorePropBtnClick: function() {

	},

    onEscapeBtnClick: function(data) {
		eventCenter.dispatch("Escape")
	},

    onMenuBtnClick: function() {
		//this.player.CurrHP = 10
	},

	onBtnBackTownClick : function() {
		cc.director.loadScene("mainScene");
	},
	onBtnReLife : function() {
		this.hidePlayerDieN();
		this.player.reborn();

	},



});
