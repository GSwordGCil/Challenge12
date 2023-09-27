INSERT INTO department (name) VALUES 
    ('Sales'),
    ('Engineering'),
    ('HR'),
    ('Finance'),
    ('Marketing');

INSERT INTO role (title, salary, department_id) VALUES 
    ('Sales Executive', 60000, 1),
    ('Software Engineer', 80000, 2),
    ('HR Manager', 55000, 3),
    ('Finance Analyst', 65000, 4),
    ('Marketing Specialist', 62000, 5),
    ('Senior Software Engineer', 95000, 2),
    ('Sales Associate', 55000, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
    ('John', 'Doe', 1, NULL),
    ('Jane', 'Smith', 2, 1),
    ('Bob', 'Johnson', 3, 1),
    ('Alice', 'Williams', 4, NULL),
    ('Charlie', 'Brown', 5, NULL),
    ('Eve', 'Davis', 7, 1),
    ('Frank', 'Miller', 6, 2),
    ('Grace', 'Wilson', 7, 1);

