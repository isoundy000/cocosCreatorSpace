var utils = require("utils");
var log = utils.log;
var GameDefine = require("GameDefine")
var configDataMgr = {
	EquipCfg : {},
	PropeCfg : {},
	MakeCfg  : {},
	StuffCfg : {},
	ShipMixCfg : {},
	TextCfg : {},
	SkillCfg : {},
	MonsterCfg : {},
	MapCfg : {},
	DropCfg: {}, //掉落宝箱
	MapBoxCfg : {},//宝箱
	isInitData : false,
	init : function () {
		if(this.isInitData){return}
		this.isInitData = true;
		//let array type data export to object type data
		///1/////-- TextCfg --/////////
		var localTextCfgData = require("TextCfg");
		var textCfg = {};
		for(var k in localTextCfgData) {
			var value = localTextCfgData[k]
			if(this.isNotAnnotation(value.key)) {
				textCfg[value.key] = value;
			}
		}
		this.TextCfg = textCfg;


		////////-- EquipCfg --/////////
		var localEquipData = require("EquipCfg");
		var equipCfg = {};
		for(var k in localEquipData) {
			var value = localEquipData[k]
			if(this.isNotAnnotation(value.id)){
				equipCfg[value.id] = value;
			}
			
		}
		this.EquipCfg = equipCfg;

		////////-- ShipMixCfg --/////////
		var localShipMixCfgData = require("ShipMixCfg");
		var shipMixCfg = {};   
		
		for(var k in localShipMixCfgData) {
			var value = localShipMixCfgData[k]
			if(this.isNotAnnotation(value.id)) {
				shipMixCfg[value.id] = value;
			}
			
		}
		this.ShipMixCfg = shipMixCfg;

		////////-- PropeCfg --/////////
		var localPropeCfgData = require("PropeCfg");
		var propeCfg = {};
		for(var k in localPropeCfgData) {
			var value = localPropeCfgData[k]
			if(this.isNotAnnotation(value.level)) {
				propeCfg[value.level] = value;
			}
			
		}
		this.PropeCfg = propeCfg;

		////////-- MakeCfg --/////////
		var localMakeCfgData = require("MakeCfg");
		var makeCfg = {};
		for(var k in localMakeCfgData) {
			var value = localMakeCfgData[k]
			if(this.isNotAnnotation(value.id)) {
				makeCfg[value.id] = value;
			}
		}
		this.MakeCfg = makeCfg;

		////////-- StuffCfg --/////////
		var localStuffCfgData = require("StuffCfg");
		var stuffCfg = {};
		for(var k in localStuffCfgData) {
			var value = localStuffCfgData[k]
			if(this.isNotAnnotation(value.id)) {
				stuffCfg[value.id] = value;
			}
		}
		this.StuffCfg = stuffCfg;

		////////-- ShipMixCfg --/////////
		var localShipMixCfgData = require("ShipMixCfg");
		var shipMixCfg = {};
		for(var k in localShipMixCfgData) {
			var value = localShipMixCfgData[k];
			if(this.isNotAnnotation(value.id)) {
				shipMixCfg[value.id] = value;
			}
		}
		this.ShipMixCfg = shipMixCfg;

		////////-- SkillCfg --/////////
		var localSkillCfgData = require("SkillCfg");
		var skillCfg = {};
		for(var key in localSkillCfgData) {
			var value = localSkillCfgData[key];
			if(this.isNotAnnotation(value.id)) {
				value.nameLocal = utils.getText(value.name);
				value.descLocal = utils.getText(value.desc);
				skillCfg[value.id] = value;
			}
		}
		this.SkillCfg = skillCfg;

		////////-- MonsterCfg --/////////
		var localMonsterCfgData = require("MonsterCfg");
		var monsterCfg = {};
		for(var k in localMonsterCfgData) {
			var value = localMonsterCfgData[k];
			if(this.isNotAnnotation(value.id)) {
				monsterCfg[value.id] = value;
				monsterCfg[value.id].attackInterval = value.attackInterval || 1.5 //攻击间隔 每次多少秒
			}
		}
		this.MonsterCfg = monsterCfg;

		////////-- MapBoxCfg --/////////
		var localMapBoxCfgData = require("MapBoxCfg");
		var mapBoxCfg = {};
		for(var k in localMapBoxCfgData) {
			var value = localMapBoxCfgData[k];
			if(this.isNotAnnotation(value.id)) {
				mapBoxCfg[value.id]     = value;
				mapBoxCfg[value.id].res = "animation/mapBox/lajitong/Lajitong"; 
			}
		}
		this.MapBoxCfg = mapBoxCfg;

		////////-- MapCfg --/////////
		var localMapCfgData = require("MapCfg");
		var mapCfg = {};
		for(var k in localMapCfgData) {
			var value = localMapCfgData[k];
			if(this.isNotAnnotation(value.id)) {
				mapCfg[value.id]              = value;
				mapCfg[value.id].normalArray  = this.convertToArrayString(value.normalArray);
				mapCfg[value.id].currentArray = this.convertToArrayString(value.currentArray)
				mapCfg[value.id].boxArray     = this.convertToArrayString(value.boxArray)
				if(value.bossArray !== -1) {
					mapCfg[value.id].bossArray=this.convertToArrayString(value.bossArray)
				}else {
					mapCfg[value.id].bossArray = [];
				} 
			}
		}
		this.MapCfg = mapCfg;
		////////////// DropCfg ------///////////
		var localDropCfgData = require("DropCfg");
		var drop = {};
		for(let k in localDropCfgData){
			let value = localDropCfgData[k];
			if(this.isNotAnnotation(value.id)) {
				drop[value.id] = value;
				drop[value.id].reward = this.convertToArrayObject(value.reward);
			}
		}
		this.DropCfg = drop;
	},

	//是否不是注释  
	isNotAnnotation : function(id) {
		id = String(id);
		return (id.indexOf("##") === -1)
	},
	convertToArray : function(data,type){
        var arr = new Array();
        if(data === undefined) return arr;
        if(typeof(data) == "number"){
            arr.push(data);
        }else{
            var l = data.split(",");
            for(var j=0,val;val=l[j++];){
                if(type === "int") val = parseInt(val);
                else if(type === "float") val = parseFloat(val);
                arr.push(val);
            }
        }
        return arr;
    },
    
    convertToArrayInt : function(data){
        return this.convertToArray(data,"int");
    },
    
    convertToArrayString : function(data){
        return this.convertToArray(data,"string");
    },
    
    convertToArrayFloat : function(data){
        return this.convertToArray(data,"float");
    },
    //专门对宝箱掉落的数据格式
    convertToArrayObject : function(str) {
        var strArray = str.split("},");
        for(let k in strArray){
            let v = strArray[k];
            if(v.length < 1){continue}
            if(v.indexOf("}") === -1){
                v += "}";
            }
            v = v.replace(/{/g, "{\"");
            v = v.replace(/:/g, "\":");
            v = v.replace(/,/g, ",\"");
           strArray[k] = JSON.parse(v);
        }
        return strArray;
    },
};

module.exports = configDataMgr;