/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable("employees", {
    employee_id: 'id',
    employee_name: { type: 'varchar', notNull: true },
    email: { type: 'varchar', notNull: true },
    password: { type: 'text', notNull: true },
    profile: { type: 'varchar(255)', notNull: true },
    position: { type: 'varchar(1)', notNull: true, check: "position IN ('0', '1')" },
    address: { type: 'varchar(255)' },
    dob: { type: 'date' },
    phone: { type: 'varchar' },
    verified: { type: 'boolean', notNull: true, default: false},
    created_at: { type: 'timestamp', notNull: true },
    updated_at: { type: 'timestamp', notNull: true },
    deleted_at: { type: 'timestamp' },
  });

  pgm.createTable("projects", {
    project_id: 'id',
    project_name: { type: 'varchar', notNull: true },
    language: { type: 'varchar', notNull: true },
    description: { type: 'varchar(255)' },
    start_date: { type: 'timestamp', notNull: true },
    end_date: { type: 'timestamp', notNull: true },
    created_at: { type: 'timestamp', notNull: true },
    updated_at: { type: 'timestamp', notNull: true },
    deleted_at: { type: 'timestamp' },
  });

  pgm.createTable("tasks", {
    task_id: 'id',
    project_id: { type: 'integer', notNull: true, references: '"projects"' },
    title: { type: 'varchar', notNull: true },
    description: { type: 'varchar(255)', notNull: true },
    assigned_member_id: { type: 'integer', notNull: true, references: '"employees"' },
    estimate_hr: { type: 'integer', notNull: true },
    actual_hr: { type: 'integer' },
    status: { type: 'varchar(1)', notNull: true, default: '0', check: "status IN ('0', '1', '2', '3')" },
    estimate_start_date: { type: 'timestamp' },
    estimate_finish_date: { type: 'timestamp' },
    actual_start_date: { type: 'timestamp' },
    actual_finish_date: { type: 'timestamp' },
    created_at: { type: 'timestamp', notNull: true },
    updated_at: { type: 'timestamp', notNull: true },
    deleted_at: { type: 'timestamp' },
  });

  pgm.createTable("reports", {
    report_id: 'id',
    task_id: { type: 'integer', notNull: true, references: '"tasks"' },
    task_title: { type: 'varchar' },
    project: { type: 'varchar' },
    percentage: { type: 'varchar' },
    type: { type: 'varchar' },
    status: { type: 'varchar' },
    hour: { type: 'varchar' },
    problem_feeling: { type: 'varchar' },
    report_to: { type: 'integer', notNull: true },
    reported_by: { type: 'integer', notNull: true },
    created_at: { type: 'timestamp', notNull: true },
    updated_at: { type: 'timestamp', notNull: true },
    deleted_at: { type: 'timestamp' },
  });

  pgm.createTable("tokens", {
    token_id: 'id',
    employee_id: { type: 'integer', notNull: true, references: '"employees"' },
    token: { type: 'varchar', notNull: true },
  })
};

exports.down = pgm => {
  pgm.dropTable("tokens", {});
  pgm.dropTable("reports", {});
  pgm.dropTable("tasks", {});
  pgm.dropTable("employees", {});
  pgm.dropTable("projects", {});
};
