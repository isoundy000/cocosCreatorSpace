--ID��60200004
--���ƣ�����

--**��ɫ�Ӵ�����ʱ����
--**trapID������ID
function maptrap_On(trapID)
	local talkString = {
		--�е��˼��ɾ��ĸо���
		"trap_palyerTalk_25",
		--ѽ��զһ��ʲô���������ˣ�
		"trap_palyerTalk_26",
		--�ɱ�ȵ�ţʺ�ˣ�
		"trap_palyerTalk_27"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**��ɫ�뿪����ʱ����
--**trapID������ID
function maptrap_Leave(trapID)
	local talkString = {
		--�����߳����ˣ�
		"trap_palyerTalk_28",
		--������·�ˣ�
		"trap_palyerTalk_29",
		--��������Ҳ�ܳ���Ү��
		"trap_palyerTalk_30"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end