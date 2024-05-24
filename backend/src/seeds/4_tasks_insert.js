/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */

exports.seed = async function (knex) {
  const seedData = [
    {
      project_id: 1,
      title: 'Task 01',
      description: 'This is task 01',
      assigned_member_id: 5,
      estimate_hr: 3,
      actual_hr: 4,
      status: '0',
      estimate_start_date: "2023-05-08",
      estimate_finish_date: "2023-05-31",
      actual_start_date: "2023-05-08",
      actual_finish_date: "2023-05-31",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      project_id: 1,
      title: 'Task 02',
      description: 'This is task 02',
      assigned_member_id: 5,
      estimate_hr: 3,
      actual_hr: 4,
      status: '0',
      estimate_start_date: "2023-05-08",
      estimate_finish_date: "2023-05-31",
      actual_start_date: "2023-05-08",
      actual_finish_date: "2023-05-31",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      project_id: 2,
      title: 'Task 03',
      description: 'This is task 03',
      assigned_member_id: 6,
      estimate_hr: 18,
      actual_hr: 4,
      status: '0',
      estimate_start_date: "2023-05-08",
      estimate_finish_date: "2023-05-31",
      actual_start_date: "2023-05-08",
      actual_finish_date: "2023-05-31",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      project_id: 2,
      title: 'Task 04',
      description: 'This is task 04',
      assigned_member_id: 6,
      estimate_hr: 5,
      actual_hr: 4,
      status: '0',
      estimate_start_date: "2023-05-08",
      estimate_finish_date: "2023-05-31",
      actual_start_date: "2023-05-08",
      actual_finish_date: "2023-05-31",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      project_id: 3,
      title: 'Task 05',
      description: 'This is task 05',
      assigned_member_id: 7,
      estimate_hr: 6,
      actual_hr: 4,
      status: '0',
      estimate_start_date: "2023-05-08",
      estimate_finish_date: "2023-05-31",
      actual_start_date: "2023-05-08",
      actual_finish_date: "2023-05-31",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      project_id: 3,
      title: 'Task 06',
      description: 'This is task 06',
      assigned_member_id: 7,
      estimate_hr: 6,
      actual_hr: 4,
      status: '0',
      estimate_start_date: "2023-05-08",
      estimate_finish_date: "2023-05-31",
      actual_start_date: "2023-05-08",
      actual_finish_date: "2023-05-31",
      created_at: new Date(),
      updated_at: new Date(),
    }
  ];
  for (let i = 0; i < seedData.length; i++) {
    await knex('tasks').insert({
      project_id: seedData[i].project_id,
      title: seedData[i].title,
      description: seedData[i].description,
      assigned_member_id: seedData[i].assigned_member_id,
      estimate_hr: seedData[i].estimate_hr,
      actual_hr: seedData[i].actual_hr,
      status: seedData[i].status,
      estimate_start_date: seedData[i].estimate_start_date,
      estimate_finish_date: seedData[i].estimate_finish_date,
      actual_start_date: seedData[i].actual_start_date,
      actual_finish_date: seedData[i].actual_finish_date,
      created_at: seedData[i].created_at,
      updated_at: seedData[i].updated_at,
    });
  }
  console.log(`Tasks inserted successfully.`);

};


