--ID��40300101
--���ƣ�AP���ס�����
--Ч����������ʧx�㣨��׼ֵ20%��

--**����ʹ��ʱ����
--**userID�������ͷ���ID
--**tagetID�����ܳ�����ID
--**skillID������ID
function skill_Use(userID,tagetID,skillID)
	playerLevel = game.getPlayerValue("�ȼ�")
	ReduceHP = 10200+1800*playerLevel
	if skillID = 40300101 then
		ReduceHP = ReduceHP * 0.1
	else if skillID = 40300105 then
		ReduceHP = math.ceil(ReduceHP * 0.025)
	end
	game.setPlayerValue("��ǰ����" , game.getPlayerValue("��ǰ����") - ReduceHP)
end