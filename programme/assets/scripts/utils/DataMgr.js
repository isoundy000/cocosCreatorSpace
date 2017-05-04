var dataMgr = {}
var utils = require("utils");
var log = utils.log;

dataMgr.DataDynType = {
	FAILE : {
		typeId : -1, //失败
	},
	OK : {
		typeId : 0, //成功
	},
	KILL_MONSTER : { //杀死怪物
		typeId : 1,
		content : {
			configId : 1, //数据格式
		} 
	}, 
	EQUIP_ON     : {//穿上装备
		typeId : 2,
		content : {
			UniqueID : 1,
		}
	}, 
	EQUIP_OFF    : { //脱下装备
		typeId : 3,
		content : {
			UniqueID : 1,
		}
	}, 
	OPEN_BOX : { //开箱子
		typeId : 4,
		content : {
			boxCfgID : 1,
		}
	},
};

dataMgr.ErrorCodeList = {
	code_1 : "bag_is_full", //背包格子已经满
	code_2 : "level_no_equip", //等级不够
}

dataMgr.init = function() {
	this.registerAllHandler();
}

dataMgr.registerAllHandler = function () {
	var DataHandlerList                                   = {};
	DataHandlerList[this.DataDynType.KILL_MONSTER.typeId] = require("nativeServer").defeatMonster
	DataHandlerList[this.DataDynType.EQUIP_ON.typeId]     = require("nativeServer").equipmentOn
	DataHandlerList[this.DataDynType.EQUIP_OFF.typeId]    = require("nativeServer").equipmentOff
	DataHandlerList[this.DataDynType.OPEN_BOX.typeId]     = require("nativeServer").openFightMapBox;
	this.DataHandlerList = DataHandlerList;
}

dataMgr.start = function(typeId, formatData, endCB) {
	var handler = this.DataHandlerList[typeId];
	if(!handler) {
		//没有注册实现的方法
		log("this dataMgr typeId :" + typeId + " has no register handler")
	}
	var endData = handler.call(require("nativeServer"), formatData);
	if(endCB) {
		endCB(endData.type, endData.data);
	}
	
}



module.exports = dataMgr;