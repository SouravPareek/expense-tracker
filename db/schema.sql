-- AI Expense Tracker: MySQL 8.0.16+ (CHECK constraints are enforced from this version)

CREATE DATABASE IF NOT EXISTS expense_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
USE expense_tracker;

-- users
CREATE TABLE users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- categories (owner = user; the system user (id 1) owns the global ones)
CREATE TABLE categories (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED NOT NULL,
  name       VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_user_name (user_id, name),
  CONSTRAINT fk_categories_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- expenses
CREATE TABLE expenses (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id        INT UNSIGNED NOT NULL,
  category_id    INT UNSIGNED NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  description    VARCHAR(255) NOT NULL,
  expense_date   DATE NOT NULL,
  payment_method ENUM('cash','upi','card','netbanking','other') NOT NULL DEFAULT 'other',
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_expenses_user_date (user_id, expense_date),
  KEY idx_expenses_user_cat_date (user_id, category_id, expense_date),
  CONSTRAINT chk_expenses_amount CHECK (amount > 0),
  CONSTRAINT fk_expenses_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_expenses_category
    FOREIGN KEY (category_id) REFERENCES categories (id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

-- budgets (one row per user + category + month; budget_month is always the 1st)
CREATE TABLE budgets (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED NOT NULL,
  category_id   INT UNSIGNED NOT NULL,
  monthly_limit DECIMAL(10,2) NOT NULL,
  budget_month  DATE NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_budgets_user_cat_month (user_id, category_id, budget_month),
  CONSTRAINT chk_budgets_limit CHECK (monthly_limit > 0),
  CONSTRAINT chk_budgets_month CHECK (DAY(budget_month) = 1),
  CONSTRAINT fk_budgets_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_budgets_category
    FOREIGN KEY (category_id) REFERENCES categories (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ai_query_log
CREATE TABLE ai_query_log (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED NOT NULL,
  question      TEXT NOT NULL,
  generated_sql TEXT NULL,
  status        ENUM('success','rejected','error') NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ai_log_user_created (user_id, created_at),
  CONSTRAINT fk_ai_log_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- seed data: the system user must be created first with id 1
INSERT INTO users (id, name, email, password_hash)
VALUES (1, 'System', 'system@internal.invalid', '!');

INSERT INTO categories (user_id, name) VALUES
  (1, 'Food'),
  (1, 'Health'),
  (1, 'Grocery'),
  (1, 'Entertainment'),
  (1, 'Travel'),
  (1, 'Uncategorized');
