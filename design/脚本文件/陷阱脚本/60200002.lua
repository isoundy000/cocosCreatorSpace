--ID：60200002
--名称：毒虫群

--**角色接触陷阱时触发
--**trapID：陷阱ID
function maptrap_On(trapID)
	local talkString = {
		--滚开！别来缠着我！
		"trap_palyerTalk_19",
		--哪里有杀虫剂啊？
		"trap_palyerTalk_20",
		--早知道就不喷香水了！
		"trap_palyerTalk_21"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**角色离开陷阱时触发
--**trapID：陷阱ID
function maptrap_Leave(trapID)
	
end