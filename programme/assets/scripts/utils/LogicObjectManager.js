var utils              = require("utils");
var log                = utils.log;
var GameDefine         = require("GameDefine");
var configDataMgr      = require("configDataMgr")
var LogicObjectManager = {};
//装备列表
var EquipmentObjList   = {};
//角色列表
var HeroObjList        = {};

// 材料列表
var MaterialObjList       = {};

//att攻击力
//
//----------------monsterBase Func ---------------
var monsterBase = function(monster_id) {
	var baseData      = configDataMgr.MonsterCfg[monster_id];
	//把配置表的属性复制一份
  	for(let k in baseData) {
  		this[k] = baseData[k];
  	}
	this.hpMax     = this.hp;
	this.localName = utils.getText(this.name);
	this.localDesc = utils.getText(this.desc);
	//伤害追加 attack additional
	this.attHurtAdd  = this.attHurtAdd || 0;
	//伤害减免 Damage Reduction
	this.attHurtRed  = this.attHurtRed || 0;
	this.speed   = this.speed || 1000;//攻击间隔毫秒
	this.res       = "character/spineboy/spineboy";
    /*
    this.skills = []
    for (let k  in baseData.skill_ids){
    	var skill_id = baseData.skill_ids[k];
        local skillLevel = Math.floor(this.level / 2)
        skillLevel = skillLevel < 1 ? 1 : skillLevel
        local skill = {}//LogicObjectManager:newSkillObject(skill_id, skillLevel)
        this.skills.push(skill)
    }*/
}



//----------------heroObjBase Func ---------------
var heroObjBase = function() {}

heroObjBase.prototype.fromServarData = function(serverData) {
	this._serverData =serverData;
	for(let k in serverData) {
		this[k] = serverData[k];
	}
	this.calculateAllAttribute();
	
	this.sumExp = GameDefine.getSumExpByLevel(this.level);
	this.curHp  = this.curHp || this.hp;
	this.res    = "animation/nanzhu/Nan";
}

//计算所有的属性
heroObjBase.prototype.calculateAllAttribute = function() {
	var baseAttrbute = {};
	//基本攻击
	baseAttrbute.att         = this.level * 60 + 340;
	//生命
	baseAttrbute.hp          = 1020 + 180 * this.level;
	//体力 
	baseAttrbute.sp          = 47 + 3 * this.level;
	//防御
	baseAttrbute.def         = 170 + 30* this.level;
	//伤害追加 attack additional
	baseAttrbute.attHurtAdd  = 0;
	//伤害减免 Damage Reduction
	baseAttrbute.attHurtRed  = 0;
	//额外金币
	baseAttrbute.extend_gold = 0;
	//额外经验
	baseAttrbute.extend_exp  = 0;
	//生命恢复
	baseAttrbute.hpRe        = 0;
	//体力恢复
	baseAttrbute.spRe        = 0;
	baseAttrbute.speed       = 1000;
	//暴击几率 ..率计算，几率属性按照100/10000计算，符号为%，保留小数点后2位
	baseAttrbute.cri         = 500 + 20 * this.level;
	//抗暴几率
	baseAttrbute.opp         = 500 + 60 * this.level;
	//命中几率
	baseAttrbute.hit         = 8000 + 40 * this.level;
	//闪避几率
	baseAttrbute.dod         = 500 + 50 * this.level;
	//暴击增伤
	baseAttrbute.criHurtAdd  = 1000 + 20 * this.level;
	//暴击减伤
	baseAttrbute.criHurtRed  = 1000 + 40 * this.level;
	this.baseAttrbute = baseAttrbute;
	//将基础数据复制到对象下
	for(let attName in baseAttrbute) {
		this[attName] = baseAttrbute[attName];
	}
	this.calculateEquipAttribute();
};

