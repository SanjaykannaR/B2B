// This file is for: User Mongoose model — all 4 roles in one model
// Module: Database Models (Module 3)
// Owner: Developer 1 (Backend Engineer)
// Schema fields: firstName, lastName, email, password (bcrypt), role (admin|client|driver|executive),
//                phone, company, licenseNumber, contractRate, isActive
// Pre-save hook: bcrypt hash password (12 rounds)
// Instance method: comparePassword()
// Indexes: email, role, role+isActive
