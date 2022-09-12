-- Add some initial data
INSERT INTO department (name)
VALUES ("sales"),
       ("IT");

INSERT INTO role (title, salary, department_id)
VALUES ("sales associate", 55000, 1),
       ("tech support", 70000, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Jim","Scott", 1, null),
       ("Peter","Parker",2 , 1);
       
