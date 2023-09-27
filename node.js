const inquirer = require('inquirer');
const mysql = require('mysql2');
const fs = require('fs');


async function executeSeeds() {
    fs.readFile('seeds.sql', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the seeds.sql file:', err);
            return;
        }

        // Split SQL statements (assuming they are delimited by semicolons)
        const sqlStatements = data.split(';').filter(statement => !!statement.trim());

        sqlStatements.forEach(statement => {
            connection.query(statement, (err, result) => {
                if (err) {
                    console.error('Error executing query:', err);
                }
            });
        });
    });
}

function executedb() {
    fs.readFile('db.sql', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the db.sql file:', err);
            return;
        }

        // Split SQL statements (assuming they are delimited by semicolons)
        const sqlStatements = data.split(';').filter(statement => !!statement.trim());

        sqlStatements.forEach(statement => {
            connection.query(statement, (err, result) => {
                if (err) {
                    console.error('Error executing query:', err);
                }
            });
        });
    });
}

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Letsgo134!',
    database: 'company_db'
});

connection.connect((err) => {
    if (err) throw err;
    executedb();
    executeSeeds();
    
    startApp();
});

const startApp = () => {
    inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employee',
            'Add department',
            'Add role',
            'Add employee',
            'Update employee manager',
            'View employees by manager',
            'View employees by department',
            'Delete department',
            'View department budget',
            'Exit'
        ]
    })
        .then((answer) => {
            switch (answer.action) {
                case 'View all departments':
                    viewDepartments();
                    break;
                case 'View all roles':
                    viewRoles();
                    break;
                case 'View all employee':
                    viewEmployees();
                    break;
                case 'Add department':
                    addDepartment();
                    break;
                case 'Add role':
                    addRole();
                    break;
                case 'Add employee':
                    addEmployee();
                    break;
                case 'Update employee manager':
                    updateEmployeeManager();
                    break;
                case 'View employees by manager':
                    viewEmployeesByManager();
                    break;
                case 'View employees by department':
                    viewEmployeesByDepartment();
                    break;
                case 'Delete department':
                    deleteDepartment();
                    break;
                case 'View department budget':
                    viewDepartmentBudget();
                    break;      
                case 'Exit':
                    connection.end();
                    break;
            }
        });
};

function viewDepartments () {
    connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.table(res);
        startApp();
    });
};

function viewEmployees() {
    const query = `
        SELECT e1.id, e1.first_name, e1.last_name, role.title, department.name AS department, role.salary, CONCAT(e2.first_name, ' ', e2.last_name) AS manager
        FROM employee AS e1
        LEFT JOIN role ON e1.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id
        LEFT JOIN employee AS e2 ON e1.manager_id = e2.id;
    `;

    connection.query(query, (err, results) => {
        if (err) throw err;
        console.log('\n');
        console.table(results);
        startApp();
    });
}

function viewRoles() {
    const query = `
        SELECT role.id, role.title, role.salary, department.name AS department 
        FROM role 
        LEFT JOIN department ON role.department_id = department.id;
    `;

    connection.query(query, (err, results) => {
        if (err) throw err;
        console.log('\n');
        console.table(results);
        startApp();
    });
}

function addDepartment() {
    inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: 'Enter the name of the department:'
        }
    ]).then(answers => {
        connection.query("INSERT INTO department (name) VALUES (?)", [answers.name], (err, results) => {
            if (err) throw err;
            console.log(`Added ${answers.name} to departments.`);
            startApp();
        });
    });
}

function addRole() {
    connection.query("SELECT * FROM department", (err, departments) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'title',
                type: 'input',
                message: 'Enter the role title:'
            },
            {
                name: 'salary',
                type: 'input',
                message: 'Enter the role salary:',
                validate: value => isNaN(value) ? 'Please enter a valid number.' : true
            },
            {
                name: 'department',
                type: 'list',
                message: 'Select the department:',
                choices: departments.map(department => ({
                    name: department.name,
                    value: department.id
                }))
            }
        ]).then(answers => {
            connection.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
                [answers.title, answers.salary, answers.department], (err, results) => {
                    if (err) throw err;
                    console.log(`Added role ${answers.title}.`);
                    startApp();
                });
        });
    });
}

function addEmployee() {
    connection.query("SELECT * FROM role", (err, roles) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'firstName',
                type: 'input',
                message: 'Enter the employee first name:'
            },
            {
                name: 'lastName',
                type: 'input',
                message: 'Enter the employee last name:'
            },
            {
                name: 'role',
                type: 'list',
                message: 'Select the role:',
                choices: roles.map(role => ({
                    name: role.title,
                    value: role.id
                }))
            }
        ]).then(answers => {
            connection.query("INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?)",
                [answers.firstName, answers.lastName, answers.role], (err, results) => {
                    if (err) throw err;
                    console.log(`Added employee ${answers.firstName} ${answers.lastName}.`);
                    startApp();
                });
        });
    });
}

