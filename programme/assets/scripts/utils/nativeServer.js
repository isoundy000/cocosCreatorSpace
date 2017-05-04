var NativeServer       = {};
var configDataMgr      = require("configDataMgr");
var GameDefine         = require("GameDefine")
var LogicObjectManager = require("LogicObjectManager");
var utils              = require("utils");
var log                = utils.log;
var dataPath           = "spacevarData";
var DataMgr            = require("DataMgr");
//var fileUtils = cc.FileUtils.getInstance()


NativeServer.newUniqueID= function () {
	if( ! NativeServer.UniqueIDPool || NativeServer.UniqueIDPool.length <= 0 ){
		NativeServer.UniqueIDPool = []
		var head = (new Date()).getTime()
		for (var i = 1; i < 101; i++) {
			NativeServer.UniqueIDPool.push( head + "_" +i);
		}
	}
	var id = NativeServer.UniqueIDPool[0]
	NativeServer.UniqueIDPool.splice(0, 1);
	return id
}

NativeServer.login = function(playerID) {
	var db = require("db");
	var userInfo = db.get("UserInfo")
	if( userInfo ){
		return
	}
	playerID = playerID || "playerID"; //create playerId
	this.playerID = playerID;
	var dbFile = JSON.parse(cc.sys.localStorage.getItem(dataPath + playerID ));
	if(!dbFile) {
		dbFile = this.createNewUserData(playerID);
	}
	for(let k in dbFile){
		db.GameData[k] = dbFile[k]
	}
	this.saveDB();
	//creat hero obj 
	var bagList  = db.get("BagInfo");
	for(let k in bagList){
		let v = bagList[k];
		if(v.type === GameDefine.PROPS_TYPE.EQUIP){
			LogicObjectManager.newEquipmentObj(v);
		}else if(v.type === GameDefine.PROPS_TYPE.MATERIAL){
			LogicObjectManager.newMaterialObj(v)
		}
	}

	var warehouseInfo = db.get("WarehouseInfo");
	for(let k in warehouseInfo){
		let serverData = warehouseInfo[k];
		if(serverData.type === GameDefine.PROPS_TYPE.EQUIP){
			LogicObjectManager.newEquipmentObj(serverData);
		}
	}

	var heroList = db.get("HeroListInfo");
	for(let k in heroList) {
		let hero = heroList[k];
		for(let k in hero.Equips) {
			let equipData = hero.Equips[k];
			LogicObjectManager.newEquipmentObj(equipData);
		}
	}
	this.refreHeroLogicData();


}

NativeServer.getCurHeroData = function() {
	var curHeroId         = require("db").get("UserInfo").curHeroId
    var heroData          = LogicObjectManager.getHeroObj(curHeroId);
    return heroData;
}

NativeServer.defeatMonster = function(sendData){
	var configID    = sendData.configId;
	var monsterData = configDataMgr.MonsterCfg[configID];
	var curHeroId   = require("db").get("UserInfo").curHeroId;
	this.addHeroExp(curHeroId, monsterData.exp);
	this.changeGold(monsterData.money);
	var dropCfg     = configDataMgr.DropCfg[monsterData.drop]
	var rewards     = this.getDropReward(dropCfg);
	var content     = {};
	content.data    = rewards;
	var errCode     = this.addGameResItem(rewards)
	if(errCode){
		content.type = DataMgr.DataDynType.FAILE;
		content.data = errCode;
	}	
	return content
}

//打开战斗地图的宝箱
NativeServer.openFightMapBox = function(sendData){
	var boxCfg   = configDataMgr.MapBoxCfg[sendData.boxCfgID];
	var dropCfg  = configDataMgr.DropCfg[boxCfg.drop];
	var rewards  = this.getDropReward(dropCfg);
	var content  = {};
	content.type = DataMgr.DataDynType.OK;
	content.data = rewards;
	var errCode  = this.addGameResItem(rewards)
	if(errCode){
		content.type = DataMgr.DataDynType.FAILE;
		content.data = errCode;
	}	
	return content
}

