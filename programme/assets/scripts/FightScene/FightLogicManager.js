var AStar              = require("AStarJs");
var utils              = require("utils");
var db                 = require("db")
var log                = utils.log;
var GameDefine         = require("GameDefine");
var nativeServer       = require("nativeServer");
var eventCenter        = require("eventCenter");
var configDataMgr      = require("configDataMgr");
var FightLogicManager  = {}


FightLogicManager.initBlockList = function(tiledMap, objectsMap) {
	AStar.initBlockList(tiledMap);
	this.map        = tiledMap;
	this.objectsMap = objectsMap;
	this.initMapInfo();

}
FightLogicManager.addBlockPoint = function(posIndex) {
	AStar.addBlockPoint(posIndex)
}

FightLogicManager.removeBlockPoint = function(posIndex) {
	AStar.removeBlockPoint(posIndex)
}

FightLogicManager.mainCityFindPath = function(start, touchPos) {
	var deType            = GameDefine.PATHEND_TYPE;
	var endData           = this.isCanChangePos(touchPos)
	endData.isChangeBlock = (endData.endType === deType.BOX || 
		endData.endType === deType.MONSTER || 
		endData.endType === deType.BUILD)
	this.findPath(start, endData);
}

FightLogicManager.battleMapFindPath = function(start, touchPos) {
	var deType            = GameDefine.PATHEND_TYPE;
	var endData           = this.isCanChangePos(touchPos)
	endData.isChangeBlock = (endData.endType === deType.BOX || 
		endData.endType === deType.MONSTER)
	this.findPath(start, endData);
}

FightLogicManager.findPath = function(start, endData){
	var end = endData.endPosIndex;
	if(endData.isChangeBlock) {
		this.removeBlockPoint(end)
	}
	var path = AStar.findPath(start, end);
	//如果已经移出了怪物，路径已经寻完要再次加进去
	if(endData.isChangeBlock){
		this.addBlockPoint(end)
	}
	if(!path) {
		log("find AStar path error");
		return;
	}
	var pathList = [];
	for(let k in path) {
		let v          = path[k];
		let temp       = {};
		temp.posIndex  = {xIndex:v.x, yIndex:v.y};
		temp.pos       = this.getPosByMapChildIndex(temp.posIndex);
		pathList.push(temp);
	}
	pathList[pathList.length -1].endType = endData.endType;
	//return pathList;
	this.movePathList = pathList;
	//当英雄没有行走中时才开始马上移动
	if(!this.moveStep){
		this.nextStep();
	}
}

//当前格子是否有怪物、宝箱
FightLogicManager.isCanChangePos = function(touchPos) {
	var posIndex        = this.getMapChildIndexByPos(touchPos);
	var posName         = this.getPosNameByIndex(posIndex);
	var isMonster       = (this.fightMonsterInfo[posName] && !this.fightMonsterInfo[posName].isDeath);
	var isBox           = (this.fightBoxInfo[posName] && !this.fightBoxInfo[posName].isDeath);
	var isBuild         = (this.mapBuildInfo[posName]);
	var deType          = GameDefine.PATHEND_TYPE;
	var posData         = {};
	posData.endType     = isMonster ? deType.MONSTER : deType.NORMAL;
	posData.endType     = isBox ? deType.BOX : posData.endType
	posData.endType     = isBuild ? deType.BUILD : posData.endType
	posData.endPosIndex = posIndex;
	return posData;
}

//是不是相邻的格子
FightLogicManager.isNextPos = function(startPosIndex, endPosIndex){
	var dis = Math.abs(startPosIndex.xIndex - endPosIndex.xIndex) + 
		Math.abs(startPosIndex.yIndex - endPosIndex.yIndex); 
	return ( dis === 1)
}

//初始化battle
FightLogicManager.initFight = function(mapCfg) {
	this.initFightHeroInfo();
	this.initFightMonsterInfo(mapCfg);
	this.initFightBoxInfo(mapCfg);
}

//初始化主城
FightLogicManager.initMainCity = function(callback){
	this.initFightHeroInfo();
	this.initMapBuildInfo();
	this.fightMonsterInfo = {};
	this.fightBoxInfo     = {};
	this.mianCityCB       = callback;
}


//初始化地图信息及英雄位置信息
FightLogicManager.initFightHeroInfo = function(){
	this.fightMapInfo     = {}
	var playerLayer       = this.map.getObjectGroup("player")
	var playerTab         = playerLayer.getObjects()
	var playerInfo        = this.getObjectsPos(playerTab[ utils.intRandom(0, (playerTab.length -1)) ].offset);
	this.fightMapInfo.pos = this.getMapPositonByMonster(playerInfo.pos);
	this.playerInfo       = playerInfo;

}

