--ID��10030410
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

end

--**����ÿ��ʹ�ü��ܺ󴥷�
--**monsterID����ǰ����ID
--**skillID���仯��ֵ
--**nowTurn����ǰ�غ���
function monster_UseSkill(monsterID,skillID)
	if skillID = 40500003 then
		gameOdds = game.Random(0,100)
		if gameOdds <= 30 then
			game.addSkillSatuse(0,50500003)
		end
	end
end