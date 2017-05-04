
var gameDefine = {
    STORETYPE :  {
        EQUIP: 1,
        MATERIAL : 2,
    },

    END_BATTLE_TYPE : {
        PLAYERESCAPE : 1,//英雄逃跑
        MONSTER_DEAD : 2,//怪物阵亡
        PLAYER_DEAD  : 3,//玩家死亡
    },

    DROP_RANDOM_TYPE : {
        RANSELECTION : 0,//随机选择
        PROSELECTION : 1,//几率选择
    },
    //道具类型
    PROPS_TYPE : {
        OTHER : 0,
        EQUIP : 1,
        MATERIAL : 2,
    },
    PATHEND_TYPE : {
        NORMAL : 0, //空格子
        MONSTER : 1, //怪物
        BOX : 2, //宝箱
        BUILD : 3, //建筑入口
    },
    //装备的基本属性
    BaseEquipAttrList : ["att","def","dod","hp","hit","sp","cri","opp"],
    //装备所有的扩展属性 
    PropEquipAttrList : ["pn_cri", "pn_opp", "pn_addCri", "pn_redCri", "pn_hit", 
        "pn_dod", "pn_redHurt", "pn_addHurt", "pn_att", "pn_def", "pn_hp", "pn_sp", "pn_money", "pn_exp"],
    //装备中基本属性没有的对应的扩展
    PropNotBaseAttrList : ["pn_redHurt", "pn_addCri", "pn_redCri", "pn_addHurt", "pn_money", "pn_exp"],
    getSumExpByLevel : function (level) {
    	//每级升级所需经验 = ((等级-1)^2.5+60) * INT(((等级-1)^1.7+50 )*1.12) / 6
	    level = level - 1
		var sumExp = Math.pow(level, 2.5) + 60
		sumExp = sumExp * Math.floor(Math.pow(level, 1.7) + 50) * 1.12 / 6;
		sumExp = Math.floor(sumExp);
		return sumExp	
    },


};


module.exports = gameDefine;