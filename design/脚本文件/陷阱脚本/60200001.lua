--ID��60200001
--���ƣ�AP����

--**��ɫ�Ӵ�����ʱ����
--**trapID������ID
function maptrap_On(trapID)
	local talkString = {
		--��˭��ôȱ�£���
		"trap_palyerTalk_16",
		--������湻��ù�ģ�
		"trap_palyerTalk_17",
		--��Ҫ����
		"trap_palyerTalk_18"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**��ɫ�뿪����ʱ����
--**trapID������ID
function maptrap_Leave(trapID)
	
end