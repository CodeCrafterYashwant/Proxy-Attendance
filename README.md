# 🎓 Proxy Attendance System

![GitHub repo size](https://img.shields.io/github/repo-size/CodeCrafterYashwant/Proxy-Attendance?style=for-the-badge&color=blue)
![GitHub last commit](https://img.shields.io/github/last-commit/CodeCrafterYashwant/Proxy-Attendance?style=for-the-badge&color=green)
![License](https://img.shields.io/github/license/CodeCrafterYashwant/Proxy-Attendance?style=for-the-badge&color=yellow)

An intelligent, automated solution designed to modernize the way attendance is recorded and managed. This system aims to reduce manual paperwork and minimize the possibility of **proxy entries** through secure digital verification.

---

## 🌟 Key Features

* **Secure Authentication:** Role-based access control for Administrators, Teachers, and Students.
* **Real-time Tracking:** Instant database synchronization when attendance is marked.
* **Proxy Prevention:** Verification logic to ensure the integrity of every entry.
* **Automated Analytics:** Visualizes attendance trends with weekly and monthly percentage reports.
* **User-Friendly Dashboard:** A clean, responsive interface for managing records on any device.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** |HTML5, CSS3, JavaScript (Vanilla) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (NoSQL) |
| **Security** | JSON Web Tokens (JWT) & Bcrypt Encryption |

---

## 📈 System Workflow



1.  **Login:** User authenticates via the secure portal.
2.  **Session Creation:** Teacher initiates an attendance session for a specific subject/class.
3.  **Submission:** Students mark their presence (validated via unique session tokens).
4.  **Verification:** The system checks for duplicate entries or unauthorized attempts.
5.  **Report:** Data is stored and made available for analytical reporting.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

* **Node.js** (v14 or higher)
* **npm** or **yarn**
* **MongoDB** (Local instance or Atlas Cluster)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/CodeCrafterYashwant/Proxy-Attendance.git](https://github.com/CodeCrafterYashwant/Proxy-Attendance.git)
    cd Proxy-Attendance
    ```

2.  **Install Dependencies:**
    ```bash
    # Install backend dependencies
    npm install

    # Install frontend dependencies
    cd client
    npm install
    cd ..
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_url
    JWT_SECRET=your_jwt_secret_key
    ```

4.  **Run the Application:**
    ```bash
    # Run both client and server (if using concurrently)
    npm run dev
    ```

---

## 📂 Project Structure

```text
├── client/             # React.js Frontend
├── server/             # Node.js API
│   ├── models/         # MongoDB Schemas (User, Attendance, Class)
│   ├── controllers/    # Business Logic & Request Handlers
│   ├── routes/         # Express API Endpoints
│   └── middleware/     # Auth (JWT) & Error Handling
└── README.md

###Contributing
Contributions make the open-source community an amazing place to learn and create.

###Fork the Project.

Create your Feature Branch (git checkout -b feature/AmazingFeature).

Commit your Changes (git commit -m 'Add some AmazingFeature').

Push to the Branch (git push origin feature/AmazingFeature).

Open a Pull Request.

👤 Author
Yashwant

GitHub: @CodeCrafterYashwant



📄 License
Distributed under the MIT License. See LICENSE for more information.
