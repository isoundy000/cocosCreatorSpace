--ID：40300101
--名称：AP地雷、毒雾
--效果：生命损失x点（标准值20%）

--**技能使用时触发
--**userID：技能释放者ID
--**tagetID：技能承受者ID
--**skillID：技能ID
function skill_Use(userID,tagetID,skillID)
	playerLevel = game.getPlayerValue("等级")
	ReduceHP = 10200+1800*playerLevel
	if skillID = 40300101 then
		ReduceHP = ReduceHP * 0.1
	else if skillID = 40300105 then
		ReduceHP = math.ceil(ReduceHP * 0.025)
	end
	game.setPlayerValue("当前生命" , game.getPlayerValue("当前生命") - ReduceHP)
end