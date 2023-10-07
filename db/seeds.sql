
INSERT INTO departments (department_name) VALUES
    ('HR'),
    ('Finance'),
    ('Marketing'),
    ('Engineering'),
    ('Sales');

INSERT INTO roles (role_name, salary, department_id) VALUES
    ('HR Manager', 80000.00, 1),
    ('Financial Analyst', 75000.00, 2),
    ('Marketing Coordinator', 60000.00, 3),
    ('Software Engineer', 90000.00, 4),
    ('Sales Manager', 85000.00, 5);

INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES
    ('John', 'Doe', 1, NULL),
    ('Jane', 'Smith', 2, 1), 
    ('Mike', 'Johnson', 3, 1),
    ('Emily', 'Davis', 4, NULL),
    ('David', 'Brown', 5, 4);  