--ID��10050410
--���ƣ���צսʿ

--**��������ʱ����
--**monsterID����ǰ����ID
function monster_Dead(monsterID)

end

--**����ÿ��Ѫ���仯�󴥷�
--**monsterID����ǰ����ID
--**nowHP���仯���Ѫ��
--**nowTurn����ǰ�غ���
function monster_HPchange(monsterID,nowTurn)
	monsterHP_per = game.geMonsterHP(monsterID)/game.getMonsterValue(monsterID,"hp")
	if playerHP_per <= 0.2 then
		game.addSkillSatuse(monsterID,50500007)
	else
		game.removeSkillSatus(monsterID,50500007)
	end
end

--**����ÿ�η��������󴥷�
--**monsterID����ǰ����ID
--**nowHP���仯��ֵ
--**nowTurn����ǰ�غ���
function monster_Attack(monsterID,nowTurn)

end

--**����ÿ��ʹ�ü��ܺ󴥷�
--**monsterID����ǰ����ID
--**skillID���仯��ֵ
--**nowTurn����ǰ�غ���
function monster_UseSkill(monsterID,skillID)
	if skillID = 40500005 then
		gameOdds = game.Random(0,100)
		if gameOdds <= 20 then
			game.addSkillSatuse(0,50100400)
		end
	end
end