--ID：10030410
--名称：电锯男

--**怪物死亡时触发
--**monsterID：当前怪物ID
function monster_Dead(monsterID)

end

--**怪物每次血量变化后触发
--**monsterID：当前怪物ID
--**nowHP：变化后的血量
--**nowTurn：当前回合数
function monster_HPchange(monsterID,nowTurn)

end

--**怪物每次发动攻击后触发
--**monsterID：当前怪物ID
--**nowHP：变化的值
--**nowTurn：当前回合数
function monster_Attack(monsterID,nowTurn)

end

--**怪物每次使用技能后触发
--**monsterID：当前怪物ID
--**skillID：变化的值
--**nowTurn：当前回合数
function monster_UseSkill(monsterID,skillID)
	if skillID = 40500003 then
		gameOdds = game.Random(0,100)
		if gameOdds <= 30 then
			game.addSkillSatuse(0,50500003)
		end
	end
end