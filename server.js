const inquirer = require('inquirer');
const mysql = require('mysql2');
require('dotenv').config();
const { table } = require('console');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to the database');
  start();
});

function start() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
          'Exit',
        ],
      },
    ])
    .then((answer) => {
      switch (answer.action) {
        case 'View all departments':
          viewDepartments();
          break;
        case 'View all roles':
          viewRoles();
          break;
        case 'View all employees':
          viewEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployeeInfo();
          break;
        case 'Exit':
          console.log('Goodbye!');
          db.end();
          break;
      }
    });
}

function viewDepartments() {
  const query = 'SELECT * FROM departments';
  db.query(query, (err, res) => {
    if (err) throw err;
    console.log('Departments:', res);
    table(res);
    start();
  });
}

function viewRoles() {
  const query = 'SELECT * FROM roles';
  db.query(query, (err, res) => {
    if (err) throw err;
    console.log('Roles:', res);
    table(res);
    start();
  });
}

function viewEmployees() {
  const query = 'SELECT * FROM employees';
  db.query(query, (err, res) => {
    if (err) throw err;
    console.log('Employees:', res);
    table(res);
    start();
  });
}

function addDepartment() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter the department name:',
      },
    ])
    .then((answer) => {
      const query = 'INSERT INTO departments SET ?';
      db.query(query, { department_name: answer.name }, (err) => {
        if (err) throw err;
        console.log('Department added successfully!');
        start();
      });
    });
}

function addRole() {
  inquirer.prompt([
      {
          name: "title",
          type: "input",
          message: "Please enter the title of role you want to add to the database."
      },
      {
          name: "salary",
          type: "input",
          message: "Please enter the salary associated with the role you want to add to the database. (no dots, space or commas)",
          // validate: salary => {
          //   const parsedSalary = parseFloat(salary);
          //   if (isNaN(parsedSalary) || parsedSalary < 0) {
          //     return 'Please enter a valid positive number for the salary';
          //   }
          //   return true;
          // },
        },
      {
          name: "department_id",
          type: "number",
          message: "Please enter the department's id associated with the role you want to add to the database."
      }
  ]).then((response) => {
    db.query("INSERT INTO roles (role_name, salary, department_id) VALUES (?, ?, ?)", [response.title, response.salary, response.department_id], 
    
    function (err, data) {
      if (err) throw err;
      console.log('The new role has been added successfully to the database.');

      db.query("SELECT roles.*, departments.department_name FROM roles INNER JOIN departments ON roles.department_id = departments.id", (err, result) => {
        if (err) {
          console.error("Error retrieving roles:", err.message);
          start();
          return;
        }

        console.table(result);
        start();
      });
    });
  });
}

function addEmployee() {
  db.query('SELECT * FROM roles', (err, result) => {
    if (err) throw err;

    const roles = result.map(role => role.role_name);

    db.query('SELECT * FROM employees WHERE manager_id IS NULL', (err, managersResult) => {
      if (err) throw err;

      const managers = managersResult.map(manager => `${manager.first_name} ${manager.last_name}`);

      inquirer
        .prompt([
          {
            type: 'input',
            name: 'first_name',
            message: "Enter the employee's first name:",
          },
          {
            type: 'input',
            name: 'last_name',
            message: "Enter the employee's last name:",
          },
          {
            type: 'list',
            name: 'role',
            message: "Please select the employee's role:",
            choices: roles,
          },
          {
            type: 'list',
            name: 'manager',
            message: "Please select the employee's manager:",
            choices: managers,
          },
        ])
        .then((answer) => {
          const selectedRole = result.find(role => role.role_name === answer.role);
          const role_id = selectedRole.id;

          const selectedManager = managersResult.find(manager => `${manager.first_name} ${manager.last_name}` === answer.manager);
          const manager_id = selectedManager.id;

          const query = 'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';
          const employeeData = [answer.first_name, answer.last_name, role_id, manager_id];

          db.query(query, employeeData, (err) => {
            if (err) {
              console.error('Error adding employee:', err);
              throw err;
            }
            console.log('Employee added successfully!');
            start();
          });
        });
    });
  });
}

function updateEmployeeInfo() {
  db.query('SELECT * FROM employees', (err, employeesResult) => {
    if (err) throw err;

    const employees = employeesResult.map(employee => `${employee.first_name} ${employee.last_name}`);

    inquirer
      .prompt([
        {
          type: 'list',
          name: 'employee',
          message: 'Select the employee whose information you want to update:',
          choices: employees,
        },
        {
          type: 'input',
          name: 'newFirstName',
          message: 'Enter the new first name for the employee:',
        },
        {
          type: 'input',
          name: 'newLastName',
          message: 'Enter the new last name for the employee:',
        },
      ])
      .then((answer) => {
        const selectedEmployee = employeesResult.find(employee => `${employee.first_name} ${employee.last_name}` === answer.employee);
        const employee_id = selectedEmployee.id;

        const query = 'UPDATE employees SET first_name = ?, last_name = ? WHERE id = ?';
        const updateData = [answer.newFirstName, answer.newLastName, employee_id];

        db.query(query, updateData, (err) => {
          if (err) {
            console.error('Error updating employee information:', err);
            throw err;
          }
          console.log('Employee information updated successfully!');
          start();
        });
      });
  });
}
