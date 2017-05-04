var log = require("utils").log;
var skillItem = cc.Class({
    extends: cc.Component,

    properties: {
        nameL : cc.Label,
        descL : cc.Label,
        studyLv : cc.Label,
        sp : cc.Node,
        skillImg : cc.Sprite,
        level : cc.Node,
        pointNeed : cc.Node
    },

    onLoad: function () {
        skillItem.instance = this;
    },

    addCB : function(listCB) {
        this.listSysCB = listCB;
    },

    updateData : function(data) {
        var self = skillItem.instance;
        self.data = data;
        self.nameL.string = data.name;
        self.descL.string = data.desc;
        self.studyLv.string = data.studyLv + "/" + 10;
        self.sp.getComponent(cc.Label).string = "消耗sp:" + data.sp;
        self.level.getComponent(cc.Label).string = data.level + "级可学习";
        self.pointNeed.getComponent(cc.Label).string = "需要技能点:" + data.point;
        cc.loader.loadRes("images/skill/skill", cc.SpriteAtlas, function(err, atlas){
            if (err) { log (err); return; }
            var imgFrame = atlas.getSpriteFrame("skill_" + data.id);
            self.skillImg.spriteFrame = imgFrame;
        });

        var userinfo = require("db").get("UserInfo", 1);
        if (userinfo.SP < data.sp)
            self.sp.color = new cc.color(255, 0, 0);
        else
            self.sp.color = new cc.color(255, 228, 188);
        if (userinfo.Grade < data.level)
            self.level.color = new cc.color(255, 0, 0);
        else
            self.level.color = new cc.color(255, 228, 18);
        if (userinfo.Skills < data.point)
            self.pointNeed.color = new cc.color(255, 0, 0);
        else
            self.pointNeed.color = new cc.color(255, 228, 18);
    },
    
    onBtnStudyClicked : function(){
        this.listSysCB("Study", this.data, this.updateData);
    },
});
