-- Fresh MySQL 8 schema for the Vercel application.
-- Import this into a new, empty database. Do not use the old demo dump for live votes.
-- No voter data, ballots, or default administrator credentials are included.

CREATE TABLE IF NOT EXISTS `ids` (
  `id_number` varchar(12) NOT NULL,
  `names` varchar(225) NOT NULL,
  `started` varchar(225) NOT NULL DEFAULT '',
  PRIMARY KEY (`id_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `voters` (
  `voters_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_number` varchar(12) NOT NULL,
  `firstname` varchar(100) NOT NULL,
  `lastname` varchar(100) NOT NULL,
  `gender` varchar(20) NOT NULL DEFAULT '',
  `prog_study` varchar(40) NOT NULL DEFAULT '',
  `year_level` varchar(40) NOT NULL DEFAULT '',
  `status` enum('Unvoted','Voted') NOT NULL DEFAULT 'Unvoted',
  `account` enum('Inactive','Active') NOT NULL DEFAULT 'Active',
  `date` date DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`voters_id`),
  UNIQUE KEY `uq_voters_id_number` (`id_number`),
  CONSTRAINT `fk_voter_eligible_id` FOREIGN KEY (`id_number`) REFERENCES `ids` (`id_number`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `candidate` (
  `candidate_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `position` varchar(100) NOT NULL,
  `firstname` varchar(100) NOT NULL,
  `lastname` varchar(100) NOT NULL,
  `year_level` varchar(100) NOT NULL DEFAULT '',
  `gender` varchar(20) NOT NULL DEFAULT '',
  `img` varchar(500) NOT NULL DEFAULT '',
  `party` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`candidate_id`),
  KEY `idx_candidate_position` (`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admin_users` (
  `admin_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `uq_admin_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `election_settings` (
  `id` tinyint unsigned NOT NULL,
  `is_open` tinyint(1) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_single_election_setting` CHECK (`id` = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `election_settings` (`id`, `is_open`) VALUES (1, 0)
ON DUPLICATE KEY UPDATE `id` = VALUES(`id`);

CREATE TABLE IF NOT EXISTS `votes` (
  `vote_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `candidate_id` bigint unsigned NOT NULL,
  `voters_id` bigint unsigned NOT NULL,
  `position` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`vote_id`),
  UNIQUE KEY `uq_voter_position` (`voters_id`, `position`),
  KEY `idx_votes_candidate` (`candidate_id`),
  CONSTRAINT `fk_vote_voter` FOREIGN KEY (`voters_id`) REFERENCES `voters` (`voters_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_vote_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidate` (`candidate_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