//脱下装备
NativeServer.equipmentOff = function(sendData){
	var db = require("db");
	var content = {};
	var bagInfo = db.get("BagInfo"); 

	//背包已经满了
	if(bagInfo.length >= db.get("UserInfo").MaxBagCount) {
		content.type = DataMgr.DataDynType.FAILE;
		content.data = DataMgr.ErrorCodeList.code_1;
		return content;
	}
	var heroData = this.getCurHeroData();
	var UniqueID = sendData.UniqueID;
	var equipData;
	for(let k in heroData.Equips) {
		if(heroData.Equips[k].UniqueID === UniqueID){
			equipData =utils.cloneData(heroData.Equips[k]);
			heroData.Equips.splice(k, 1);
			break;
		}
	}
	bagInfo.unshift(equipData);
	db.set("BagInfo", bagInfo);
	var curHeroId              = db.get("UserInfo").curHeroId;
	var heroList               = db.get("HeroListInfo");
	heroList[curHeroId].Equips = heroData.Equips;
	this.refreHeroLogicData(heroList);
	db.set("HeroListInfo", heroList);
	return content;
}

//穿戴装备
NativeServer.equipmentOn = function(sendData){
	var db = require("db");
	var content = {};
	var heroData = this.getCurHeroData();
	var equipLogicData = LogicObjectManager.getEquipmentObj(sendData.UniqueID);
	//等级不够
	if(equipLogicData.level > heroData.level){
		content.type = DataMgr.DataDynType.FAILE;
		content.data = DataMgr.ErrorCodeList.code_2;
		return content;
	}
	var bagInfo = db.get("BagInfo");
	var addEquip;
	for(let k in bagInfo){
		if(bagInfo[k].UniqueID === sendData.UniqueID){
			addEquip = utils.cloneData(bagInfo[k]);
			bagInfo.splice(k, 1);
			break;
		}
	}
	var offEquip;
	var curPart = LogicObjectManager.getEquipmentObj(sendData.UniqueID).part;
	//当前格子有装备才替换
	if(utils.getPartOfEquipment(curPart)) {
		var curPartUniqueID = utils.getPartOfEquipment(curPart).UniqueID;
		for(let k in heroData.Equips) {
			if(heroData.Equips[k].UniqueID === curPartUniqueID){
				offEquip = utils.cloneData(heroData.Equips[k]);
				heroData.Equips.splice(k, 1);
				break;
			}
		}
	}
	
	
	if(offEquip) {
		bagInfo.unshift(offEquip);
	}
	
	heroData.Equips.unshift(addEquip);
	db.set("BagInfo", bagInfo);
	var curHeroId              = db.get("UserInfo").curHeroId;
	var heroList               = db.get("HeroListInfo");
	heroList[curHeroId].Equips = heroData.Equips;
	this.refreHeroLogicData(heroList);
	db.set("HeroListInfo", heroList);
	return content;
}


NativeServer.getDropReward = function(dropCfg){
	var self = this;
	var dropList = {};
	var DropType = GameDefine.DROP_RANDOM_TYPE
	var getReward = function(srcDrop){
		var curDropList = new Array();;
		let maxDropNum = utils.intRandom(srcDrop.MinCount, srcDrop.MaxCount);
		for(let i = 0; i < maxDropNum; i++){
			let randomNum = Math.random();
			let curRanNum = 0;
			for(let k in srcDrop.reward){
				k = parseInt(k);
				let value = srcDrop.reward[k]
				if(srcDrop.type === DropType.RANSELECTION){
					curRanNum = (1 + k)/srcDrop.reward.length;
				}else if (srcDrop.type === DropType.PROSELECTION){
					curRanNum += value.odds / 10000;
				}
				if(randomNum <= curRanNum) {
					curDropList.push(value.id);
					break;
				}
			}
			
		}
		for(let k in curDropList){
			let v = curDropList[k];
			//如果掉落的还是宝箱继续获取奖励
			if(configDataMgr.DropCfg[v]){
				getReward(configDataMgr.DropCfg[v])
			}else {
				if(!dropList[v]){
					dropList[v]          = {};
					dropList[v].id       = v;
					dropList[v].type     = utils.getPropsType(v);
					dropList[v].UniqueID = self.newUniqueID();
					dropList[v].count    = 1;
					if(dropList[v].type === GameDefine.PROPS_TYPE.EQUIP){
						dropList[v].name = utils.getText(configDataMgr.EquipCfg[v].name);
					}else if(dropList[v].type === GameDefine.PROPS_TYPE.MATERIAL){
						dropList[v].name = utils.getText(configDataMgr.StuffCfg[v].name);
					}
				}else {
					dropList[v].count += 1;
				}

			}
		}
	}
	getReward(dropCfg);
	return dropList
}

