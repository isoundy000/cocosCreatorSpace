--ID��60200002
--���ƣ�����Ⱥ

--**��ɫ�Ӵ�����ʱ����
--**trapID������ID
function maptrap_On(trapID)
	local talkString = {
		--���������������ң�
		"trap_palyerTalk_19",
		--������ɱ�������
		"trap_palyerTalk_20",
		--��֪���Ͳ�����ˮ�ˣ�
		"trap_palyerTalk_21"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**��ɫ�뿪����ʱ����
--**trapID������ID
function maptrap_Leave(trapID)
	
end