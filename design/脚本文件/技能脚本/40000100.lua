--ID：40000100-40000109
--名称：致命一击
--效果：给目标造成70%伤害，若目标血量低于30%时，则有x%几率将其直接杀死。对BOSS无效

--**技能使用时触发
--**userID：技能释放者ID
--**tagetID：技能承受者ID
--**skillID：技能ID
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
