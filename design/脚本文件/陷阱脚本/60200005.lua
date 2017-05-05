--ID：60200005
--名称：毒雾

--**角色接触陷阱时触发
--**trapID：陷阱ID
function maptrap_On(trapID)
	local talkString = {
		--咳！咳！咳！咳死我了！
		"trap_palyerTalk_31",
		--这……这……这雾有毒！
		"trap_palyerTalk_32",
		--各种绿油油！
		"trap_palyerTalk_33"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**角色离开陷阱时触发
--**trapID：陷阱ID
function maptrap_Leave(trapID)
	local talkString = {
		--差点一口气憋死！
		"trap_palyerTalk_34",
		--呼~~我竟然可以憋气这么久！
		"trap_palyerTalk_35",
		--敢不敢再去走一次？！
		"trap_palyerTalk_36"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end