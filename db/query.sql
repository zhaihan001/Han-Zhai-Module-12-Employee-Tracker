select * from department;


SELECT 
title AS roleName, 
salary, 
department.name AS department

FROM role

JOIN department ON role.department_id = department.id;


SELECT  
CONCAT (m.first_name,' ', m.last_name) AS employeeName, 
role.title AS roleName, 
m.manager_id AS managerID

FROM employee m

JOIN role ON m.role_id = role.id
LEFT JOIN employee e ON m.manager_id = e.id;