function updateEmployeeManager() {
    connection.query("SELECT * FROM employee", (err, employees) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'employeeId',
                type: 'list',
                message: 'Select an employee to update their manager:',
                choices: employees.map(emp => ({
                    name: `${emp.first_name} ${emp.last_name}`,
                    value: emp.id
                }))
            },
            {
                name: 'managerId',
                type: 'list',
                message: 'Select the new manager for this employee:',
                choices: employees.map(emp => ({
                    name: `${emp.first_name} ${emp.last_name}`,
                    value: emp.id
                })).concat({ name: 'None', value: null })
            }
        ]).then(answers => {
            connection.query("UPDATE employee SET manager_id = ? WHERE id = ?", [answers.managerId, answers.employeeId], (err, results) => {
                if (err) throw err;
                console.log('Employee manager updated successfully.');
                startApp();
            });
        });
    });
}

function viewEmployeesByManager() {
    connection.query("SELECT * FROM employee WHERE manager_id IS NOT NULL", (err, managers) => {
        if (err) throw err;

        inquirer.prompt({
            name: 'managerId',
            type: 'list',
            message: 'Select a manager to view their employees:',
            choices: managers.map(manager => ({
                name: `${manager.first_name} ${manager.last_name}`,
                value: manager.id
            }))
        }).then(answer => {
            connection.query("SELECT * FROM employee WHERE manager_id = ?", [answer.managerId], (err, results) => {
                if (err) throw err;
                console.table(results);
                startApp();
            });
        });
    });
}

function viewEmployeesByDepartment() {
    connection.query("SELECT * FROM department", (err, departments) => {
        if (err) throw err;

        inquirer.prompt({
            name: 'departmentId',
            type: 'list',
            message: 'Select a department to view its employees:',
            choices: departments.map(dept => ({
                name: dept.name,
                value: dept.id
            }))
        }).then(answer => {
            const query = `
                SELECT employee.* 
                FROM employee
                JOIN role ON employee.role_id = role.id
                WHERE role.department_id = ?;
            `;
            connection.query(query, [answer.departmentId], (err, results) => {
                if (err) throw err;
                console.table(results);
                startApp();
            });
        });
    });
}

function deleteDepartment() {
    connection.query("SELECT * FROM department", (err, departments) => {
        if (err) throw err;

        inquirer.prompt({
            name: 'departmentId',
            type: 'list',
            message: 'Select a department to delete:',
            choices: departments.map(dept => ({
                name: dept.name,
                value: dept.id
            }))
        }).then(answer => {

            // Fetch IDs of the employees that will be deleted
            const selectEmployeesQuery = `
                SELECT e.id FROM employee e
                JOIN role r ON e.role_id = r.id
                WHERE r.department_id = ?
            `;

            connection.query(selectEmployeesQuery, [answer.departmentId], (err, employees) => {
                if (err) throw err;

                const employeeIds = employees.map(emp => emp.id);

                if (employeeIds.length === 0) {
                    proceedWithDeletion(answer.departmentId);
                    return;
                }

                // Update manager_id references
                connection.query("UPDATE employee SET manager_id = NULL WHERE manager_id IN (?)", [employeeIds], (err, results) => {
                    if (err) {
                        console.error('Error updating manager references:', err);
                        return startApp();
                    }
                    proceedWithDeletion(answer.departmentId);
                });
            });
        });
    });
}

function proceedWithDeletion(departmentId) {
    // Then, delete employees with roles from the department to be deleted
    const deleteEmployeesQuery = `
        DELETE e FROM employee e
        JOIN role r ON e.role_id = r.id
        WHERE r.department_id = ?
    `;

    connection.query(deleteEmployeesQuery, [departmentId], (err, results) => {
        if (err) {
            console.error('Error deleting employees:', err);
            return startApp();
        }

        // Delete roles associated with the department
        connection.query("DELETE FROM role WHERE department_id = ?", [departmentId], (err, results) => {
            if (err) {
                console.error('Error deleting roles:', err);
                return startApp();
            }

            // Finally, delete the department
            connection.query("DELETE FROM department WHERE id = ?", [departmentId], (err, results) => {
                if (err) {
                    console.error('Error deleting department:', err);
                    return startApp();
                }

                console.log('Department and its associated roles and employees have been deleted successfully.');
                startApp();
            });
        });
    });
}

function viewDepartmentBudget() {
    connection.query("SELECT * FROM department", (err, departments) => {
        if (err) throw err;

        inquirer.prompt({
            name: 'departmentId',
            type: 'list',
            message: 'Select a department to view its utilized budget:',
            choices: departments.map(dept => ({
                name: dept.name,
                value: dept.id
            }))
        }).then(answer => {
            const query = `
                SELECT department.name, SUM(role.salary) AS budget
                FROM employee
                JOIN role ON employee.role_id = role.id
                JOIN department ON role.department_id = department.id
                WHERE department.id = ?
                GROUP BY department.name;
            `;
            connection.query(query, [answer.departmentId], (err, results) => {
                if (err) throw err;
                console.table(results);
                startApp();
            });
        });
    });
}