//计算英雄穿戴装备增加的属性
heroObjBase.prototype.calculateEquipAttribute = function() {
	for(let k in this.Equips) {
		let equipObj = LogicObjectManager.getEquipmentObj(this.Equips[k].UniqueID);
		//基础属性
		this.att += equipObj.att;
		this.sp  += equipObj.sp;
		this.def += equipObj.def;
		this.hp  += equipObj.hp;
		this.cri += equipObj.cri;
		this.opp += equipObj.opp;
		this.hit += equipObj.hit;
		this.dod += equipObj.dod;
		this.speed += equipObj.speed;
		for(let k in equipObj.Prop){
			if(k === "pn_cri") {
				this.cri += equipObj.Prop[k];
			}else if(k==="pn_opp"){
				this.opp += equipObj.Prop[k];
			}else if(k==="pn_addCri"){
				this.criHurtAdd += equipObj.Prop[k];
			}else if(k==="pn_redCri"){
				this.criHurtRed += equipObj.Prop[k];
			}else if(k==="pn_hit"){
				this.hit += equipObj.Prop[k];
			}else if(k==="pn_dod"){
				this.dod += equipObj.Prop[k];
			}else if(k==="pn_redHurt"){
				this.attHurtRed += equipObj.Prop[k];
			}else if(k==="pn_addHurt"){
				this.attHurtAdd += equipObj.Prop[k];
			}else if(k==="pn_att"){
				this.att += equipObj.Prop[k];
			}else if(k==="pn_def"){
				this.def += equipObj.Prop[k];
			}else if(k==="pn_hp"){
				this.hp += equipObj.Prop[k];
			}else if(k==="pn_sp"){
				this.sp += equipObj.Prop[k];
			}else if(k==="pn_money"){
				this.extend_gold += equipObj.Prop[k];
			}else if(k==="pn_exp"){
				this.extend_exp += equipObj.Prop[k];
			}
		}
	}
}


//----------------equipmentObjBase Func ---------------
var equipmentObjBase = function(){}
equipmentObjBase.prototype.fromServarData = function(serverData){
	var baseData = configDataMgr.EquipCfg[serverData.id];
	for(let k in baseData){
		this[k] = baseData[k];
	}

	if(serverData) {
		for(let k in serverData){
			this[k] = serverData[k];
		}
	}
	this.loadResPath = "images/equips/equips";
	this.number = this.number || 1;
	this._serverData = serverData;
	this.localName = utils.getText(this.name);
	this.localDesc = utils.getText(this.desc);
	var equPropEnName = GameDefine.BaseEquipAttrList;
	this.baseProp = {};
    for(let i in equPropEnName) {
    	let propName = equPropEnName[i];
    	if( baseData[propName] !== 0 ){
            this.baseProp[propName] = baseData[equPropEnName[i]]
        }
    }
}


//----------------materialObjBase Func ---------------
var materialObjBase = function(){}
materialObjBase.prototype.fromServarData = function(serverData){
	var baseData = configDataMgr.StuffCfg[serverData.id];
	for(let k in baseData){
		this[k] = baseData[k];
	}
	if(serverData) {
		for(let k in serverData){
			this[k] = serverData[k];
		}
	}
	this.number = this.number || 1;

	this._serverData = serverData;
	this.localName = utils.getText(this.name);
	this.localDesc = utils.getText(this.desc);
	if(this.id > 30000000 && this.id < 30100000){
		this.loadResPath = "images/materials/drug";
	}
	if(this.id > 30100000 && this.id < 30200000){
		this.loadResPath = "images/materials/equipMaterial";
	}
	if(this.id > 30200000 && this.id < 30400000){
		this.loadResPath = "images/materials/drugMaterial";
	}
	if(this.id > 30400000){
		this.loadResPath = "images/materials/shipMaterial";
	}
}








//----------------LogicObjectManager Func ---------------
//创建怪物
LogicObjectManager.newMonsterObj = function(config_id){
	return (new monsterBase(config_id));
}

//创建新英雄
LogicObjectManager.newHeroObj = function(serverData){
	var heroObj = new heroObjBase();
	heroObj.fromServarData(serverData);
	HeroObjList[serverData.id] = heroObj;
}

LogicObjectManager.getHeroObj = function(id){
	return HeroObjList[id];
}

LogicObjectManager.getAllHeros = function() {
	return HeroObjList;
}

//创建新装备
LogicObjectManager.newEquipmentObj = function(serverData){
	var equipObj = new equipmentObjBase();
	equipObj.fromServarData(serverData);
	EquipmentObjList[serverData.UniqueID] = equipObj;
}

LogicObjectManager.getEquipmentObj = function(UniqueID){
	return EquipmentObjList[UniqueID];
}


//创建新材料
LogicObjectManager.newMaterialObj = function(serverData){
	var materialObj = new materialObjBase();
	materialObj.fromServarData(serverData);
	MaterialObjList[serverData.UniqueID] = materialObj;
}

LogicObjectManager.getMaterialtObj = function(UniqueID){
	return MaterialObjList[UniqueID];
}


module.exports = LogicObjectManager;