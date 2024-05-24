/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */

exports.seed = async function (knex) {
  const seedData = [
    {
      project_name: 'Project01',
      language: 'React',
      description: "This is description",
      start_date: '2023-05-08',
      end_date: '2023-05-31',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      project_name: 'Project02',
      language: 'Angular',
      description: "This is description",
      start_date: '2023-05-08',
      end_date: '2023-05-31',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      project_name: 'Project03',
      language: 'Nodejs',
      description: "This is description",
      start_date: '2023-05-08',
      end_date: '2023-05-31',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      project_name: 'Project04',
      language: 'Nextjs',
      description: "This is description",
      start_date: '2023-05-08',
      end_date: '2023-05-31',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      project_name: 'Project05',
      language: 'PHP',
      description: "This is description",
      start_date: '2023-05-08',
      end_date: '2023-05-31',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      project_name: 'Project06',
      language: 'Database',
      description: "This is description",
      start_date: '2023-05-08',
      end_date: '2023-05-31',
      created_at: new Date(),
      updated_at: new Date(),
    }
  ];
  for (let i = 0; i < seedData.length; i++) {
    await knex('projects').insert({
      project_name: seedData[i].project_name,
      language: seedData[i].language,
      description: seedData[i].description,
      start_date: seedData[i].start_date,
      end_date: seedData[i].end_date,
      created_at: seedData[i].created_at,
      updated_at: seedData[i].updated_at,
    });
  }
  console.log(`Projects inserted successfully.`);

};
