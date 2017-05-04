var log = require("utils").log;
cc.Class({
    extends: cc.Component,

    properties: {
        mapListScroll  : cc.ScrollView,
        mapListContent : cc.Node,
        chooseMapPrefab : cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {        
        this.getMapListData();
        this.initMapList();
    },
    //获取列表数据
    getMapListData : function() {
        this.chooseData = {};
        this.chooseData.listData = [
            {res : "/images/map/Map_b"},
            {res : "/images/map/Frame"},
            {res : "/images/map/Map_b"},
            {res : "/images/map/Map_b"},
            {res : "/images/map/Map_b"},
            {res : "/images/map/Map_b"},
        ];
        this.chooseData.curIndex = 1;
    },
    //instatiate Map List
    initMapList : function() {
        var self = this;
        var prefabHeight = this.chooseMapPrefab.data.width;
        this.LoadResList = [];
        for(let k in this.chooseData.listData) {
            let node = cc.instantiate(this.chooseMapPrefab);
            node.name = "item_" + k;
            k = parseInt(k);
            node.setPosition(prefabHeight * (k + 1.5), 0);
            let value = this.chooseData.listData[k];
            cc.loader.loadRes(value.res, cc.SpriteFrame, function(err, loadFrame){
                if(err){
                    log(err);
                }
                node.getComponent(cc.Sprite).spriteFrame = loadFrame;
                self.LoadResList.push(loadFrame);
            })
            this.mapListContent.addChild(node)
        }
        this.mapListContent.width = prefabHeight * (this.chooseData.listData.length + 2);
        this.mapListScroll.node.on("scrolling", this.onListScrolling, this);
        this.mapListContent.x = this.chooseData.curIndex * -1 * prefabHeight ;
        this.prefabHeight = prefabHeight
        this.lastIndex = undefined;
        this.onListScrolling();
    },

    //关闭按钮
    onBtnCloseClicked : function() {
        var self = this;
        var action = cc.sequence(cc.fadeOut(0.5), cc.callFunc(function() {
            self.node.destroy();
            self.node.parent.removeAllChildren();
        }))
        this.node.runAction(action);
    },

    onDestroy : function() {
        for(let k in this.LoadResList) {
            let v = this.LoadResList[k];
            cc.loader.removeItem(v);
        }
    },

    onListScrolling : function(){
        this.chooseData.curIndex = Math.floor( Math.abs(this.mapListContent.x - this.prefabHeight / 4 * 3) / this.prefabHeight)
        if(this.lastIndex !== this.chooseData.curIndex) {
            if(this.lastIndex !== undefined) {
                var lastNode = this.mapListContent.getChildByName("item_" + this.lastIndex)
                lastNode.scale = 1;
                lastNode.setLocalZOrder(0)
            }
            var curNode = this.mapListContent.getChildByName("item_" + this.chooseData.curIndex)
            curNode.scale = 1.2;
            curNode.setLocalZOrder(1);
            this.lastIndex = this.chooseData.curIndex;
        }
    },

    onEnterBattleMap : function() {
        cc.director.loadScene("FightScene", function(err, scene){
            if(!err){
                log("-------loaded FightScene succenss")
            }            
        });
    },

});
