--ID：60100005
--名称：绿色针剂

--**角色接触陷阱时触发
--**trapID：陷阱ID
function maptrap_On(trapID)
	local talkString = {
		--啊！还有谁？！
		"trap_palyerTalk_13",
		--像我这样厉害的还有6个！
		"trap_palyerTalk_14",
		--洪荒之力快要爆发了！
		"trap_palyerTalk_15"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**角色离开陷阱时触发
--**trapID：陷阱ID
function maptrap_Leave(trapID)
	
end