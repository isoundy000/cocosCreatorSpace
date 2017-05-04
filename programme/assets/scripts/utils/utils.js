var GameDefine = require("GameDefine");
var utils = {
    debugLog : true,
    curLan : "ch",
    log: function(){
        if (!utils.debugLog) { return}
        for(var k in arguments) {
            cc.log(arguments[k]);
        }
    },
    newRandomSeed : function() {
        Math.seed = (new Date()).getTime();
    },
    seededRandom : function(max, min) {
        max = max || 1; min = min || 0; 
        Math.seed = Math.seed || utils.newRandomSeed();
        Math.seed = (Math.seed * 9301 + 49297) % 233280; 
        var rnd = Math.seed / 233280.0; 
        return min + rnd * (max - min);
    },
    //get random int of [min - max] 
    intRandom : function(min, max) {
        min = parseFloat(min);
        max = parseFloat(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
    },

    getPropsType : function(id){
        var type = GameDefine.PROPS_TYPE.OTHER;
        id = id.toString();
        if(id.indexOf("2") === 0) { //2开头的
            type = GameDefine.PROPS_TYPE.EQUIP;
        }else if(id.indexOf("3") === 0) {//3开头的
            type = GameDefine.PROPS_TYPE.MATERIAL;
        }
        return type;
    },

    cloneData : function(fa) {
        var cloneObj;
        if (fa.constructor == Object) {
            cloneObj = new fa.constructor();
        }else if (fa.constructor == Array) { 
            cloneObj = [];
        }
        else
        {
            cloneObj = new fa.constructor(fa.valueOf());
        }
        for(var key in fa) {
            if(cloneObj[key] !== fa[key]) {
                if(typeof(fa[key]) === "object") {
                    cloneObj[key] = this.cloneData(fa[key]);
                }else {
                    cloneObj[key] = fa[key];
                }
            }
        }
        return cloneObj;
    },

    getText : function(id) {
        var localTextS = require("configDataMgr").TextCfg[id];
        if(!localTextS){
            return "NO[ " + id +" ] ";
        }
        var localText = localTextS.chinese
        if(this.curLan === "en") {
            localText = localTextS.english
        }
        return localText;
    },

    getAttrRealDisplay : function(attname, value) {
        if(attname.indexOf("_") !== -1){
            attname = attname.split("_")[1];
        }
        var str = value;
        if(attname === "cri" || attname === "dod" ||  
            attname === "opp" || attname === "hit"){
            str = value / 100 + "%";
        }
        return str;
    },

    //获取当前穿戴部位的装备
    getPartOfEquipment : function(targetPart){
        var nativeServer = require("nativeServer")
        var LogicObjectManager = require("LogicObjectManager");
        var heroEquips = nativeServer.getCurHeroData().Equips;
        for(let k in heroEquips){
            let equipData = LogicObjectManager.getEquipmentObj(heroEquips[k].UniqueID);
            if(parseInt(equipData.part) === parseInt(targetPart)) {
                return equipData;
            }
        }
    },
}

module.exports = utils;