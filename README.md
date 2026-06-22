# 🏠 RentShield Owner Dashboard

A modern House Rental Management System Owner Module built using React Native, Spring Boot, and MySQL.

---

## 📌 Project Overview

RentShield Owner Dashboard allows property owners to:

- Verify ownership documents
- Add and manage properties
- Handle appointments
- View reviews
- Receive notifications
- Monitor property analytics

---

## 🛠 Technology Stack

### Frontend
- React Native
- Expo SDK 56
- TypeScript
- Expo Router

### Backend
- Java 17
- Spring Boot 3.2.4
- Spring Data JPA
- Maven

### Database
- MySQL

---

## 📂 Project Structure

```text
owner-dashboard/
│
├── backend/
│   ├── src/
│   ├── pom.xml
│
├── owner_ui/
│   ├── src/
│   ├── assets/
│   ├── app/
│
└── README.md
```

---

## 🚀 Features

### Owner Verification Center
- Aadhaar Upload
- Property Tax Bill Upload
- Property Deed Upload
- Live Selfie Upload

### Property Management
- Add Property
- Edit Property
- Delete Property
- Property Listing

### Appointments
- View Appointments
- Update Status

### Reviews
- View Reviews
- Reply to Reviews

### Notifications
- Real-time Notification Management

### Analytics
- Occupancy Metrics
- Revenue Statistics
- Trust Score Monitoring

---

## 💾 Database

Database Name:

```sql
house_owner_db
```

Tables:

- owner
- property
- property_image
- verification
- appointment
- review
- notification

---

## ⚙️ Running the Project

### Backend

```bash
cd backend
mvn spring-boot:run
```

### Frontend

```bash
cd owner_ui
npm install
npm start
```

---
