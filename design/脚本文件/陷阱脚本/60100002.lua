--ID��60100002
--���ƣ���ɫ���

--**��ɫ�Ӵ�����ʱ����
--**trapID������ID
function maptrap_On(trapID)
	local talkString = {
		--����Ϊ���������ˣ�
		"trap_palyerTalk_04",
		--��~~���ڻ�����ˣ�
		"trap_palyerTalk_05",
		--�ܲ�������һ�ޣ���
		"trap_palyerTalk_06"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**��ɫ�뿪����ʱ����
--**trapID������ID
function maptrap_Leave(trapID)
	
end