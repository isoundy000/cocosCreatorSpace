var utils = require("utils");
var log = utils.log;
var astart = {
	points : [],
	//初始化地图的障碍物
	initBlockList : function(tiledMap) {
		this.points = [];
		var mapSize = tiledMap.getMapSize();
		var allLayers = tiledMap.allLayers();
		for(let x = 0; x< mapSize.width; x++) {
			this.points[x] = [];
			for(let y = 0; y< mapSize.height; y++) {
				this.points[x][y] = {x: x, y : y, val : 0};
				for(let key in allLayers) {
					let v = allLayers[key];
					var gid = v.getTileGIDAt(cc.v2(x, y));
					var tmp = tiledMap.getPropertiesForGID(gid);
					if(tmp && tmp.block) {
						this.points[x][y].val = 1;
					}
				}
				
			}	
		}
	},
	//添加障碍物进地图
	addBlockPoint : function(posIndex) {
		var row = posIndex.xIndex;
		var col = posIndex.yIndex;
		this.points[row] = this.points[row] || [];
		this.points[row][col].val = 1;
	},
	//移出障碍物
	removeBlockPoint : function(posIndex) {
		var row = posIndex.xIndex;
		var col = posIndex.yIndex;
		this.points[row][col].val = undefined;
	},

	// 监测是否在列表中
	inList : function(list, current) {
	    for (var i = 0, len = list.length; i < len; i++) {
	        if ((current.x == list[i].x && current.y == list[i].y) || (current == list[i])) 
	            return true;
	    }
	    return false;
	},

	findPath : function(startIndex, endIndex) {
		var start = {x:startIndex.xIndex, y:startIndex.yIndex};
		var end = {x:endIndex.xIndex, y:endIndex.yIndex};
		if(this.points[end.x][end.y].val === 1) {return false}; //终点是障碍物
		var points = this.points;
		var opens = [];
		var closes = [];
		var cur = null; //
		var bFind = true; //是否检索
		// 设置开始点的F、G为0并放入opens列表（F=G+H）
	    start.F = 0;
	    start.G = 0;
	    start.H = 0;  
		//将起点压入closes数组，并设置cur指向起始点
	    closes.push(start);
	    cur = start;    
	    // 如果起始点紧邻结束点则不计算路径直接将起始点和结束点压入closes数组
	    if (Math.abs(start.x - end.x) + Math.abs(start.y - end.y) == 1) {
	        end.P = start;
	        closes.push(end);
	        bFind = false;
	    }
	    // 计算路径
	    while (cur && bFind) {
	        //如果当前元素cur不在closes列表中，则将其压入closes列表中
	        if (!this.inList(closes, cur)) 
	            closes.push(cur);
	        // 然后获取当前点四周点
	        var rounds = this.getRounds(points, cur);
        	// 当四周点不在opens数组中并且可移动，设置G、H、F和父级P，并压入opens数组
        	for (var i = 0; i < rounds.length; i++) {
	            if (rounds[i].val === 1 || this.inList(closes, rounds[i]) || this.inList(opens, rounds[i])) 
	                continue;
	            else if (!this.inList(opens, rounds[i]) && rounds[i].val != 1) {
	                rounds[i].G = cur.G + 1;//不算斜的，只算横竖，设每格距离为1
	                rounds[i].H = Math.abs(rounds[i].y - end.y) + Math.abs(rounds[i].x - end.x);
	                rounds[i].F = rounds[i].G + rounds[i].H;
	                rounds[i].P = cur;//cur为.P的父指针                
	                opens.push(rounds[i]);
	            }
	        }
	        // 如果获取完四周点后opens列表为空，则代表无路可走，此时退出循环
	        if (!opens.length) {
	            cur = null;
	            opens = [];
	            closes = [];
	            break;
	        }        
	        // 按照F值由小到大将opens数组排序
	        opens.sort(function (a, b) {
	            return a.F - b.F;
	        });
	        // 取出opens数组中F值最小的元素，即opens数组中的第一个元素
	        var oMinF = opens[0];
	        var aMinF = [];  // 存放opens数组中F值最小的元素集合        
	        // 循环opens数组，查找F值和cur的F值一样的元素，并压入aMinF数组。即找出和最小F值相同的元素有多少
	        for (var i = 0; i < opens.length; i++) {
	            if (opens[i].F == oMinF.F) 
	                aMinF.push(opens[i]);
	        } 
	         // 如果最小F值有多个元素
	        if (aMinF.length > 1) {
	            // 计算元素与cur的曼哈顿距离
	            for (var i = 0; i < aMinF.length; i++) {
	                aMinF[i].D = Math.abs(aMinF[i].x - cur.x) + Math.abs(aMinF[i].y - cur.y);
	            }           
	            // 将aMinF按照D曼哈顿距离由小到大排序（按照数值的大小对数字进行排序）
	            aMinF.sort(function (a, b) {
	                return a.D - b.D;
	            });                        
	            oMinF = aMinF[0];
	        }
	        // 将cur指向D值最小的元素
	        cur = oMinF;        
	        // 将cur压入closes数组
	        if (!this.inList(closes, cur)) 
	            closes.push(cur);       
	        // 将cur从opens数组中删除
	        for (var i = 0; i < opens.length; i++) {
	            if (opens[i] == cur) {
	                opens.splice(i, 1);//将第i个值删除
	                break;
	            }
	        }
	        // 找到最后一点，并将结束点压入closes数组
	        if (cur.H == 1) {
	            end.P = cur;
	            closes.push(end);
	            cur = null;
	        }                         
        }
        var path = [];
        if (closes.length) {
	        // 从结尾开始往前找
	        var dotCur = closes[closes.length - 1];
	          // 存放最终路径
	        var i=0;
	        while (dotCur) {
	            path.unshift(dotCur);  // 将当前点压入path数组的头部
	            dotCur = dotCur.P;  // 设置当前点指向父级            
	            if (!dotCur.P) {
	                dotCur = null;
	            }
	        }        
	        
	    }else {
	    	path = false;
	    } 
	    return path;
	},
	// 获取四周点
 	getRounds : function(points, current) {
	    var u = null;//上
	    var l = null;//左
	    var d = null;//下
	    var r = null;//右    
	    var rounds = [];
	    // 上
	    if (current.x - 1 >= 0) {
	        u = points[current.x - 1][current.y];
	        rounds.push(u);
	    }    
	    // 左
	    if (current.y - 1 >= 0) {
	        l = points[current.x][current.y - 1];
	        rounds.push(l);
	    }
	    // 下
	    if (current.x + 1 < points.length) {
	        d = points[current.x + 1][current.y];
	        rounds.push(d);
	    }    
	    // 右
	    if (current.y + 1 < points[0].length) {
	        r = points[current.x][current.y + 1];
	        rounds.push(r);
	    }    
	    return rounds;
	},
}


module.exports = astart; 