# Subscribely

A subscription-based platform built with **Django (backend)** and **React + Vite (frontend)**.  

---

## 🚀 Live Preview

- **Backend (Render):** [https://subscribely.onrender.com/admin](https://subscribely.onrender.com/admin)  
- **Frontend (Netlify):** [https://subscribely.netlify.app/](https://subscribely.netlify.app/)  

> ⚠️ **Important Note:**  
> Please open the **backend URL first** and wait a few minutes until the server starts.  
> Since the backend is hosted on **Render free tier**, the service goes to sleep when inactive.  
> After the backend is active, you can use the frontend normally.

---

## 📥 Clone the Repository

```bash
git clone https://github.com/sureshnenavath/Subscribely.git
cd Subscribely
```

---

## 🛠️ Running the Project Locally

### 1. Backend (Django)

1. Navigate to the backend folder and create a virtual environment:

```powershell
cd backend
python -m venv venv
.
env\Scripts\Activate
```

2. Install dependencies and apply migrations:

```powershell
pip install -r requirements.txt
python manage.py migrate
```

3. (Optional) Load initial data and create a superuser:

```powershell
python manage.py loaddata fixtures/initial_data.json
python manage.py createsuperuser
```

4. Start the development server:

```powershell
python manage.py runserver 0.0.0.0:8000
```

Backend API base URL: [http://localhost:8000](http://localhost:8000)

---

### 2. Frontend (React + Vite)

1. Open a new terminal and navigate to the frontend folder:

```powershell
cd frontend
```

2. Install dependencies:

```powershell
npm install
```

3. Run the development server:

```powershell
npm run dev
```

Frontend default URL: [http://localhost:5173](http://localhost:5173)

When developing locally, make sure the backend (`http://localhost:8000`) is running so the frontend can connect.

---

## 📦 Build for Production

If you want to create an optimized build of the frontend:

```powershell
cd frontend
npm run build
```

This will generate a production-ready bundle inside the `dist` folder.

---

## 🧪 Key Features to Test

- **Authentication**: Login with `{ identifier, password }` (identifier can be email or username).  
- **Payments**: Payment objects returned by the backend include `razorpay_payment_id` which is displayed in the frontend UI.

---

## 📂 Repository Structure

```
Subscribely/
│── backend/      # Django REST API + Razorpay integration
│── frontend/     # React (Vite) single-page application
│── README.md     # Project documentation
```

---

## 👨‍💻 Author

**Nenavath Suresh** — [GitHub](https://github.com/sureshnenavath/Subscribely)
