const inquirer = require('inquirer');
const express = require('express');
const mysql = require('mysql2');
const cTable = require('console.table');
const { initial } = require('jshint/src/prod-params.js');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'users_db'
  },
  console.log(`Connected to the users_db database.`)
);

async function init() {
  const addQuestions = [
    {
      type: 'list',
      message: 'What would you like to do?',
      name: 'mainMenu',
      choices: ['View All Employees', 'Add Employee', `Update Employee Role`, 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit']
    }
  ]
  await inquirer.prompt(addQuestions)
    .then((response) => {
      switch (response.mainMenu) {

        case 'View All Employees':
          return viewEmployees();

        case 'Add Employee':
          return addEmployee();

        case `Update Employee Role`:
          return updateEmployee();

        case `View All Roles`:
          return viewRoles();

        case `Add Role`:
          return addRole();

        case `View All Departments`:
          return viewDepartments();

        case `Add Department`:
          return addDepartment();

        case `Quit`:
          db.end();
          break;
      }
    })
}
async function viewRoles() {
  const sql =
    `SELECT 
    role.id AS roleID,
    title AS jobTitle, 
    department.name AS department,
    salary
    FROM role
    JOIN department ON role.department_id = department.id
    ORDER BY roleID`;

  const [allRoles] = await db.promise().query(sql);
  console.table(allRoles);
  return init();
}

async function viewDepartments() {
  const sql =
    `SELECT *
    FROM department
    ORDER BY id`;

  const [allDepartments] = await db.promise().query(sql);
  console.table(allDepartments);
  return init();
}

async function viewEmployees() {
  const sql =
    `SELECT  
  e.id AS employeeID,
  CONCAT (e.first_name,' ', e.last_name) AS employeeName, 
  role.title AS jobTitle, 
  department.name AS department,
  role.salary AS salary,
  CONCAT (m.first_name,' ', m.last_name) AS managerName
  
  FROM employee e
  
  JOIN role ON e.role_id = role.id
  LEFT JOIN department ON role.department_id = department.id
  LEFT JOIN employee m ON e.manager_id = m.id
  ORDER BY employeeID`;

  const [allEmployees] = await db.promise().query(sql);
  console.table(allEmployees);
  return init();
}

async function addDepartment() {
  const sql =
    `INSERT INTO department (name)
    VALUES (?);`;
  const newDepartmentInfo = await inquirer.prompt({
    type: 'input',
    message: 'Please enter the new department name: ',
    name: 'name',
  });
  await db.promise().query(sql, newDepartmentInfo.name);
  await viewDepartments();
}

async function addRole() {
  // get department list
  const sqlDepartments =
    `SELECT *
      FROM department
      ORDER BY id`;
  const departments = await db.promise().query(sqlDepartments);
  const newRoleInfo = await inquirer.prompt([
    {
      type: 'input',
      message: 'Please enter the new role name: ',
      name: 'name',
    },
    {
      type: 'input',
      message: 'Please enter the new role salary: ',
      name: 'salary',
    },
    {
      type: 'list',
      message: 'Please select the department of the role: ',
      name: 'department',
      choices: departments[0].map((department) => {
        return { name: department.name, value: department.id };
      }),
    },
  ]);
  await db.promise().query(`INSERT INTO role (title, salary, department_id)
  VALUES ("${newRoleInfo.name}","${newRoleInfo.salary}","${newRoleInfo.department}")`);
  await viewRoles();
}

async function addEmployee() {
  // get role list
  const sqlRoles =
    `SELECT id, title AS roleName
      FROM role
      ORDER BY id`;
  const roles = await db.promise().query(sqlRoles);

  // get manager list
  const sqlManagers =
    `SELECT id, CONCAT (first_name,' ', last_name) AS name
      FROM employee
      ORDER BY id`;
  const managers = await db.promise().query(sqlManagers);
  const newEmployeeInfo = await inquirer.prompt([
    {
      type: 'input',
      message: 'Please enter the first name: ',
      name: 'firstName',
    },
    {
      type: 'input',
      message: 'Please enter the last name: ',
      name: 'lastName',
    },
    {
      type: 'list',
      message: 'Please select the role: ',
      name: 'role',
      choices: roles[0].map((role) => {
        return { name: role.roleName, value: role.id };
      }),
    },
    {
      type: 'list',
      message: 'Please select the manager: ',
      name: 'manager',
      choices: managers[0].map((manager) => {
        return { name: manager.name, value: manager.id };
      }),
    }
  ]);
  await db.promise().query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
  VALUES ("${newEmployeeInfo.firstName}","${newEmployeeInfo.lastName}", "${newEmployeeInfo.role}", "${newEmployeeInfo.manager}")`);
  await viewEmployees();
}

async function updateEmployee() {
  // get department list
  const sqlEmployees =
    `SELECT  
    e.id AS id,
    CONCAT (e.first_name,' ', e.last_name) AS employeeName, 
    role.title AS role, 
    department.name AS department,
    role.salary AS salary,
    CONCAT (m.first_name,' ', m.last_name) AS managerName
    
    FROM employee e
    
    JOIN role ON e.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee m ON e.manager_id = m.id`;
  const employees = await db.promise().query(sqlEmployees);
  // select employee to update
  const employeeSelection = await inquirer.prompt(
    {
      type: 'list',
      message: 'Please select the employee you want to make change: ',
      name: 'employee',
      choices: employees[0].map((employee) => {
        return { name: employee.employeeName, value: employee.id };
      }),
    });
  // get role list
  const sqlRoles =
    `SELECT id, title AS roleName
      FROM role
      ORDER BY id`;
  const roles = await db.promise().query(sqlRoles);
  // select the new role
  const newRoleSelection = await inquirer.prompt(
    {
      type: 'list',
      message: 'Please select the new role: ',
      name: 'role',
      choices: roles[0].map((role) => {
        return { name: role.roleName, value: role.id };
      }),
    }
  );
  await db.promise().query(`UPDATE employee SET role_id = ${newRoleSelection.role} WHERE id = ${employeeSelection.employee}`);
  await viewEmployees();
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

init();
