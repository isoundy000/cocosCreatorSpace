--ID：60200004
--名称：迷雾

--**角色接触陷阱时触发
--**trapID：陷阱ID
function maptrap_On(trapID)
	local talkString = {
		--有点人间仙境的感觉！
		"trap_palyerTalk_25",
		--呀！咋一下什么都看不见了？
		"trap_palyerTalk_26",
		--可别踩到牛屎了！
		"trap_palyerTalk_27"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**角色离开陷阱时触发
--**trapID：陷阱ID
function maptrap_Leave(trapID)
	local talkString = {
		--终于走出来了！
		"trap_palyerTalk_28",
		--差点就迷路了！
		"trap_palyerTalk_29",
		--好想乱走也能出来耶！
		"trap_palyerTalk_30"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end