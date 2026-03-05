CREATE DATABASE IF NOT EXISTS examhall_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE examhall_db;

CREATE TABLE IF NOT EXISTS developers (
  developer_id  INT           NOT NULL AUTO_INCREMENT,
  username      VARCHAR(80)   NOT NULL,
  password      VARCHAR(255)  NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (developer_id),
  UNIQUE KEY uq_dev_username (username)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admins (
  admin_id      INT           NOT NULL AUTO_INCREMENT,
  username      VARCHAR(80)   NOT NULL,
  password      VARCHAR(255)  NOT NULL,
  display_name  VARCHAR(120)  NOT NULL DEFAULT '',
  department    VARCHAR(120)  NOT NULL DEFAULT '',
  created_by    INT           NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (admin_id),
  UNIQUE KEY uq_admin_username (username),
  KEY idx_admin_created_by (created_by),
  CONSTRAINT fk_admin_developer
    FOREIGN KEY (created_by) REFERENCES developers(developer_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS staff (
  staff_id      INT           NOT NULL AUTO_INCREMENT,
  username      VARCHAR(80)   NOT NULL,
  password      VARCHAR(255)  NOT NULL,
  display_name  VARCHAR(120)  NOT NULL DEFAULT '',
  department    VARCHAR(120)  NOT NULL DEFAULT '',
  admin_id      INT           NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (staff_id),
  KEY idx_staff_username (username),
  KEY idx_staff_admin    (admin_id),
  CONSTRAINT fk_staff_admin
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS students (
  student_id    INT           NOT NULL AUTO_INCREMENT,
  roll_no       VARCHAR(30)   NOT NULL,
  name          VARCHAR(120)  NOT NULL DEFAULT '',
  branch        VARCHAR(20)   NOT NULL DEFAULT '',
  year          TINYINT       NOT NULL DEFAULT 1,
  class_name    VARCHAR(80)   NOT NULL DEFAULT '',
  phone         VARCHAR(20)   NOT NULL DEFAULT '',
  email         VARCHAR(120)  NOT NULL DEFAULT '',
  admin_id      INT           NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id),
  UNIQUE KEY uq_roll_admin  (roll_no, admin_id),
  KEY idx_student_branch    (branch),
  KEY idx_student_year      (year),
  KEY idx_student_admin     (admin_id),
  CONSTRAINT fk_student_admin
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS exam_halls (
  hall_id         INT                     NOT NULL AUTO_INCREMENT,
  hall_name       VARCHAR(120)            NOT NULL,
  room_no         VARCHAR(30)             NOT NULL DEFAULT '',
  floor_name      VARCHAR(40)             NOT NULL DEFAULT 'Ground Floor',
  bench_type      ENUM('single','double') NOT NULL DEFAULT 'double',
  row_count       TINYINT UNSIGNED        NOT NULL DEFAULT 6,
  col_count       TINYINT UNSIGNED        NOT NULL DEFAULT 5,
  missing_benches JSON                    NULL,
  capacity        SMALLINT                NOT NULL DEFAULT 0,
  admin_id        INT                     NOT NULL,
  created_at      DATETIME                NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (hall_id),
  KEY idx_hall_name  (hall_name),
  KEY idx_hall_admin (admin_id),
  CONSTRAINT fk_hall_admin
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ── Seed Data ─────────────────────────────────────────────────
INSERT INTO developers (username, password) VALUES ('dev', 'dev@123');

INSERT INTO admins (username, password, display_name, department, created_by)
VALUES ('admin', 'admin123', 'Default Admin', 'Examinations', 1);

INSERT INTO staff (username, password, display_name, department, admin_id)
VALUES ('staff', 'staff123', 'Default Staff', 'Examinations', 1);
