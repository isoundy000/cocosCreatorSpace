--ID��40100500-40100509
--���ƣ�������η
--Ч��������������ֵ����20%ʱ�����������x%�������˺�����x%

--**����ʹ��ʱ����
--**userID�������ͷ���ID
--**tagetID�����ܳ�����ID
--**skillID������ID
function skill_Use(userID,tagetID,skillID)
	playerHP_per = game.getPlayerValue("��ǰ����")/game.getPlayerValue("�������")
	statusID = skillID + 10000000
	if playerHP_per <= 0.2 then
		if game.isHaveSatus(userID,statusID) = false then
			game.addSkillSatus(userID,statusID)
		end
	else
		game.removeSkillSatus(userID,statusID)
	end
end
