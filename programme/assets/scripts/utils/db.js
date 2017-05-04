var log = require("utils").log;
var eventCenter = require("eventCenter");
var nativeServer = require("nativeServer");
var db = { 
  userInfo : null, //玩家信息,  playerInfo_S2C
  GameData : {},
  keys_ :
    [
       "UserInfo",
       "BagInfo",
       "WarehouseInfo",
       "DrugInfo",
       "SpaceshipInfo",
       "HeroListInfo",
       "ShopUpdateTime",
       "ShopEquipsInfo",
       "MateShopUpdateTime",
       "ShopGroceriesInfo",
       "FightReciveInfo",//[[hp, exp, equip, stuff]]
       //"FightMapInfo", //[[isFight, pos, level]]
       //"FightMonsterInfo", //[[UquieID, dataID, pos, rect, x, y, isElite]]
    ],

    get : function(key, isLog) {
        if(isLog !== undefined ){
            log(db.GameData[key], "-- db get " + key)
        }
        return db.GameData[key]
    },

    initDB : function() {
      for(let k in this.keys_) {
          let v = this.keys_[k];
          db.GameData[v] = {};
      }
    },

    set : function(key, value, isLog) {
        db.GameData[key] = value
        eventCenter.dispatch(key, value)
        if(isLog){
            log(value, "-- db set "  +  key)
        }
        require("nativeServer").saveDB(db.GameData)
    }
}
module.exports = db;