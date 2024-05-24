/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */

exports.seed = async function (knex) {
  const seedData = [
    {
      task_id: 1,
      task_title: 'Task 01',
      project: 'Project01',
      percentage: 100,
      type: 'CD',
      status: 'Open',
      hour: 8,
      problem_feeling: 'nothing',
      report_to: 2,
      reported_by: 5,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      task_id: 2,
      task_title: 'Task 02',
      project: 'Project01',
      percentage: 100,
      type: 'CD',
      status: 'Open',
      hour: 8,
      problem_feeling: 'nothing',
      report_to: 3,
      reported_by: 5,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      task_id: 2,
      task_title: 'Task 02',
      project: 'Project01',
      percentage: 100,
      type: 'CD',
      status: 'Open',
      hour: 8,
      problem_feeling: 'nothing',
      report_to: 3,
      reported_by: 6,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      task_id: 3,
      task_title: 'Task 03',
      project: 'Project02',
      percentage: 100,
      type: 'CD',
      status: 'Open',
      hour: 8,
      problem_feeling: 'nothing',
      report_to: 4,
      reported_by: 6,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      task_id: 3,
      task_title: 'Task 03',
      project: 'Project02',
      percentage: 100,
      type: 'CD',
      status: 'Open',
      hour: 8,
      problem_feeling: 'nothing',
      report_to: 4,
      reported_by: 7,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      task_id: 3,
      task_title: 'Task 03',
      project: 'Project02',
      percentage: 100,
      type: 'CD',
      status: 'Open',
      hour: 8,
      problem_feeling: 'nothing',
      report_to: 1,
      reported_by: 7,
      created_at: new Date(),
      updated_at: new Date(),
    }
  ];
  for (let i = 0; i < seedData.length; i++) {
    await knex('reports').insert({
      task_id: seedData[i].task_id,
      task_title: seedData[i].task_title,
      project: seedData[i].project,
      percentage: seedData[i].percentage,
      type: seedData[i].type,
      status: seedData[i].status,
      hour: seedData[i].hour,
      problem_feeling: seedData[i].problem_feeling,
      report_to: seedData[i].report_to,
      reported_by: seedData[i].reported_by,
      created_at: seedData[i].created_at,
      updated_at: seedData[i].updated_at,
    });
  }
  console.log(`Reports inserted successfully.`);

};