NativeServer.addGameResItem = function(itemList) {
	var errCode;
	var db = require("db");
	var bagInfo = db.get("BagInfo"); 
	for(let k in itemList){
		let v = itemList[k];
		let itemData = {};
		itemData.id = v.id;
		itemData.UniqueID = v.UniqueID;
		itemData.isNew = true;
		itemData.number = v.count;
		itemData.Prop = {};
		itemData.type = v.type;
		if(v.type === GameDefine.PROPS_TYPE.EQUIP){
			itemData.Prop = this.getEquipmentPropes(itemData);
			LogicObjectManager.newEquipmentObj(itemData);
		}else if (v.type === GameDefine.PROPS_TYPE.MATERIAL){
			LogicObjectManager.newMaterialObj(itemData);
		}
		//添加到数组最前面	
		if(bagInfo.length < db.get("UserInfo").MaxBagCount){
			bagInfo.unshift(itemData);
		}else {
			errCode = DataMgr.ErrorCodeList.code_1;
		}
		
	}
	db.set("BagInfo", bagInfo);
	return errCode;
}


NativeServer.changeGold = function(gold) {
	var db = require("db");
	var userInfo = db.get("UserInfo");
	userInfo.Gold += gold;
	db.set("UserInfo", userInfo);
}

NativeServer.addHeroExp= function(heroId, add_exp){
	var heroData = LogicObjectManager.getHeroObj(heroId)
	var newLevel = heroData.level;
	var sumExp = heroData.sumExp;
	var curExp = heroData.exp; 
	var addExp = function(exp) {
		var nextLevelExp = sumExp - curExp;
		if(exp >= nextLevelExp) {
			newLevel+=1;
			sumExp = GameDefine.getSumExpByLevel(newLevel);
			curExp = 0;
			addExp(exp - nextLevelExp);
		}else {
			curExp += exp;
		}
	}
	addExp(add_exp);

	var db = require("db");
	var HeroListInfo = db.get("HeroListInfo");
	HeroListInfo[heroId].exp = curExp;
	HeroListInfo[heroId].level = newLevel;
	heroData.fromServarData.call(heroData, HeroListInfo[heroId]);
	db.set("HeroListInfo", HeroListInfo);
}

