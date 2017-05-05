--ID：60100003
--名称：粉色针剂

--**角色接触陷阱时触发
--**trapID：陷阱ID
function maptrap_On(trapID)
	local talkString = {
		--没啥效果？不会过期了吧？！
		"trap_palyerTalk_07",
		--恢复得有点慢啊！
		"trap_palyerTalk_08",
		--总比没有好！
		"trap_palyerTalk_09"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**角色离开陷阱时触发
--**trapID：陷阱ID
function maptrap_Leave(trapID)
	
end