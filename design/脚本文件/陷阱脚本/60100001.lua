--ID��60100001
--���ƣ�ҹ�Ӿ�

--**��ɫ�Ӵ�����ʱ����
--**trapID������ID
function maptrap_On(trapID)
	local talkString = {
		--���������ã�
		"trap_palyerTalk_01",
		--RayZҹ�Ӿ����üһ
		"trap_palyerTalk_02",
		--�����δ�����������
		"trap_palyerTalk_03"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**��ɫ�뿪����ʱ����
--**trapID������ID
function maptrap_Leave(trapID)
	
end