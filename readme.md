# 🏛️ Nagrik Setu Backend

The **Nagrik Setu Backend** powers the entire Nagrik Setu ecosystem — including the Citizen App and the Admin Dashboard.  
It provides secure APIs for user authentication, complaint reporting, email notifications, and admin management.

This backend ensures smooth communication between citizens reporting issues and administrators handling those reports, forming a fast, transparent, and scalable civic problem-solving system.

---

## 📑 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Setup Instructions](#setup-instructions)
- [Admin Dashboard Integration](#admin-dashboard-integration)
- [Citizen App Integration](#citizen-app-integration)
- [Future Enhancements](#future-enhancements)
- [Contributions](#contributions)

---

## 🔍 Overview
The Nagrik Setu Backend acts as the core engine behind all user operations and admin functionalities.  
It handles data flow between:

- 📱 Citizens (raising issues)  
- 🗂️ Admin authorities (reviewing + resolving)  
- 💾 Central database  
- ✉️ Email services  

It ensures high performance, security, and reliability while maintaining a clean API structure shared across multiple platforms.

---

## ⭐ Key Features

### 🔐 Authentication & Authorization
- Secure user login/register  
- JWT-based authentication  
- Password hashing  
- Protected admin-level APIs  

### 📝 Complaint Management
- Citizens can submit issues with:
  - Photo (uploaded to Cloudinary)
  - Description
  - Location
- Admins can:
  - View complaints
  - Update status (Filed → In Progress → Resolved)
  - Manage categories

### ✉️ Email Notifications
- Email alerts for signup, verification, or status updates  
- Uses **Resend API** for reliability

### 💾 Centralized Data Handling
- Shared data for:
  - Users  
  - Complaints  
  - Admins  
  - Status history  

### 🧩 Modular Architecture
- Clean controllers  
- Organized utilities  
- Dedicated email templates  
- Easy to scale and maintain  

---

## 🧰 Tech Stack

### **Backend Server**
- Node.js  
- Express.js  

### **Database**
- MongoDB (Mongoose ORM)

### **File Uploads**
- Multer  
- Cloudinary  

### **Authentication**
- JWT  
- bcrypt (password hashing)

### **Emailing**
- Resend API

### **Other Tools**
- dotenv  
- Nodemon (for development)

---

## 🔄 How It Works

1. **Citizen submits an issue** via the mobile/web app  
   → Photo, description, location sent to backend  

2. **Backend validates & stores the report**  
   → Saves complaint in DB  
   → Uploads image to Cloudinary  
   → Sends response back  

3. **Admin Dashboard fetches complaints**  
   → Displays all issues  
   → Allows action updates  

4. **Admin updates status**  
   → Backend updates DB  
   → Citizen gets latest status  

5. **Citizens track all updates in real time**  
   → Ensures transparency and faster resolution  

The backend acts as a secure bridge between users and authorities.

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/NJayantRao/Nagrik_Setu_Backend.git
cd Nagrik_Setu_Backend
npm install
npm run dev
