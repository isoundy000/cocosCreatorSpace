var utils              = require("utils");
var log                = require("utils").log;
var nativeServer       = require("nativeServer")
var eventCenter        = require("eventCenter");
var GameDefine         = require("GameDefine");
var LogicObjectManager = require("LogicObjectManager");
var FightLogicManager  = require("FightLogicManager");
cc.Class({
    extends: cc.Component,

    properties: {
        spineNode : cc.Node,
    },
    

    // use this for initialization
    onLoad: function () {
    	this.characterScale = 0.15;
        this.totalHarmeCount = 0;
        this.registerEventCenter();
        this.harmeList = {};
    },

    onDestroy : function(){
        this.unRegisterEventCenter();
    },

    registerEventCenter : function(){
        var self = this;
        this.fightEventCenterName = eventCenter.getNums();
        eventCenter.new(this.fightEventCenterName, "BeginFight", function(event, data){
            self.beginFight(data);
        }, true)
        this.underAttackName = eventCenter.getNums();
        eventCenter.new(self.underAttackName, "AttackMonster", function(event, data){
            if (data.UniqueID != self.info.UniqueID) {
                return
            }
            self.underAttack(data.attackData)
        }, true)
        /*
        this.FightHeroPlayerDieName = eventCenter.getNums();
        eventCenter.new(this.FightHeroPlayerDieName, "PlayerDie", function(event, data){
            self.endBattle();
        })
        this.FightHeroMonsterDieName = eventCenter.getNums();
        eventCenter.new(this.FightHeroMonsterDieName, "MonsterDie", function(event, data){
            self.endBattle();
        })
        this.escapeResultName = eventCenter.getNums();
        eventCenter.new(this.escapeResultName, "escapeResult", function(event, data){
            self.endBattle();
        })*/
        this.endBattleName = eventCenter.getNums();
        eventCenter.new(this.endBattleName, "endBattle", function(event, data){
            if(!self.isInBattle){return}
            self.endBattle(data);
        })
    },

    unRegisterEventCenter : function(){
        eventCenter.delete(this.fightEventCenterName);
        eventCenter.delete(this.underAttackName);
        //eventCenter.delete(this.FightHeroPlayerDieName);
        //eventCenter.delete(this.FightHeroMonsterDieName);
        //eventCenter.delete(this.escapeResultName);
        eventCenter.delete(this.endBattleName);
    },

    updateMonsterHP : function() {
        this.monsterBar.refreshNode(this.monsterData);
    },

    initData : function(hpBar, btnEscape, monster){
    	var self = this;
        this.info = monster;
        this.monsterData = LogicObjectManager.newMonsterObj(this.info.dataID);
        this.monsterBar = hpBar;
        this.btnEscape = btnEscape;
    	cc.loader.loadRes(this.monsterData.res, sp.SkeletonData, function(err, spData) {
    		if(err) {return}
            self.spine = self.spineNode.getComponent(sp.Skeleton);
            self.spine.skeletonData = spData;
            self.playIdle();
            self.initSpine();
    	})
        this.spineNode.scale = this.characterScale;
    },

    initSpine : function() {
        var self = this;
        var CompleteListener = function(event){
            if(event.animation.name === "shoot"){
                self.onShootPlayEnd(event);
            }
            if(event.animation.name === "hit"){
                self.onHitPlayEnd(event);
            }
        }
        this.spine.setCompleteListener(CompleteListener);
    },

    onShootPlayEnd : function(){
        eventCenter.dispatch("AttackPlayer", this.monsterData)
        var self = this;
        setTimeout(function(){
            if(self.isInBattle) {
                self.playAttack();
            }
        }, this.monsterData.speed);
    },
    onHitPlayEnd : function(){

    },

    beginFight : function(battleData){
        if(battleData.monster.UniqueID != this.info.UniqueID) {
            return;
        }
        var self = this;
        this.monsterDefaultPos = this.node.getPosition();
        this.moveTime = battleData.moveTime
        var moveAction = cc.moveTo(this.moveTime, battleData.monsterBattlePos);
        this.node.runAction(cc.sequence(moveAction, cc.callFunc( function(){
            self.isInBattle = true;
            self.fightData = battleData;
            self.playAttack();
        })))
        if (battleData.battleDirection === "left") {
            this.harmedScaleX = -1;
            this.spineNode.scaleX = this.characterScale;
        }else {
            this.spineNode.scaleX = 0 - this.characterScale;
            this.harmedScaleX = 1;
        }
        this.monsterData.hp = this.monsterData.hpMax;
        this.updateMonsterHP();
        this.monsterBar.active = true;
        this.btnEscape.active = true;
    },

    endBattle : function(data){
        this.isInBattle        = false;
        this.monsterBar.active = false;
        this.btnEscape.active  = false;
        this.backDefaultPos(data);

        /*
        if(this.monsterData.hp <= 0 ){
            var dispatchData = {UniqueID: this.info.UniqueID, monsterData : this.monsterData}
            eventCenter.dispatch("MonsterDie", dispatchData);//this.playIdle();
        }else {
            //this.pla
        }*/
    },

    backDefaultPos : function(data) {
        var self = this;
        var defineType = GameDefine.END_BATTLE_TYPE;
        var endCB = function() {
            if(data.type === defineType.MONSTER_DEAD){
                self.playDeath();
            }else {
                //生命值回复
                self.monsterData.hp = self.monsterData.hpMax;
            }
        } 
        var action = cc.sequence(cc.moveTo(this.moveTime, this.monsterDefaultPos), 
            cc.callFunc(function() {
                endCB();
            }));
        this.node.runAction(action); 
    },

    playIdle : function() {
    	this.spine.setAnimation(0, "idle", true);
    },

    playRun : function() {
    	this.spine.setAnimation(0, "run", true);
    },

    playDeath : function() {
    	this.spine.setAnimation(0, "death", false);
    },

    playHit : function() {
    	this.spine.setAnimation(0, "hit", false);
    },


    playAttack : function() {
    	this.spine.setAnimation(0, "shoot", false);
    },

    moveDis : function(step, dis) {
        var dirction = step.diRection;
        if(dirction === "up"){
            this.node.y += dis;
        }else if (dirction === "down") {
            this.node.y -= dis;
        }else if (dirction === "left") {
            this.spineNode.scaleX = 0 -this.characterScale;
            this.node.x -= dis;
        }else {
            this.node.x += dis;
            this.spineNode.scaleX =this.characterScale;
        }
        this.info = step;
    },

    getInfo : function () {
        return this.info;    
    },

    getPosition : function () {
        return this.node.getPosition();
    },

    setPosition : function (pos) {
        this.node.setPosition(pos);
    },

    update : function () {
        //log("---this.node.x-" + this.node.x)
       // this.node.x += 1;
    },

   underAttack: function(atttackData) {
        var hurtData  = FightLogicManager.normalAttack(atttackData, this.monsterData);
        var hurtStr   = "";
        var hurtColor = new cc.color(0, 128, 0)
        if(hurtData.hurt !== undefined) {
            this.monsterData.hp -= hurtData.hurt;
            hurtStr   = hurtData.hurt;
            hurtColor = new cc.color(255, 0, 0);
            if (this.monsterData.hp <= 0) {
                this.monsterData.hp = 0;
                var endData = {};
                endData.type = GameDefine.END_BATTLE_TYPE.MONSTER_DEAD;
                endData.content = {UniqueID: this.info.UniqueID, monsterData : this.monsterData, pos : this.monsterDefaultPos};
                eventCenter.dispatch("endBattle", endData);
            }
            this.updateMonsterHP();
        }else {
            hurtStr = "miss";
        }
        this.showBeHarmed(hurtStr, hurtColor);
    }, 

    getHarmeCount : function(){
        this.totalHarmeCount += 1;
        for(let i = 0; i < this.totalHarmeCount; i++){
            if(!this.harmeList[i]){
                this.harmeList[i] = true;
                return i
            }
        }
    },

    rmHarmeCount : function(index) {
        this.totalHarmeCount -= 1;
        this.harmeList[index] = false;
    },

    showBeHarmed : function(str, color) {
        var self = this;
        var beHarmedN = new cc.Node();
        var harmeCount = this.getHarmeCount();
        beHarmedN.setPosition(50 * this.harmedScaleX, 90 + 30 * harmeCount);
        beHarmedN.color = color;
        var textL       = beHarmedN.addComponent(cc.Label); 
        textL.string    = (str !== "miss") ? "-" + str : str;
        textL.fontSize = 28;
        this.node.addChild(beHarmedN);
        //var jumpAction = cc.jumpBy(0.2, cc.p(-20, 30 + 70 * this.showHarmeCount), 30 + 70 * this.showHarmeCount, 1);
        //beHarmedN.runAction(jumpAction);
        beHarmedN.runAction(cc.sequence(cc.fadeOut(2), cc.callFunc(function(){
            beHarmedN.destroy();
            self.rmHarmeCount(harmeCount);
        })))
    },

    

});
