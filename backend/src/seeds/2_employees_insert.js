/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const bcrypt = require('bcrypt');

exports.seed = async function (knex) {
  const seedData = [
    {
      employee_name: 'Ye Thiha',
      email: 'scm.yth.yethiha@gmail.com',
      password: 'password1234',
      profile: 'https://res.cloudinary.com/dtzlrlxe8/image/upload/v1684392048/admin_profile_gvpba1.jpg',
      verified: true,
      position: 0,
      address: 'Yangon',
      dob: '1998-01-01',
      phone: '09123456789',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      employee_name: 'Phyo Thiha Kyaw',
      email: 'scm.phyothihakyaw@gmail.com',
      password: 'password1234',
      profile: 'https://res.cloudinary.com/dtzlrlxe8/image/upload/v1684392048/admin_profile_gvpba1.jpg',
      verified: true,
      position: 0,
      address: 'Yangon',
      dob: '1998-01-01',
      phone: '09123456789',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      employee_name: 'Nyan Lin Htoo',
      email: 'scm.nyanlinnhtoo@gmail.com',
      password: 'password1234',
      profile: 'https://res.cloudinary.com/dtzlrlxe8/image/upload/v1684392048/admin_profile_gvpba1.jpg',
      verified: true,
      position: 0,
      address: 'Yangon',
      dob: '1998-01-01',
      phone: '09123456789',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      employee_name: 'client01',
      email: 'client01@gmail.com',
      password: 'password1234',
      profile: 'https://res.cloudinary.com/dtzlrlxe8/image/upload/v1684202136/default_profile_bdiywh.webp',
      verified: true,
      position: 1,
      address: 'Yangon',
      dob: '1998-01-01',
      phone: '09123456789',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      employee_name: 'client02',
      email: 'client02@gmail.com',
      password: 'password1234',
      profile: 'https://res.cloudinary.com/dtzlrlxe8/image/upload/v1684202136/default_profile_bdiywh.webp',
      verified: true,
      position: 1,
      address: 'Yangon',
      dob: '1998-01-01',
      phone: '09123456789',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      employee_name: 'client03',
      email: 'client03@gmail.com',
      password: 'password1234',
      profile: 'https://res.cloudinary.com/dtzlrlxe8/image/upload/v1684202136/default_profile_bdiywh.webp',
      verified: true,
      position: 1,
      address: 'Yangon',
      dob: '1998-01-01',
      phone: '09123456789',
      created_at: new Date(),
      updated_at: new Date(),
    }
  ];
  for (let i = 0; i < seedData.length; i++) {
    const hashedPassword = await bcrypt.hash(seedData[i].password, 10);
    await knex('employees').insert({
      employee_name: seedData[i].employee_name,
      email: seedData[i].email,
      password: hashedPassword,
      profile: seedData[i].profile,
      position: seedData[i].position,
      address: seedData[i].address,
      dob: seedData[i].dob,
      phone: seedData[i].phone,
      verified: seedData[i].verified,
      created_at: seedData[i].created_at,
      updated_at: seedData[i].updated_at,
    });
  }
  console.log(`User inserted successfully.`);
};
