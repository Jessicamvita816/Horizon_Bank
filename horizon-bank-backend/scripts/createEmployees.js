// server/scripts/createEmployees.js
const { db, auth } = require('../config/firebase');
const { hashPassword } = require('../utils/password');

async function createEmployees() {
  const employees = [
    {
      fullName: 'Employee One',
      accountNumber: 'EMP001',
      email: 'emp1@horizonbank.com',
      password: 'SecureEmp1@123!',
      isAdmin: true,
    },
    {
      fullName: 'Employee Two',
      accountNumber: 'EMP002',
      email: 'emp2@horizonbank.com',
      password: 'SecureEmp2@123!',
      isAdmin: true,
    },
  ];

  for (const emp of employees) {
    try {
      // Skip if already exists
      const exists = await db
        .collection('users')
        .where('accountNumber', '==', emp.accountNumber)
        .get();
      if (!exists.empty) {
        console.log(`${emp.accountNumber} already exists – skipping`);
        continue;
      }

      // Create Firebase Auth user
      const userRecord = await auth.createUser({
        email: emp.email,
        password: emp.password,
        displayName: emp.fullName,
      });

      // Hash password with pepper
      const passwordHash = await hashPassword(emp.password);

      // Save to Firestore
      await db.collection('users').doc(userRecord.uid).set({
        fullName: emp.fullName,
        accountNumber: emp.accountNumber,
        email: emp.email,
        passwordHash,
        isAdmin: emp.isAdmin,
        createdAt: new Date().toISOString(),
      });

      console.log(`Created ${emp.fullName} (${emp.accountNumber})`);
    } catch (err) {
      console.error(`Failed ${emp.fullName}:`, err.message);
    }
  }
  console.log('\nLogin with:\nEMP001 / SecureEmp1@123!\nEMP002 / SecureEmp2@123!\n');
}

createEmployees().catch(console.error);