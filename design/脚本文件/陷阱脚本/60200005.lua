--ID��60200005
--���ƣ�����

--**��ɫ�Ӵ�����ʱ����
--**trapID������ID
function maptrap_On(trapID)
	local talkString = {
		--�ȣ��ȣ��ȣ��������ˣ�
		"trap_palyerTalk_31",
		--�⡭���⡭�������ж���
		"trap_palyerTalk_32",
		--���������ͣ�
		"trap_palyerTalk_33"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**��ɫ�뿪����ʱ����
--**trapID������ID
function maptrap_Leave(trapID)
	local talkString = {
		--���һ����������
		"trap_palyerTalk_34",
		--��~~�Ҿ�Ȼ���Ա�����ô�ã�
		"trap_palyerTalk_35",
		--�Ҳ�����ȥ��һ�Σ���
		"trap_palyerTalk_36"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end