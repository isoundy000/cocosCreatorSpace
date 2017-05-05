--ID：60200001
--名称：AP地雷

--**角色接触陷阱时触发
--**trapID：陷阱ID
function maptrap_On(trapID)
	local talkString = {
		--是谁这么缺德？！
		"trap_palyerTalk_16",
		--今天可真够倒霉的！
		"trap_palyerTalk_17",
		--我要报仇！
		"trap_palyerTalk_18"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**角色离开陷阱时触发
--**trapID：陷阱ID
function maptrap_Leave(trapID)
	
end