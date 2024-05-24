/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const bcrypt = require('bcrypt');

exports.seed = async function (knex) {
  const seedData = {
    employee_name: 'Admin',
    email: 'admin@gmail.com',
    password: 'admin123',
    profile: 'https://res.cloudinary.com/dtzlrlxe8/image/upload/v1684392048/admin_profile_gvpba1.jpg',
    verified: true,
    position: 0,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const adminExists = await knex('employees')
    .where({'email': seedData.email, 'deleted_at': null})
    .first();

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(seedData.password, 10);
    await knex('employees').insert({
      employee_name: seedData.employee_name,
      email: seedData.email,
      password: hashedPassword,
      profile: seedData.profile,
      position: seedData.position,
      verified: seedData.verified,
      created_at: seedData.created_at,
      updated_at: seedData.updated_at,
    });
    console.log(`Admin user inserted successfully.`);
  } else {
    console.log(`Admin user already exists.`);
  }
};
