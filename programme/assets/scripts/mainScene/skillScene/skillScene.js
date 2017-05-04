var utils = require("utils");
var log = utils.log;
var eventCenter = require("eventCenter");
var db = require("db");
var DISPLAY_TYPE = {
    INITIATIVE : 1,
    PASSIVE : 2,
}
cc.Class({
    extends: cc.Component,

    properties: {
        parentNode : cc.Node,
        passiveList : cc.Node,//被动技能列表 
        initiativeList  : cc.Node,//主动技能列表
        InitiativeContent : cc.Node,//主动技能内容
        passiveContent : cc.Node,//被动技能内容
        skillPointNode : cc.Label,
        skillItemPrefab : cc.Prefab,
        promptBox : cc.Prefab
    },

    onLoad: function () {
        this.initList();
        var userInfo = require("db").get("UserInfo", 1);
        this.setBord(userInfo);
        this.registerEventCenter();
        this.refreshDisPlayList(DISPLAY_TYPE.INITIATIVE);
    },

    setBord : function(data){
        log(data);
        var points = (data && data.Skills && data.Skills.skillPoint) ? data.Skills.skillPoint : 0;
        this.skillPointNode.string  = points;
    },

    onDestroy : function(){
        this.unRegisterEventCenter();
    },

    registerEventCenter: function() {
        var self = this;
        eventCenter.new("SkillLayerUserInfo", "UserInfo", function(event, data) {
            self.setBord(data);
        }, 1);

        eventCenter.new("SkillLayerSkillsReset", "dispatchSkillsReset", function(event, data){
            if (data) {
                self.sureResetSkills();
            }
        }, 1);
    },

    unRegisterEventCenter : function(){
        eventCenter.delete("SkillLayerUserInfo");
        eventCenter.delete("SkillLayerSkillsReset");
    },

    initList : function(){
        var initiativeInListData = this.getinitiativeInListData();
        var passiveListData = this.getPassiveListData();
        log("initiativeInListData", initiativeInListData);
        log("passiveListData", passiveListData);
        var itemHeight = this.skillItemPrefab.data.height + 50;
        //init initative List data
        for (var i = 0; i < initiativeInListData.length; i++) {
            let node = cc.instantiate(this.skillItemPrefab);
            node.setPosition(cc.p(0, 0- i*itemHeight))
            this.InitiativeContent.addChild(node);
            node.getComponent("skillItem").updateData(initiativeInListData[i]);
            node.getComponent("skillItem").addCB(this.onListItemCB);
        }
        this.InitiativeContent.height = initiativeInListData.length * itemHeight;
        //init passive list
        for (var i = 0; i < passiveListData.length; i++) {
            let node = cc.instantiate(this.skillItemPrefab);
            node.setPosition(cc.p(0, 0- i*itemHeight))
            this.passiveContent.addChild(node);
            node.getComponent("skillItem").updateData(passiveListData[i]);
            node.getComponent("skillItem").addCB(this.onListItemCB);
            
        }
        this.passiveContent.height = passiveListData.length * itemHeight;
    },

    onBtnResetClick : function() {
        var userinfo = db.get("UserInfo", 1);
        if (userinfo.Skills.skillPoint >= userinfo.Grade * 3)
            this.getPromptShow("skill_reset_fail_fullPoints");
        else
            this.getPromptShow("skill_reset_skills");
    },

    sureResetSkills : function() {
        var userinfo = db.get("UserInfo", 1);
        if (userinfo.Diamond < 100)
            this.getPromptShow("diamond_not_enough");
        else {
            userinfo.Skills.skillPoint = userinfo.Grade * 3;
            userinfo.Diamond = userinfo.Diamond - 100;
            db.set("UserInfo", userinfo, 1);
            this.InitiativeContent.removeAllChildren();
            this.passiveContent.removeAllChildren();
            this.initList();
        }
    },

    onBtnPassiveClick : function() {
        this.refreshDisPlayList(DISPLAY_TYPE.PASSIVE);
    },

    onbtnInitiativeClick : function(){
        this.refreshDisPlayList(DISPLAY_TYPE.INITIATIVE);
    },

    refreshDisPlayList : function(curDisplayType){
        if(this.curDisplayType === curDisplayType) {return};
        this.passiveList.active = (curDisplayType === DISPLAY_TYPE.PASSIVE);
        this.initiativeList.active = (curDisplayType === DISPLAY_TYPE.INITIATIVE);
        this.curDisplayType = curDisplayType;
    },

    getinitiativeInListData : function() {
        var userinfo = db.get("UserInfo", 1);
        var initiative = userinfo.Skills.initiative;
        var listData = [];
        var configDataMgr = require("configDataMgr");
        for (var i = 0; i < Object.keys(initiative).length; i++) {
            let skill = {};
            skill.id = parseInt("40000" + i + "00");
            let skCfg = configDataMgr.SkillCfg[skill.id];
            let addHurtper = skCfg.addHurtper/100;
            skill.level = skCfg.level;
            skill.name = utils.getText(skCfg.name);
            skill.desc = utils.getText(skCfg.desc).replace("%s", addHurtper);
            skill.point = skCfg.point;
            skill.sp = skCfg.sp;
            skill.type = skCfg.type;
            skill.studyLv = initiative[i].studyLevel;
            listData.push(skill)
        }
        return listData;
    },

    getPassiveListData : function() {
        var userinfo = db.get("UserInfo", 1);
        var passive = userinfo.Skills.passive;
        var listData = [];
        var configDataMgr = require("configDataMgr");
        for (var i = 0; i < Object.keys(passive).length; i++) {
            let skill = {};
            skill.id  = parseInt("40100" + i + "00");
            let skCfg = configDataMgr.SkillCfg[skill.id];
            let addHP = skCfg.addHP/100;
            skill.level = skCfg.level;
            skill.name = utils.getText(skCfg.name);
            skill.desc = utils.getText(skCfg.desc).replace("%s", addHP);
            skill.point = skCfg.point;
            skill.sp = skCfg.sp;
            skill.type = skCfg.type;
            skill.studyLv = passive[i].studyLevel;
            listData.push(skill)
        }
        return listData;
    },

    onListItemCB : function(type, data, refreshCB) {
        if(type === "Study") {
            // data.lv += 1;
            // data.cost = 10 + data.lv * 2;
            // data.desc=  data.cfg.descLocal.replace("%s", (data.lv * data.lvAdd + (data.index * data.baseAdd)));
            refreshCB(data);
        }
    },

    onBtnCloseClick : function(){
        var self  = this;
        var action = cc.sequence( cc.spawn(cc.fadeOut(0.3), cc.scaleTo(0.3, 0.4)), cc.callFunc(function() {
            self.onDestroy();
            self.node.destroy();
            self.node.parent.removeAllChildren();
        }))
        this.node.runAction(action);   
    },

    getPromptShow: function (cs) {
        var promptBox = cc.instantiate(this.promptBox);
        promptBox.setPosition(cc.p(0,0));
        promptBox.getComponent("PromptBox").getMsgFrom(cs);
        this.parentNode.addChild(promptBox);
    }
});
