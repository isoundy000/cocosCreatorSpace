--ID：60100002
--名称：红色针剂

--**角色接触陷阱时触发
--**trapID：陷阱ID
function maptrap_On(trapID)
	local talkString = {
		--还以为就这样挂了！
		"trap_palyerTalk_04",
		--呼~~终于活过来了！
		"trap_palyerTalk_05",
		--能不能再来一罐？！
		"trap_palyerTalk_06"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**角色离开陷阱时触发
--**trapID：陷阱ID
function maptrap_Leave(trapID)
	
end