NativeServer.createNewUserData = function(id) {
	var data                   = {}
	/* 玩家数据信息 */
	var userInfo               = {}
	userInfo.id                = id
	userInfo.Grade             = 11
	userInfo.Name              = id.toString();
	userInfo.Gold              = 999998
	userInfo.Diamond           = 199
	userInfo.battleMapIndex    = 1
	userInfo.SP                = 200
	userInfo.Skills            = this.setSkills(userInfo.Grade)
	userInfo.SumExp            = 0;//this.getSumExp(userInfo.Grade)
	userInfo.BagNum            = 2
	userInfo.MaxBagCount       = 300;
	userInfo.WarehouseNum      = 2;
	userInfo.IsBateCityMonster = false; //是否击败了主城怪物
	/* 背包数据 */
	var bag = []
	var EquipID = ["20000101","20000102","20000103","20001501","20100103","20200104",
					 "20300101","20400101","20500102","20500104","20600102","20600103"]
	for ( var k in EquipID) {
		bag.push( this.createNewEquip(EquipID[k]) );
	}
	var MaterialInit = [["30000104", 2], ["30000302", 1], ["30000200", 1], ["30000203", 1],//药品
					    ["30000503", 2], ["30000701", 3], 
						["30100100", 4], ["30100104", 3], ["30100200", 2], ["30100300", 2],//装备材料
						["30100302", 3], ["30100303", 1], ["30100304", 3], ["30100400", 1],
						["30100401", 1], ["30100500", 1], ["30100502", 1], ["30100600", 1],
						["30100601", 1], ["30100700", 1],
						["30200100", 2], ["30200101", 2], ["30200102", 2], ["30200103", 1],//药品材料
						["30200104", 4], ["30200200", 1], ["30200201", 1], ["30200303", 1],
						["30200304", 1], ["30200400", 1], ["30200700", 2], ["30201400", 2],
						["30400005", 1],
						["30400006", 1], ["30400007", 1], ["30400008", 1], ["30400009", 1],//飞船材料
						["30400013", 1],
					   ]
	for (var k in MaterialInit) {
		var id = MaterialInit[k][0];
		var num = MaterialInit[k][1];
		var drug = {id :id, Prop : {}, UniqueID : this.newUniqueID(), isNew : true, number : num};
		drug.type = GameDefine.PROPS_TYPE.MATERIAL;  
		bag.push(drug);
	}

	/* 药品合成数据 */
	var drugInfo = [];
	for(let k in configDataMgr.MakeCfg){
		drugInfo.push(configDataMgr.MakeCfg[k]);

	}
	drugInfo.sort(function(a,b){ return a.id - b.id })

	/* 飞船数据 */
	var spaceShipInfo = {}
	var shipID = []
	for (var i = 0; i < 5; i++) {
		shipID[i] = "6040000"+i;
	}
	
	var sPart = ["body","balance","power","defense","operating"]
	for(let k in configDataMgr.ShipMixCfg){
		let v = configDataMgr.ShipMixCfg[k];
		var shipCount = 0
		for (var i = 0; i < 5; i++) {
			shipCount = shipCount + 1
			if( parseInt(shipID[shipCount]) === v.id ){
				spaceShipInfo[sPart[shipCount]] = { ID : v.id, name: v.name, chapter:[0,0,0,0,0],
					mate : { id1 : v.item1, name1: configDataMgr.StuffCfg[v.item1].name, num1 : v.count1,
						     id2 : v.item2, name2: configDataMgr.StuffCfg[v.item2].name, num2 : v.count2,
					         id3 : v.item3, name3: configDataMgr.StuffCfg[v.item3].name, num3 : v.count3,}, 
					collect: false, fix: false,}
				if( v.item4 != -1 ){
					spaceShipInfo[sPart[shipCount]].mate.id4 = v.item4
					spaceShipInfo[sPart[shipCount]].mate.name4 = configDataMgr.StuffCfg[v.item4].name
					spaceShipInfo[sPart[shipCount]].mate.num4 = v.count4
				}
				if( v.item5 != -1 ){
					spaceShipInfo[sPart[shipCount]].mate.id5 = v.item5
					spaceShipInfo[sPart[shipCount]].mate.name5 = configDataMgr.StuffCfg[v.item5].name
					spaceShipInfo[sPart[shipCount]].mate.num5 = v.count5
		        }
		    }
		}
	}

	/* 仓库数据 */
    var warehInfo = []
    for(let k in bag){
        if( k < 5 ){
            warehInfo.push(bag[k])
        }
    }
	warehInfo.push(this.createNewEquip("20200100"))
	warehInfo.push(this.createNewEquip("20300100"))
	warehInfo.push(this.createNewEquip("20400100"))
	warehInfo.push(this.createNewEquip("20500100"))
	warehInfo.push(this.createNewEquip("20600100"))
    warehInfo.push(this.createNewEquip("20700100"))

    /* 商店数据 */
	var shopUpdateTime = {}
	shopUpdateTime.hour = 1
	shopUpdateTime.minute = 59
	shopUpdateTime.second = 60
	shopUpdateTime.leaveTime = (new Date()).getTime()

	/* 英雄数据 */
	var heroList            = {};
	var hero1               = {id:101, level:1, exp:0}
	var heroEquips = [20000100, 20200100, 20300100, 20500103, 20700504];
	hero1.Equips = [];
	for(let k in heroEquips) {
		hero1.Equips.push(this.createNewEquip(heroEquips[k]));
	}
	heroList[hero1.id]      = hero1;
	userInfo.curHeroId      = hero1.id;
	data.UserInfo           = userInfo
	data.BagInfo            = bag
	data.WarehouseInfo      = warehInfo
	data.DrugInfo           = drugInfo
	data.SpaceshipInfo      = spaceShipInfo
	data.ShopUpdateTime     = shopUpdateTime
	data.MateShopUpdateTime = shopUpdateTime
	data.HeroListInfo       = heroList;
	return data
}

NativeServer.setSkills = function(grade) {
	var skills = {}
	skills.initiative ={}
	skills.passive = {}
	skills.skillPoint = grade * 3
	for (var i = 0; i < 6; i++) {
		skills.initiative[i] = {}
		skills.initiative[i].studyLevel = 0
		skills.passive[i] = {}
		skills.passive[i].studyLevel = 0
	}
	return skills
}

