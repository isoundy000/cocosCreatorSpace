--ID��10040310
--���ƣ������

--**��������ʱ����
--**monsterID����ǰ����ID
function monster_Dead(monsterID)

end

--**����ÿ��Ѫ���仯�󴥷�
--**monsterID����ǰ����ID
--**nowHP���仯���Ѫ��
--**nowTurn����ǰ�غ���
function monster_HPchange(monsterID,nowTurn)

end

--**����ÿ�η��������󴥷�
--**monsterID����ǰ����ID
--**nowHP���仯��ֵ
--**nowTurn����ǰ�غ���
function monster_Attack(monsterID,nowTurn)
	game.addSkillSatuse(0,50500005)
end

--**����ÿ��ʹ�ü��ܺ󴥷�
--**monsterID����ǰ����ID
--**skillID���仯��ֵ
--**nowTurn����ǰ�غ���
function monster_UseSkill(monsterID,skillID)
	if skillID = 40500004 then
		playerHP_per = game.getPlayerValue("��ǰ����")/game.getPlayerValue("�������")
		if playerHP_per <= 0.1 then
			gameOdds = game.Random(0,100)
			game.killRole(monsterID)
		end
	end
end