--ID：60100001
--名称：夜视镜

--**角色接触陷阱时触发
--**trapID：陷阱ID
function maptrap_On(trapID)
	local talkString = {
		--这个玩意儿好！
		"trap_palyerTalk_01",
		--RayZ夜视镜！好家伙！
		"trap_palyerTalk_02",
		--世界从未如此清晰过！
		"trap_palyerTalk_03"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**角色离开陷阱时触发
--**trapID：陷阱ID
function maptrap_Leave(trapID)
	
end