NativeServer.createNewEquip= function(id) {
	var serverData = {};
	serverData.id = id;
	serverData.type = GameDefine.PROPS_TYPE.EQUIP;
	serverData.UniqueID = this.newUniqueID();
	this.getEquipmentPropes(serverData);
	return serverData;
}

NativeServer.saveDB = function(){
	var db = require("db");
	cc.sys.localStorage.setItem(dataPath + this.playerID, JSON.stringify(db.GameData));
}

//设置背包的道具不再是新道具
NativeServer.setBagItemIsRead = function(UniqueID){
	var db = require("db");
	var bagInfo = db.get("BagInfo");
	for(let k in bagInfo) {
		if(bagInfo[k].UniqueID === UniqueID){
			bagInfo[k].isNew = false;
			//再把LogicObjectManager中的数据覆盖成最新的。
			if(bagInfo[k].type === GameDefine.PROPS_TYPE.MATERIAL){
				LogicObjectManager.newMaterialObj(bagInfo[k]);
			}else if(bagInfo[k].type === GameDefine.PROPS_TYPE.EQUIP){
				LogicObjectManager.newEquipmentObj(bagInfo[k]);
			}
			break;
		}
	}
	db.set("BagInfo", bagInfo, true);
}

NativeServer.getExtendedProperty = function(){
    var userInfo = require("db").get("UserInfo", 1)
    var data = {}
    for(let k in userInfo.Equips) {
    	let equip = userInfo.Equips[k];
    	for(let  key in equip.Prop) {
    		var findFlag = false
    		let value = equip.Prop[key]
    		for (let  k in data) {
    			if (k === key) {
    				data[k] = data[k] + equip.Prop[key]
    				findFlag = true
    			}
    		}
    		if (! findFlag) {
    			data[key] = equip.Prop[key]
    		}
    	}
    }
    return data
}

//获取装备新的扩展属性，如果升阶了再来随机一次
NativeServer.getEquipmentPropes = function(equipment){
	equipment.Prop = equipment.Prop || {};
	var baseData = configDataMgr.EquipCfg[equipment.id];
	var minNum = 0; 
	var maxNum = 0;
	if( baseData.quality === 2 ){
		minNum = 1;
		maxNum = 1;
	}else if( baseData.quality === 3 ){
		minNum = 1;
		maxNum = 2;
	}else if( baseData.quality === 4 ){
		minNum = 1;
		maxNum = 3;
	}else if( baseData.quality === 5 ){
		minNum = 2;
		maxNum = 4;
	}
	var propes    = {}
	var propeTab  = configDataMgr.PropeCfg[baseData.level];
	//propeTab.level 不是扩展属性不参与下面的方法
	delete propeTab.level;
	var propAttrList = GameDefine.PropEquipAttrList;
	//num 是当前品质下该装备随机到扩展属性总数减去已经存在的属性总数
	var num       = utils.intRandom(minNum, maxNum) - Object.keys(equipment.Prop).length;
	num           = num < 0 ? 0 : num;
	//获取之前莫有的扩展属性
	var newRandomName = function() {
		var exitPropNum = Object.keys(equipment.Prop).length
		//防止死循环
		if(exitPropNum >= propAttrList.length){return}
		var key  = utils.intRandom(0, propAttrList.length -1);
		var name = propAttrList[key]
		if(equipment.Prop[name] || !propeTab[name]){
			//保证一定要获取到没有的扩展属性
			newRandomName();
		}
		var strArray         = String(propeTab[name]).split(",")
		var value            = utils.intRandom(strArray[0], strArray[1]);
		equipment.Prop[name] = value
	}
	for (var i = 0; i < num; i++) {
		newRandomName();		
	}
}

NativeServer.refreHeroLogicData = function(setHeroData) {
	var heroList = setHeroData || require("db").get("HeroListInfo");
	for(let k in heroList) {
		//覆盖
		var heroObj = LogicObjectManager.getHeroObj(heroList[k].UniqueID);
		if(heroObj) {
			heroObj.fromServarData(heroList[k]);
		}else {
			LogicObjectManager.newHeroObj(heroList[k]);
		}
	}
},

module.exports = NativeServer;