FightLogicManager.initMapInfo = function() {
	this.tileSize         = this.map.getTileSize()
	this.tileNum          = this.objectsMap.getContentSize()
	this.setAllTagFalse();
}

//初始化地图宝箱
FightLogicManager.initFightBoxInfo = function(mapCfg){
	var fightBoxInfo  = {};
	var boxLayer = this.map.getObjectGroup("mapbox").getObjects();
	var boxList  = [];
	var boxCfgList = mapCfg.boxArray;
	var mapBoxMax = boxLayer
	for (let i = 0; i < mapCfg.boxCount; i++) {
		let boxID       = boxCfgList[ utils.intRandom(0, boxCfgList.length -1) ];
		let objIndex    = utils.intRandom(0, boxLayer.length -1);
		let objLocation = this.getObjectsPos(boxLayer[objIndex].offset);
		boxLayer.splice(objIndex, 1);
		var data        = {}
		data.UniqueID   = nativeServer.newUniqueID();
		data.cfgData    = configDataMgr.MapBoxCfg[boxID];
		data.objPos     = objLocation;
		data.isDestroy  = (data.cfgData.isDestroy === 1);
		fightBoxInfo[this.getPosNameByIndex(objLocation.posIndex)] = data;
		this.addBlockPoint(objLocation.posIndex)
	}
	this.fightBoxInfo = fightBoxInfo;
}

FightLogicManager.initMapBuildInfo = function() {
	var mapBuildInfo = {};
	var buildList       = this.map.getObjectGroup("button").getObjects();
	for(let k in buildList) {
		let objLocation       = this.getObjectsPos(buildList[k].offset);
		var data              = {}
		data.objPos           = objLocation;
		data.name             = buildList[k].name;
		var posName           = this.getPosNameByIndex(objLocation.posIndex)
		mapBuildInfo[posName] = data;
	}
	this.mapBuildInfo = mapBuildInfo;
}

//初始化怪物信息
FightLogicManager.initFightMonsterInfo = function(mapCfg){
		var fightMonsterInfo = {}
		var monsters         = []
		var bosss            = mapCfg.bossArray
		for (var i = 0; i < mapCfg.nomalRatio; i++) {
			var maxLength = mapCfg.normalArray.length - 1;
			var key       = utils.intRandom(0, maxLength);
			monsters.push(mapCfg.normalArray[key])
		}
		for (var i = 0; i < mapCfg.currentRatio; i++) {
			var maxLength = mapCfg.currentArray.length - 1;
			var key       = utils.intRandom(0, maxLength);
			monsters.push(mapCfg.currentArray[key])
		}
		var monsterLayer = this.map.getObjectGroup("monster")
		var monsterObjs  = monsterLayer.getObjects();
		var elited = 0
		for(let k in monsters) {
			var maxLength   = monsterObjs.length - 1;
			var key         = utils.intRandom(0, maxLength);
			var objLocation = this.getObjectsPos(monsterObjs[key].offset);
			//delete obj in array, 防止位置重复
			monsterObjs.splice(key, 1);
			var isElite = false
			if (elited < mapCfg.eliteCount) {
				if (Math.random()* 100 <= mapCfg.eliteOdds) {
					elited = elited + 1
					isElite = true
				}
			}
			var data      = {}
			data.UniqueID = nativeServer.newUniqueID();
			data.dataID   = monsters[k];
			data.objPos   = objLocation;
			data.isDestroy= true; //
			data.isElite  = isElite;
			fightMonsterInfo[this.getPosNameByIndex(objLocation.posIndex)] = data;
			this.addBlockPoint(objLocation.posIndex);
		}
		this.fightMonsterInfo = fightMonsterInfo
		
}

FightLogicManager.getPosNameByIndex= function(pos) {
	return ("x"+pos.xIndex+"y"+pos.yIndex);
}


FightLogicManager.addMonsterObj = function(posIndex, obj) {
	var indexName = this.getPosNameByIndex(posIndex);
	this.fightMonsterInfo[indexName].obj = obj;
}

FightLogicManager.addFightBoxObj = function(posIndex, obj) {
	var indexName = this.getPosNameByIndex(posIndex);
	this.fightBoxInfo[indexName].obj = obj;
}


