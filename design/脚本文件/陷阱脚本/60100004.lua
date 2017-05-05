--ID：60100004
--名称：蓝色针剂

--**角色接触陷阱时触发
--**trapID：陷阱ID
function maptrap_On(trapID)
	local talkString = {
		--感觉又有气力了！
		"trap_palyerTalk_10",
		--味道蛮不错的！
		"trap_palyerTalk_11",
		--咋感觉有点兴奋呢？
		"trap_palyerTalk_12"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**角色离开陷阱时触发
--**trapID：陷阱ID
function maptrap_Leave(trapID)
	
end