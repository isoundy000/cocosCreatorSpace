var nativeServer = require("nativeServer");
var eventCenter = require("eventCenter");
var db = require("db");
var log = require("utils").log;

cc.Class({
    extends: cc.Component,

    properties: {
        promptBoxNode: cc.Node,
        content: cc.Label,
    },

    getMsgFrom: function (message, data) {
        this.msg = message;
        this.data = data;
        this.updateContent();
    },
    
    updateContent: function () {
        var userinfo = db.get("UserInfo", 1);
        if (this.msg == "buyThreeBag")
            this.content.string = "是否花费15钻石开启3号背包？";
        else if (this.msg == "buyFourBag")
            this.content.string = "是否花费15钻石开启4号背包？";
        else if (this.msg == "buyThreeBagFirst")
            this.content.string = "请先购买3号背包！";
        else if (this.msg == "diamond_not_enough")
            this.content.string = "钻石不足！";
        else if (this.msg == "gold_not_enough")
            this.content.string = "钻石不足！";
        else if (this.msg == "bag_not_enough_space")
            this.content.string = "背包空间不足！";
        else if (this.msg == "hero_not_enough_grade") {
            var label = "英雄等级不足,改装备需要英雄等级达到"+this.data+
                        "级,英雄当前等级为"+userinfo.Grade+"级.";
            this.content.string = label;
        } else if (this.msg == "bag_abandon_item")
            this.content.string = "是否丢弃？";
        else if (this.msg == "skill_reset_skills")
            this.content.string = "是否花费100钻重置技能？";
        else if (this.msg == "skill_reset_fail_fullPoints")
            this.content.string = "你未学习任何技能！";
    },
    
    onSureBtnClick: function () {
        var userinfo = db.get("UserInfo", 1);
        this.promptBoxNode.removeFromParent();
        if (this.msg == "buyThreeBag") {
            userinfo.BagNum = 3
            userinfo.Diamond = userinfo.Diamond - 15;
            eventCenter.dispatch("onBagNumClick", 3, 1);
        } else if (this.msg == "buyFourBag") {
            userinfo.BagNum = 4;
            userinfo.Diamond = userinfo.Diamond - 15;
            eventCenter.dispatch("onBagNumClick", 4, 1);
        } else if (this.msg == "bag_not_enough_space") {
            eventCenter.dispatch("DetailsBoxRemove", 111, 1);
        } else if (this.msg == "hero_not_enough_grade") {
            eventCenter.dispatch("DetailsBoxRemove", 111, 1);
        } else if (this.msg == "bag_abandon_item") {
            eventCenter.dispatch("BagAbandonItemMsg", 1, 1);
        } else if (this. msg == "skill_reset_skills") {
            eventCenter.dispatch("dispatchSkillsReset", 1, 1);
        }
        db.set("UserInfo", userinfo, 1);
    },
    
    onCancelBtnClick: function () {
        if (this.msg == "bag_not_enough_space") {
            eventCenter.dispatch("DetailsBoxRemove", 111, 1);
        } else if (this.msg == "hero_not_enough_grade") {
            eventCenter.dispatch("DetailsBoxRemove", 111, 1);
        } else if (this.msg == "bag_abandon_item") {
            eventCenter.dispatch("BagAbandonItemMsg", 0, 1);
        }
        this.promptBoxNode.removeFromParent();
    }

});
