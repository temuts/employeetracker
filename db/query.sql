
ALTER TABLE employees
ADD COLUMN manager_id INT;

SELECT
    e1.id AS employee_id,
    e1.first_name AS employee_first_name,
    e1.last_name AS employee_last_name,
    r1.role_name AS employee_role,
    d1.department_name AS employee_department,
    r1.salary AS employee_salary,
    e2.first_name AS manager_first_name,
    e2.last_name AS manager_last_name
FROM
    employees AS e1
LEFT JOIN
    roles AS r1 ON e1.role_id = r1.id
LEFT JOIN
    departments AS d1 ON r1.department_id = d1.id
LEFT JOIN
    employees AS e2 ON e1.manager_id = e2.id;