FightLogicManager.getObjectsPos = function(data) {
	var numx     = Math.floor(data.x / this.tileSize.width)
	var numy     = Math.floor(data.y / this.tileSize.height)
	var posIndex = {xIndex: numx, yIndex : numy}
	var localPos = this.getPosByMapChildIndex(posIndex);
	return {pos : localPos, posIndex : posIndex}
}

FightLogicManager.getMapPositonByMonster = function(monsterPos) {
	return cc.p(0-monsterPos.x, 0-monsterPos.y);
},

FightLogicManager.getMapChildIndexByPos = function(pos) {
	var px   = this.tileNum.width /2 + pos.x;
	var py   = this.tileNum.height/2 - pos.y; 
	var numx = Math.floor(px / this.tileSize.width);
	var numy = Math.floor(py / this.tileSize.height)
	return {xIndex:numx, yIndex : numy};
}

FightLogicManager.getPosByMapChildIndex = function(num) {
	var px = num.xIndex * this.tileSize.width;
	var py = num.yIndex * this.tileSize.height; 
	var x  = px - this.tileNum.width /2 + this.tileSize.width/2 ;
	var y  = this.tileNum.height /2 - py - this.tileSize.height/2;
	return {x:x, y : y};
}

FightLogicManager.startOpenBox = function(playerobj, posIndex){
	var indexName = this.getPosNameByIndex(posIndex);
	var boxInfo = this.fightBoxInfo[indexName];
	boxInfo.obj.playOpening();
}

FightLogicManager.prepareToFight = function(playerobj, monsterPosIndex){
	var posName         = this.getPosNameByIndex(monsterPosIndex);
	log(this.fightMonsterInfo);
	var monster         = this.fightMonsterInfo[posName];
	var heroPosIndex    = playerobj.getInfo().posIndex;
	var monsterPosIndex = monster.objPos.posIndex;
	var targPosition    = this.getPosByMapChildIndex(monsterPosIndex)
	
	var battleData      = {};
	battleData.moveTime = 0.4;
	battleData.monster  = monster;
	var daleDis         = this.tileSize.width * 0.4;
    if(heroPosIndex.xIndex < monsterPosIndex.xIndex || 
        heroPosIndex.yIndex > monsterPosIndex.yIndex) {

            battleData.heroBattlePos = cc.p(targPosition.x - daleDis, 
           		targPosition.y - daleDis)
       		battleData.monsterBattlePos = cc.p(targPosition.x + daleDis, 
           		targPosition.y + daleDis)
    }else {

    	battleData.heroBattlePos = cc.p(targPosition.x + daleDis, 
           		targPosition.y + daleDis)
    	battleData.monsterBattlePos = cc.p(targPosition.x - daleDis, 
           		targPosition.y - daleDis)
    }

    if(heroPosIndex.xIndex < monsterPosIndex.xIndex || 
    	heroPosIndex.yIndex > monsterPosIndex.yIndex) {
    	battleData.battleDirection = "right";
    }else {
    	battleData.battleDirection = "left";
    }
	eventCenter.dispatch("BeginFight", battleData);
}

FightLogicManager.onMonsterDie = function(data){
	this.removeFightInfo(this.fightMonsterInfo, data)
}

FightLogicManager.removeFightInfo = function(fightInfo, data) {
	for(let k in fightInfo) {
		let v = fightInfo[k];
		if (v.UniqueID === data.UniqueID) {
			this.removeBlockPoint(v.objPos.posIndex)
			// delete fightInfo[k];
			fightInfo[k].isDeath = true;
			break;
		}
	}
},

FightLogicManager.onBoxOpened = function(data){
	this.removeFightInfo(this.fightBoxInfo, data)
}

//普通攻击
FightLogicManager.normalAttack = function(attacker, defender) {
	var hurtData  = {};
	//10000是比率值
	var hit       = attacker.hit/10000 - defender.dod/10000;
	hurtData.hurt = undefined;
	if(hit > 0) {
		var hitRandom = utils.intRandom(0, 100);
		if(hitRandom <= hit * 100) {
			//基础伤害             = 自身攻击*rnd(1.0,1.05) - 对方防御
			var baseHurt       = attacker.att * utils.intRandom(100, 105)/ 100 - defender.def;
			//向上取整
			baseHurt           = Math.ceil(baseHurt);
			//暴击伤害             = 基础伤害 * (自身暴击增伤-对方暴击减伤）
			var criHurt        = baseHurt * (attacker.criHurtAdd - defender.criHurtRed)/10000;
			criHurt            = Math.floor(criHurt);
			criHurt            = criHurt < 0 ? 0 : criHurt;
			//额外伤害             = 自身伤害追加 - 对方伤害减免
			var additionalHurt = attacker.attHurtAdd - defender.attHurtRed;
			additionalHurt     = additionalHurt < 0 ? 0 : additionalHurt;
			//暴击率              = 自身暴击率 - 对方抗暴率
			var cri            = (attacker.cri - defender.cri)/10000;
			if(cri > 0) {
				//暴击随机值
				var criRandom = utils.intRandom(0, 100);
				if(criRandom <= cri * 100) {
					hurtData.hurt = baseHurt + criHurt + additionalHurt;
				}else {
					hurtData.hurt = baseHurt + additionalHurt;
				}
			}else {
				hurtData.hurt = baseHurt + additionalHurt;
			}
		}
	}
	return hurtData;
}

