--ID��60100005
--���ƣ���ɫ���

--**��ɫ�Ӵ�����ʱ����
--**trapID������ID
function maptrap_On(trapID)
	local talkString = {
		--��������˭����
		"trap_palyerTalk_13",
		--�������������Ļ���6����
		"trap_palyerTalk_14",
		--���֮����Ҫ�����ˣ�
		"trap_palyerTalk_15"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**��ɫ�뿪����ʱ����
--**trapID������ID
function maptrap_Leave(trapID)
	
end