# Clinic BS Khang - Pediatric Clinic Management System

## Overview

Clinic BS Khang is a comprehensive pediatric clinic management system built for Vietnamese healthcare providers. The application provides a complete solution for managing patients, appointments, medical records, staff, and billing operations specifically tailored for pediatric care. The system includes multilingual support (Vietnamese) and is designed to streamline clinic operations while maintaining detailed patient records and ensuring efficient appointment scheduling.

## Recent Changes (August 20, 2025)

- ✅ **Layout Optimization**: Removed sticky header, moved title directly under navigation tabs
- ✅ **Space Efficiency**: Eliminated TiepTan component from "DS Chờ" tab to reduce vertical whitespace
- ✅ **Dialog State Management**: Simplified dialog state logic with improved local state management
- ✅ **Console Debugging**: Added comprehensive console logs for dialog state debugging
- ✅ **Mobile UI Improvements**: Title "Danh Sách Chờ Khám" positioned immediately under tabs
- ✅ **Code Cleanup**: Removed problematic Pinia integration, reverted to stable local state
- ✅ **Responsive Design**: Optimized mobile layout for maximum screen utilization

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Vue.js 3 with Composition API for reactive user interfaces
- **State Management**: Pinia for centralized application state management
- **Routing**: Vue Router 4 for client-side navigation with authentication guards
- **Styling**: Tailwind CSS 4 with custom medical-themed color palette and responsive design
- **Build Tool**: Vite for fast development and optimized production builds
- **Icons**: Feather Icons for consistent UI iconography

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API server
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Security**: Helmet for security headers, CORS for cross-origin requests, and rate limiting
- **Middleware**: Express middleware for compression, authentication, and request parsing

### Database Design
- **Schema**: PostgreSQL with UUID primary keys using CUID2 for better performance
- **Core Entities**: 
  - Users (authentication and role management)
  - Patients (pediatric patient records with parent information)
  - Staff (doctors, nurses, receptionists with specializations)
  - Appointments (scheduling with status tracking)
  - Medical Records (examination details, diagnosis, treatment)
  - Billing (invoices with line items and payment tracking)
- **Relationships**: Proper foreign key relationships between entities for data integrity

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with configurable expiration
- **Role-Based Access**: Multi-role system (admin, doctor, nurse, receptionist, staff)
- **Security Features**: Password hashing, rate limiting on auth endpoints, token validation middleware

### API Architecture
- **RESTful Design**: Consistent endpoint patterns with proper HTTP methods
- **Error Handling**: Centralized error responses with Vietnamese localization
- **Pagination**: Built-in pagination support for large datasets
- **Filtering**: Advanced filtering capabilities for search and data retrieval
- **Validation**: Input validation and sanitization for data integrity

## External Dependencies

### Database
- **PostgreSQL**: Primary database with UUID support and ACID compliance
- **Environment Variable**: DATABASE_URL for connection string configuration

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility

### Frontend Libraries
- **Axios**: HTTP client for API communication with interceptors
- **Feather Icons**: SVG icon library for UI components

### Backend Security & Performance
- **bcrypt**: Password hashing with configurable salt rounds
- **jsonwebtoken**: JWT token generation and verification
- **helmet**: Security headers middleware
- **compression**: Gzip compression for response optimization
- **express-rate-limit**: API rate limiting to prevent abuse
- **cors**: Cross-origin resource sharing configuration

### Utilities
- **@paralleldrive/cuid2**: Collision-resistant unique identifier generation
- **dotenv**: Environment variable management for configuration