--ID：60200003
--名称：毒水

--**角色接触陷阱时触发
--**trapID：陷阱ID
function maptrap_On(trapID)
	local talkString = {
		--夭寿……这下好玩了！
		"trap_palyerTalk_22",
		--以后一定要注意脚下！
		"trap_palyerTalk_23",
		--这是地沟油么？真臭！
		"trap_palyerTalk_24"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**角色离开陷阱时触发
--**trapID：陷阱ID
function maptrap_Leave(trapID)
	
end