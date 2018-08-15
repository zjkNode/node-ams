

// 根据id 查询所有子栏目
module.exports.SQL_selectChildById =  `SELECT * FROM :tbname 
				WHERE id = :id or pids LIKE CONCAT((SELECT CASE pids WHEN '0' THEN id ELSE CONCAT(pids,',',id) END 
					FROM :tbname WHERE id = :id),'%')`;

// 级联删除当前及所有子集
module.exports.SQL_deleteCascadeById =  `DELETE FROM :tbname WHERE id in(
											SELECT a.id from (
												SELECT * FROM :tbname 
												WHERE id = :id or pids LIKE CONCAT((SELECT CASE pids WHEN '0' THEN id ELSE CONCAT(pids,',',id) END 
												FROM rule WHERE id = :id),'%') 
											) a
										)`;
// 级联更新所有子栏目pids,在执行update语句之前执行,前提是pids 被更新了
module.exports.SQL_updateChildPids = `UPDATE :tbname SET pids = REPLACE(pids, 
													     (SELECT cpids from (SELECT CONCAT(pids,',',id) as cpids FROM :tbname WHERE id = :id) as b),
													     CONCAT(':pids',',',':id')) 
										WHERE id in(
											SELECT a.id from (
												SELECT * FROM :tbname 
												WHERE id = :id or pids LIKE CONCAT((SELECT CASE pids WHEN '0' THEN id ELSE CONCAT(pids,',',id) END 
												FROM :tbname WHERE id = :id),'%') 
											) a
										)`;
// 合同回滚
module.exports.SQL_rollbackContract = `UPDATE contracts a 
									   INNER JOIN contracts_history b 
									   SET a.title = b.title, a.content = b.content,
									       a.\`status\` = 3, a.publish_time = b.publish_time,a.update_time = NOW()
									   WHERE 
									   		a.id = b.cid  and b.id = :id`;