--ID：10040310
--名称：尖刺男

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
	game.addSkillSatuse(0,50500005)
end

--**怪物每次使用技能后触发
--**monsterID：当前怪物ID
--**skillID：变化的值
--**nowTurn：当前回合数
function monster_UseSkill(monsterID,skillID)
	if skillID = 40500004 then
		playerHP_per = game.getPlayerValue("当前生命")/game.getPlayerValue("最大生命")
		if playerHP_per <= 0.1 then
			gameOdds = game.Random(0,100)
			game.killRole(monsterID)
		end
	end
end