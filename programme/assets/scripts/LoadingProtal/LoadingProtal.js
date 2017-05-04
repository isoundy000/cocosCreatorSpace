var utils = require("utils")
var log = utils.log;
cc.Class({
    extends: cc.Component,

    properties: {
        loadingDescL : cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        this.initLoadingDesc();
    },
    
    initLoadingDesc : function(){
        var self = this;
        var desStr  = ""
        var descList = []
        descList.push( "获取地图坐标中......\n".split(""));
        descList.push( "扫描地表信息......\n".split(""));
        descList.push( "确定安全着陆点......\n".split(""));
        descList.push( "安全模式开启......\n".split(""));
        descList.push( "引擎启动,准备传送......\n".split(""));
        descList.push( "3秒后开始传送......\n".split(""));
        descList.push( "3.........\n".split(""));
        descList.push( "2.........\n".split(""));
        descList.push( "1.........\n".split(""));   
        var showLoadingText = function(listIndex, arrIndex) {
            if(!descList[listIndex][arrIndex]) {
                arrIndex = 0;
                listIndex +=1;
            }
            if(!descList[listIndex]) {
                //显示完毕
                setTimeout(function() {
                    cc.director.loadScene("mainScene");
                }, 1000)
                self.loadingDescL.string  = desStr + "";
                return
            }
            desStr = desStr + descList[listIndex][arrIndex];
            self.loadingDescL.string  = desStr + "■";
            setTimeout(function() {
                arrIndex += 1;
                showLoadingText(listIndex, arrIndex)
            }, 100)

        }
        showLoadingText(0, 0);
    },
    
});
