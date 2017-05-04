var log               = require("utils").log;
var utils             = require("utils")
var nativeServer      = require("nativeServer");
var eventCenter       = require("eventCenter");
var FightLogicManager = require("FightLogicManager");
var GameDefine        = require("GameDefine");
var configDataMgr     = require("configDataMgr");
var DataMgr           = require("DataMgr");

cc.Class({
    extends: cc.Component,

    properties: {
        spineNode : cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.harmedScaleX = 1;
    	this.characterScale = 0.3; 
        this.registerEventCenter();
        this.totalHarmeCount = 0;
        this.harmeList = {};
    },

    onDestroy : function(){
        this.unRegisterEventCenter();
    },

    registerEventCenter : function(){
        var self = this;
        eventCenter.new("FightCharacterBeginFight", "BeginFight", function(event, data){
            self.beginFight(data);
        }, true)
        eventCenter.new("FightCharacterUserInfo", "HeroListInfo", function(event, data){
            self.updateHeroHp();
        }, true)
        eventCenter.new("PlayerAttackPlayer", "AttackPlayer", function(event, data){
            self.underAttack(data);
        }, true)

        eventCenter.new("PlayerEscape", "Escape", function(event, data){
            self.startEscape();
        })
        eventCenter.new("PlayerBattleEnd", "endBattle", function(event, data){
            self.endFight(data)
        })

        eventCenter.new("PlayerGetReward", "showGetItemText", function(event, data){
            self.showDropText(data);
        })

    },

    unRegisterEventCenter : function(){
        eventCenter.delete("FightCharacterBeginFight");
        eventCenter.delete("FightCharacterUserInfo");
        eventCenter.delete("PlayerAttackPlayer");
        eventCenter.delete("PlayerEscape");
        eventCenter.delete("PlayerBattleEnd");
        eventCenter.delete("PlayerGetReward");
    },

    initData : function(userData){
        var self       = this;
        this.fightInfo = userData.info;
        this.heroHpBar = userData.hpBar;
        var heroData   = nativeServer.getCurHeroData();
    	cc.loader.loadRes(heroData.res, sp.SkeletonData, function(err, spData) {
    		if(err) {return}
            self.spine = self.spineNode.getComponent(sp.Skeleton);
            self.spine.skeletonData = spData;
            self.playIdle();
            self.initSpine();
            self.updateHeroHp();
    	})
        this.spineNode.scale = this.characterScale;
    },

    initSpine : function() {
        var self = this;
        var CompleteListener = function(event){
            if(event.animation.name === self.curAttackName){
                self.onShootPlayEnd(event);
            }
            if(event.animation.name === "hit"){
                self.onHitPlayEnd(event);
            }
        }
        this.spine.setCompleteListener(CompleteListener);
        // this.spine.timeScale = 1.0;
    },

    reborn : function() {
        var heroData = nativeServer.getCurHeroData();
        heroData.curHp = heroData.hp;
        this.updateHeroHp();
        this.playIdle();
    },

    onShootPlayEnd : function(){
        var heroData = nativeServer.getCurHeroData();
        if(this.isInBattle) {
            this.attackEnemy();
        }
       var self = this;
       setTimeout(function(){
            if(self.isInBattle) {
               self.playAttack();
            }
       // }, heroData.speed);
        }, 0);
    },

    onHitPlayEnd : function(){
        log("----onHitPlayEnd"); 
    },

    //开始战斗
    beginFight : function(battleData){
        var self = this;
        this.heroDefaultPos = this.getPosition();
        var moveAction = cc.moveTo(battleData.moveTime, battleData.heroBattlePos);
        this.node.runAction(cc.sequence(moveAction, cc.callFunc( function(){
            self.isInBattle = true;
            self.fightData  = battleData;
            self.moveTime   = battleData.moveTime;
            self.playAttack();
        })))
        if (battleData.battleDirection === "left") {
            this.harmedScaleX = 1;
            this.spineNode.scaleX = 0 -this.characterScale;
        }else {
            this.spineNode.scaleX = this.characterScale;
            this.harmedScaleX = -1;
        }
    },

    endFight : function(data){
        this.isInBattle = false;
        this.backToDefaultPos(data);  
        this.fightData = null;
    },

    //回到初始点
    backToDefaultPos : function(data){
        var self = this;
        var endCB = function() {
            var defineType = GameDefine.END_BATTLE_TYPE;
            self.playIdle();
            if(data.type === defineType.PLAYER_DEAD){
                self.fightFaile(data);
            }else if(data.type === defineType.MONSTER_DEAD){
                self.fightVictory(data.content);
            }
            eventCenter.dispatch("playerBackEnd", data);
        }
        var action = cc.sequence(cc.moveTo(this.moveTime, this.heroDefaultPos), cc.callFunc(function() {
            endCB();
        }));
        this.node.runAction(action);
    },

    fightFaile : function(data){
        this.playDeath();
    },

    fightVictory : function(data){   
        var self = this;
        var callback = function(msgType, content){
            if(msgType === DataMgr.DataDynType.FAILE){
                return;
            }
            eventCenter.dispatch("showGetItemText", content)
        }
        var sendData = {}
        sendData.configId = data.monsterData.id;
        DataMgr.start(DataMgr.DataDynType.KILL_MONSTER.typeId, sendData, callback);
    },
        

    startEscape : function() {
        //this.isInBattle = false;
        //this.playIdle();
        var endData = {};
        endData.type = GameDefine.END_BATTLE_TYPE.PLAYERESCAPE
        eventCenter.dispatch("endBattle", endData);//this.attacker)
      //  this.endFight();
    },


    playIdle : function() {
        this.lastState = undefined;
    	this.spine.setAnimation(0, "normal_idle", true);
    },


    playWalk : function(dirction) {
        if(this.lastState !== dirction) {
            this.lastState = dirction;
            var walkAni = "walk";
            walkAni = dirction === "up" ? "walk_up" : walkAni;
            walkAni = dirction === "down" ? "walk_down" : walkAni;
            this.spine.setAnimation(0, walkAni, true);
        }
    },

    playDeath : function() {
    	this.spine.setAnimation(0, "death", false);
    },

    playHit : function() {
    	this.spine.setAnimation(0, "hit", false);
    },

    playAttack : function() {
        var attackType = utils.intRandom(1, 4);
        this.curAttackName = "attack_" + attackType;
    	this.spine.setAnimation(0, this.curAttackName, false);
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
        this.playWalk(dirction);
        this.fightInfo = step;
    },

    getInfo : function () {
        return this.fightInfo;    
    },

    getPosition : function () {
        return this.node.getPosition();
    },

    setPosition : function (pos) {
        this.node.setPosition(pos);
    },

    update : function () {
    },

    updateHeroHp : function() {
        //主城界面没有血条更新
        if(!this.heroHpBar) {
            return;
        }
        var heroData = nativeServer.getCurHeroData();
        var hpPer  =  heroData.curHp / heroData.hp;
        this.heroHpBar.getComponent(cc.ProgressBar).progress = hpPer;
        var hpLabel     = this.heroHpBar.getChildByName("content").getComponent(cc.Label);
        hpLabel.string  = heroData.curHp + "/" +  heroData.hp;
    },

    attackEnemy : function(){
        var self        = this;
        var heroData    = nativeServer.getCurHeroData();
        var data        = {};
        data.UniqueID   = self.fightData.monster.UniqueID
        data.attackData = heroData;
        eventCenter.dispatch("AttackMonster", data)
    },

    underAttack: function(attacker){
        this.attacker = attacker;
        var heroData = nativeServer.getCurHeroData();
        var hurtData = FightLogicManager.normalAttack(attacker, heroData);
        var hurtStr   = "";
        var hurtColor = new cc.color(0, 128, 0)
        if(hurtData.hurt !== undefined) {
            heroData.curHp -= hurtData.hurt
            if (heroData.curHp <= 0) {
                heroData.curHp = 0
                //eventCenter.dispatch("PlayerDie", null, true);
               // this.playDeath();
               var data = {};
               data.type = GameDefine.END_BATTLE_TYPE.PLAYER_DEAD;
               eventCenter.dispatch("endBattle", data);
            }
            this.updateHeroHp();
            hurtStr   = hurtData.hurt;
            hurtColor = new cc.color(255, 0, 0);
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
        str = (str !== "miss") ? "-" + str : str;
        this.playerTextAnim(str, color)
        
    },

    showDropText : function(rewardList) {
        var self = this;
        let tiemIndex = 0;
        for(let k in rewardList){
            let startTime = tiemIndex * 500;//毫秒
            tiemIndex += 1;
            setTimeout(function(){
                var title = rewardList[k].name + " x" + rewardList[k].count;
                self.playerTextAnim(title);
            }, startTime);
        }
    },

    playerTextAnim : function(str, color) {
        color = color || new cc.color(255, 255, 255); 
        var self = this;
        var beHarmedN = new cc.Node();
        var harmeCount = this.getHarmeCount();
        beHarmedN.setPosition(50 * this.harmedScaleX, 90 + 30 * harmeCount);
        beHarmedN.color = color;
        var textL       = beHarmedN.addComponent(cc.Label); 
        textL.string    = str
        textL.fontSize = 28;
        this.node.addChild(beHarmedN);
        beHarmedN.runAction(cc.sequence(cc.fadeOut(2), cc.callFunc(function(){
            beHarmedN.destroy();
            self.rmHarmeCount(harmeCount);
        })))
    },
    
});
