## SIMP Laboratory System

SIMP Laboratory System is a laboratory management platform used to support practicum activities such as attendance tracking, grading management, integrated learning modules, and complaint handling between students and teaching assistants.

The application was developed using Next.js for the frontend, Express.js for the backend, and MySQL as the database system. The project also includes an automatic grading feature integrated with a Machine Learning Transformer model.

---

## Backend Responsibilities

In this project, I mainly focused on backend development, especially on authentication, attendance management, grading workflows, and role-based access control.

I implemented the authentication system and access management for 3 different roles:
- Admin
- Student
- Teaching Assistant

Each role has different privileges inside the system. Admin can manage accounts and practicum data, while students and teaching assistants can access attendance and grading pages with different levels of access. Students can only view their attendance and grading history, while teaching assistants are able to perform CRUD operations on attendance and grading data.

I also worked on the complaint feature, which allows students to submit complaints when there is incorrect attendance or grading data. The feature was designed as a two-way workflow, where teaching assistants can confirm submitted complaints and students can later view the complaint status directly from the system.

Besides implementing backend logic and API integration, I also handled data validation and database relation workflows to ensure the application behaves correctly between different user roles and features.

---

## Testing & Code Quality

Before deployment, the application and model went through several testing and quality assurance processes.

### Application Testing
Testing scenarios and workflow validation were performed using Katalon Studio to ensure the main features worked properly from the user side.

### Code Quality Analysis
Code quality analysis was performed using SonarQube to improve:
- Security
- Code maintainability
- Duplicate code detection
- Overall backend quality

---

## Tech Stack

### Frontend
- Next.js

### Backend
- Node.js
- Express.js

### Database
- MySQL

### Testing Tools
- Katalon Studio
- SonarQube

---

## Screenshots

### Attendance Dashboard
<img width="709" height="333" alt="image" src="https://github.com/user-attachments/assets/4b74df35-aa8a-4661-8430-bd7321bf0eac" />


### Grading System
<img width="591" height="281" alt="image" src="https://github.com/user-attachments/assets/ff2b03ea-ff6b-4d44-9b95-1911c7072848" />


### Management Role & Practicum
<img width="709" height="334" alt="image" src="https://github.com/user-attachments/assets/e79ea2c4-d69d-4218-9dc8-0d32e70e58a3" />



---

## API Documentation

🔗 [View Postman Collection](https://github.com/shintanr/simp-tugas-akhir/blob/main/support/postman/si_manajemen_praktikum.postman_collection.json)

---
