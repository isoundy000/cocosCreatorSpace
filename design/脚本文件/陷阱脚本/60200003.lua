--ID��60200003
--���ƣ���ˮ

--**��ɫ�Ӵ�����ʱ����
--**trapID������ID
function maptrap_On(trapID)
	local talkString = {
		--ز�١������º����ˣ�
		"trap_palyerTalk_22",
		--�Ժ�һ��Ҫע����£�
		"trap_palyerTalk_23",
		--���ǵع���ô�������
		"trap_palyerTalk_24"
		}
		
	local stringIndex = game.getRandom(1,3)
	game.setPlayerTalk(1,talkString[stringIndex])
end

--**��ɫ�뿪����ʱ����
--**trapID������ID
function maptrap_Leave(trapID)
	
end