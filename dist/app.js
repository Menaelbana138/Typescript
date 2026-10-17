"use strict";
// ----------------------------------------
var Department;
(function (Department) {
    Department["IT"] = "IT";
    Department["HR"] = "HR";
    Department["Sales"] = "Sales";
    Department["Front"] = "Frontend";
    Department["Back"] = "Backend";
    Department["Flutter"] = "Flutter";
})(Department || (Department = {}));
// ----------------------------------------
class EmployeeClass {
    constructor(id, firstName, lastName, email, department, salary, hireDate) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.department = department;
        this.salary = salary;
        this.hireDate = hireDate;
    }
}
// ----------------------------------------
class Repository {
    constructor() {
        this.items = [];
    }
    add(item) {
        this.items.push(item);
    }
    getAll() {
        return this.items;
    }
    getById(id) {
        return this.items.find((item) => item.id === id);
    }
    update(id, updatedFields) {
        const item = this.getById(id);
        if (item) {
            Object.assign(item, updatedFields);
        }
    }
    delete(id) {
        this.items = this.items.filter((item) => item.id !== id);
    }
    setAll(items) {
        this.items = items;
    }
}
const employeeRepo = new Repository();
// ----------------------------------------
function validateEmployee(data) {
    if (data.firstName.trim() === "" || data.lastName.trim() === "") {
        return "First name and last name are required";
    }
    if (!data.email.includes("@")) {
        return "Invalid email address";
    }
    if (data.salary <= 0) {
        return "Salary must be greater than zero";
    }
    if (isNaN(data.hireDate.getTime())) {
        return "Invalid hire date";
    }
    return null;
}
// ----------------------------------------
const STORAGE_KEY = "employees";
function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(employeeRepo.getAll()));
    }
    catch (error) {
        console.error("Failed to save employees:", error);
    }
}
function loadFromStorage() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data)
            return;
        const parsed = JSON.parse(data);
        const employees = parsed.map((emp) => ({
            ...emp,
            hireDate: new Date(emp.hireDate),
        }));
        employeeRepo.setAll(employees);
    }
    catch (error) {
        console.error("Failed to load employees:", error);
    }
}
// ----------------------------------------
const form = document.getElementById("employee-form");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const departmentInput = document.getElementById("department");
const salaryInput = document.getElementById("salary");
const hireDateInput = document.getElementById("hireDate");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const formTitle = document.getElementById("form-title");
const searchInput = document.getElementById("search");
const tableBody = document.getElementById("employee-table-body");
const dashboard = document.getElementById("dashboard");
let editingId = null;
// ----------------------------------------
function renderDashboard() {
    const employees = employeeRepo.getAll();
    const total = employees.length;
    const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
    const avgSalary = total > 0 ? Math.round(totalSalary / total) : 0;
    const departments = new Set(employees.map((emp) => emp.department));
    dashboard.innerHTML = `
    <div class="card">
      <h3>Total Employees</h3>
      <p>${total}</p>
    </div>
    <div class="card">
      <h3>Total Salaries</h3>
      <p>${totalSalary.toLocaleString()}</p>
    </div>
    <div class="card">
      <h3>Average Salary</h3>
      <p>${avgSalary.toLocaleString()}</p>
    </div>
    <div class="card">
      <h3>Departments</h3>
      <p>${departments.size}</p>
    </div>
  `;
}
// ----------------------------------------
function renderTable(filter = "") {
    const employees = employeeRepo.getAll();
    const filtered = employees.filter((emp) => {
        const search = filter.toLowerCase();
        return (emp.firstName.toLowerCase().includes(search) ||
            emp.lastName.toLowerCase().includes(search) ||
            emp.department.toLowerCase().includes(search));
    });
    tableBody.innerHTML = "";
    filtered.forEach((emp) => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>${emp.firstName} ${emp.lastName}</td>
      <td>${emp.email}</td>
      <td>${emp.department}</td>
      <td>${emp.salary.toLocaleString()}</td>
      <td>${new Date(emp.hireDate).toLocaleDateString()}</td>
      <td>
        <button class="edit-btn" data-id="${emp.id}">Edit</button>
        <button class="delete-btn" data-id="${emp.id}">Delete</button>
      </td>
    `;
        tableBody.appendChild(row);
    });
    renderDashboard();
    attachRowEvents();
}
// ----------------------------------------
function attachRowEvents() {
    document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            const emp = employeeRepo.getById(id);
            if (!emp)
                return;
            editingId = id;
            firstNameInput.value = emp.firstName;
            lastNameInput.value = emp.lastName;
            emailInput.value = emp.email;
            departmentInput.value = emp.department;
            salaryInput.value = String(emp.salary);
            hireDateInput.value = new Date(emp.hireDate).toISOString().split("T")[0];
            formTitle.textContent = "Edit Employee";
            submitBtn.textContent = "Save Changes";
            cancelBtn.classList.remove("hidden");
        });
    });
    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            const confirmDelete = confirm("Are you sure you want to delete this employee?");
            if (!confirmDelete)
                return;
            employeeRepo.delete(id);
            saveToStorage();
            renderTable(searchInput.value);
        });
    });
}
function resetForm() {
    form.reset();
    editingId = null;
    formTitle.textContent = "Add Employee";
    submitBtn.textContent = "Add Employee";
    cancelBtn.classList.add("hidden");
}
cancelBtn.addEventListener("click", resetForm);
// ----------------------------------------
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const employeeData = {
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        email: emailInput.value.trim(),
        department: departmentInput.value,
        salary: Number(salaryInput.value),
        hireDate: new Date(hireDateInput.value),
    };
    const error = validateEmployee(employeeData);
    if (error) {
        alert(error);
        return;
    }
    if (editingId !== null) {
        employeeRepo.update(editingId, employeeData);
    }
    else {
        const newId = Date.now();
        const newEmployee = new EmployeeClass(newId, employeeData.firstName, employeeData.lastName, employeeData.email, employeeData.department, employeeData.salary, employeeData.hireDate);
        employeeRepo.add(newEmployee);
    }
    saveToStorage();
    resetForm();
    renderTable(searchInput.value);
});
// ----------------------------------------
searchInput.addEventListener("input", () => {
    renderTable(searchInput.value);
});
// ----------------------------------------
loadFromStorage();
renderTable();
