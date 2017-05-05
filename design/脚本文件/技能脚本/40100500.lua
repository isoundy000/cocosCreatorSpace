--ID：40100500-40100509
--名称：勇者无畏
--效果：当自身生命值低于20%时，暴击率提高x%，暴击伤害增加x%

--**技能使用时触发
--**userID：技能释放者ID
--**tagetID：技能承受者ID
--**skillID：技能ID
function skill_Use(userID,tagetID,skillID)
	playerHP_per = game.getPlayerValue("当前生命")/game.getPlayerValue("最大生命")
	statusID = skillID + 10000000
	if playerHP_per <= 0.2 then
		if game.isHaveSatus(userID,statusID) = false then
			game.addSkillSatus(userID,statusID)
		end
	else
		game.removeSkillSatus(userID,statusID)
	end
end