FightLogicManager.nextStep = function() {
	if (this.movePathList && this.movePathList.length > 0) {
		if(this.status !== "run") {
			this.status = "run";
		}			
		var moveStep     = this.movePathList.shift();
		//下一步是怪物就开始进入战斗
		if(moveStep.endType === GameDefine.PATHEND_TYPE.MONSTER) {
			this.playerBeginBattle(moveStep);
			return;
		}else if(moveStep.endType === GameDefine.PATHEND_TYPE.BOX) {
			this.openBox(moveStep)
			return;
		}else if(moveStep.endType === GameDefine.PATHEND_TYPE.BUILD) {
			this.openBuild(moveStep)
			return;
		}
		var nextPosIndex = moveStep.posIndex;
		var disx         = Math.floor(moveStep.pos.x - this.player.getPosition().x);
		var disy         = Math.floor(moveStep.pos.y - this.player.getPosition().y);
		var curPosIndex  = this.player.getInfo().posIndex;			
		if (curPosIndex.xIndex === nextPosIndex.xIndex) {
			moveStep.diRection = (curPosIndex.yIndex > nextPosIndex.yIndex) ? "up" : "down";
			moveStep.moveDis   = Math.abs(disy);
		}else {
			moveStep.diRection = (nextPosIndex.xIndex > curPosIndex.xIndex) ? "right" : "left";
			moveStep.moveDis   = Math.abs(disx);
		}
		moveStep.speed = 200;
		this.moveStep  = moveStep;		
	}else{
		this.status = "idle";
		this.playerMovingEnd();
	}
}

FightLogicManager.update = function(dt) {
	this.playerMoving(dt);
}

FightLogicManager.playerMoving = function (dt) {
	if(this.moveStep) {
		var moveDis = dt * this.moveStep.speed;
		moveDis = (this.moveStep.moveDis > moveDis) ? moveDis : this.moveStep.moveDis;
		this.player.moveDis(this.moveStep, moveDis)
		this.moveStep.moveDis -= moveDis;
		if(this.moveStep.moveDis <= 0){
			this.nextStep();
		}
		this.setMapPosition();
	}
		
}

FightLogicManager.playerMovingEnd = function(){
	this.player.playIdle()
	this.movePathList = [];
	this.moveStep = undefined;
}

FightLogicManager.playerBeginBattle = function(moveStep) {
	this.playerMovingEnd();
	this.status = "battle";
	this.prepareToFight(this.player, moveStep.posIndex);
}

//打开宝箱
FightLogicManager.openBox = function(moveStep){
	this.playerMovingEnd();
	this.status = "openBox";
	this.startOpenBox(this.player, moveStep.posIndex);
}

//打开建筑，弹出相应的UI界面
FightLogicManager.openBuild = function(moveStep) {
	this.playerMovingEnd();
	this.status = "openBuild";
	var posName = this.getPosNameByIndex(moveStep.posIndex);
	var buildName = this.mapBuildInfo[posName].name;
	this.mianCityCB("openBuild", buildName)
}


FightLogicManager.addHeroObj = function(player){
	this.player = player;
}

FightLogicManager.setMapPosition = function() {
    var playerPos = this.player.getPosition();
    var mapPos = FightLogicManager.getMapPositonByMonster(playerPos);
	this.objectsMap.setPosition(mapPos);
}

//隐藏所有打的标记
FightLogicManager.setAllTagFalse = function() {
	var setMapLayerFalse = function(layerName) {
		if(this.map.getObjectGroup(layerName)){
			this.map.getObjectGroup(layerName).node.active = false;
		}
	}
	setMapLayerFalse.call(this, "mapbox");
	setMapLayerFalse.call(this, "player");
	setMapLayerFalse.call(this, "monster");
	setMapLayerFalse.call(this, "button");
}
	


module.exports = FightLogicManager;
