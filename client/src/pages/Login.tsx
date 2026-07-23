// This file is for: Login page — unified role-based login gate for all 4 roles
// Module: Login Page (Module 13)
// Owner: Developer 2 (Web Frontend Engineer)
//
// What goes here:
// - Centered card with email/password inputs
// - Submit dispatches Redux loginUser thunk → POST /auth/login
// - On success: JWT stored, redirect to role-specific dashboard
//     admin → /admin/dashboard
//     client → /client/dashboard
//     driver → /driver/dashboard
//     executive → /executive/analytics
// - Error display via React Hot Toast
// - Demo credentials displayed for testing
// - Dark background (--color-primary-dark) with centered white card
