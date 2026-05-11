# Book Ducks

Book Ducks is a full-stack web application for managing, browsing, rating, and saving books. The project is built with a Strapi backend and a vanilla JavaScript frontend.

Users can register, log in, browse books, rate them, and save them to a personal reading list. Admin users have additional access to create new books directly from the web interface.

---

## Features

### Authentication
- User registration and login using Strapi authentication
- JWT-based session handling stored in `localStorage`
- Logged-in user state persists across page reloads

### Books
- Display all books from Strapi API
- Show book details (title, author, pages, release date)
- Average rating calculation based on user ratings
- Upload and display book cover images (Strapi Media Library)

### Rating System
- Users can rate books (1–10 scale)
- Ratings are stored per user
- Average rating is automatically calculated and displayed

### Reading List
- Users can save books to a personal reading list
- Remove books from reading list
- Data is connected to the authenticated user

### Admin Panel
- Admin users can create new books
- Upload book images via Strapi Upload API
- Form-based interface inside the frontend

### Profile Page
- View saved reading list
- View rated books
- Sort books by title, author, or rating

---

## Tech Stack

### Frontend
- HTML5
- CSS3 (custom styling)
- JavaScript (Vanilla JS)
- Axios (API requests)

### Backend
- Strapi CMS
- REST API
- Authentication plugin (Users & Permissions)
- Media Library (image uploads)

---

## User Roles

- **Regular User**
  - Browse books
  - Rate books
  - Save books to reading list

- **Admin User**
  - All user permissions
  - Access to Admin Panel
  - Create new books
  - Upload book images

---

## Setup Instructions

### 1. Backend (Strapi)
- Install and run Strapi
- Enable Users & Permissions plugin
- Create `Book` content type:
  - title (string)
  - author (string)
  - pages (number)
  - release_date (date)
  - image (media)
- Create `Rating` content type:
  - rating (number)
  - relation to user
  - relation to book
- Enable permissions for authenticated users

### 2. Frontend
- Open `index.html` in browser or use Live Server
- Ensure Strapi runs on: http://localhost:1337/admin

---

## Created by

Ariam Goitom