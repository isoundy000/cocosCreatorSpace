--ID��40000100-40000109
--���ƣ�����һ��
--Ч������Ŀ�����70%�˺�����Ŀ��Ѫ������30%ʱ������x%���ʽ���ֱ��ɱ������BOSS��Ч

--**����ʹ��ʱ����
--**userID�������ͷ���ID
--**tagetID�����ܳ�����ID
--**skillID������ID
function skill_Use(userID,tagetID,skillID)
	if game.getRoleType(targetID) = "monster" then
		monsterHP_per = game.geMonsterHP(monsterID)/game.getMonsterValue(monsterID,"hp")
		if game.getMonsterValue(tagetID,"isBOSS") = 0 and playerHP_per < 0.3 then
			gameOdds = game.Random(0,100)
			if game.getSKillValue(skillID,"Seckill") <=  gameOdds then 
				game.killRole(tagetID)
			end
		end
	end
end
