--ID��60100004
--���ƣ���ɫ���

--**��ɫ�Ӵ�����ʱ����
--**trapID������ID
function maptrap_On(trapID)
	local talkString = {
		--�о����������ˣ�
		"trap_palyerTalk_10",
		--ζ��������ģ�
		"trap_palyerTalk_11",
		--զ�о��е��˷��أ�
		"trap_palyerTalk_12"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**��ɫ�뿪����ʱ����
--**trapID������ID
function maptrap_Leave(trapID)
	
end