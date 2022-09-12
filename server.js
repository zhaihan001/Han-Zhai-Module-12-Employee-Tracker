const inquirer = require('inquirer');
const express = require('express');
const mysql = require('mysql2');
const cTable = require('console.table');
const Department = require('./lib/department.js');
const Role = require('./lib/role.js');
const Employee = require('./lib/employee.js');
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
  const answer = await inquirer.prompt(addQuestions)
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
    JOIN department ON role.department_id = department.id`;

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
  LEFT JOIN employee m ON e.manager_id = m.id`;

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
  await db.promise().query(sql,newDepartmentInfo.name);
  await viewDepartments();
}

// async function addEmployee() {
//   const sql =
//     `INSERT INTO employee (first_name, last_name, role_id, manager_id)
//     VALUES ("Jim","Scott", 1, null)`;
//   const roleList = viewRoles();
//   const managerList = viewEmployees();
//   const newEmployeeInfo = [
//     {
//       type: 'input',
//       message: 'Please enter the first name: ',
//       name: 'firstName',
//     },
//     {
//       type: 'input',
//       message: 'Please enter the last name: ',
//       name: 'lastName',
//     },
//     {
//       type: 'list',
//       message: 'Please select the role: ',
//       name: 'role',
//       choices: roleList.jobTitle,
//     },
//     {
//       type: 'input',
//       message: 'Please select the manager: ',
//       name: 'manager',
//       choices: managerList.name,
//     }
//   ]
//   inquirer.prompt(newEmployeeInfo)
//     .then((response) => {
//       console.log(response.role);
//     })
// }

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

init();
