--ID��60200006
--���ƣ���ɫ���

--**��ɫ�Ӵ�����ʱ����
--**trapID������ID
function maptrap_On(trapID)
	local talkString = {
		--ͻȻ�о���ûս������
		"trap_palyerTalk_37",
		--������һ��ëë�棡
		"trap_palyerTalk_38",
		--���������������Ӷ��򲻹���
		"trap_palyerTalk_39"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**��ɫ�뿪����ʱ����
--**trapID������ID
function maptrap_Leave(trapID)

end