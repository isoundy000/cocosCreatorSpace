--ID��60100003
--���ƣ���ɫ���

--**��ɫ�Ӵ�����ʱ����
--**trapID������ID
function maptrap_On(trapID)
	local talkString = {
		--ûɶЧ������������˰ɣ���
		"trap_palyerTalk_07",
		--�ָ����е�������
		"trap_palyerTalk_08",
		--�ܱ�û�кã�
		"trap_palyerTalk_09"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**��ɫ�뿪����ʱ����
--**trapID������ID
function maptrap_Leave(trapID)
	
end