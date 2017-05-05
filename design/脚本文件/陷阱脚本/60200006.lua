--ID：60200006
--名称：黄色针剂

--**角色接触陷阱时触发
--**trapID：陷阱ID
function maptrap_On(trapID)
	local talkString = {
		--突然感觉好没战斗力！
		"trap_palyerTalk_37",
		--好想变成一条毛毛虫！
		"trap_palyerTalk_38",
		--估计我现在连蚊子都打不过！
		"trap_palyerTalk_39"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**角色离开陷阱时触发
--**trapID：陷阱ID
function maptrap_Leave(trapID)

end