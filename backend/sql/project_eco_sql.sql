drop database if exists project_eco;

-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema project_eco
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema project_eco
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `project_eco` DEFAULT CHARACTER SET utf8 ;
USE `project_eco` ;

-- -----------------------------------------------------
-- Table `project_eco`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `project_eco`.`user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(45) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `nickname` VARCHAR(45) NOT NULL,
  `deletion` TINYINT NOT NULL DEFAULT 0,
  `limit_inventory` INT NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `project_eco`.`item`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `project_eco`.`item` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL DEFAULT 'no_name',
  `wear` VARCHAR(45) NOT NULL,
  `level` INT NOT NULL DEFAULT 1,
  `grade` INT NOT NULL DEFAULT 1,
  `limit_enchant` INT NOT NULL DEFAULT 3,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `project_eco`.`socket`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `project_eco`.`socket` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ip` VARCHAR(20) NOT NULL,
  `port` INT NOT NULL,
  `limits` INT NOT NULL DEFAULT 200,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `project_eco`.`inventory`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `project_eco`.`inventory` (
  `item_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `equiped` TINYINT NOT NULL DEFAULT 1,
  `is_lock` TINYINT NOT NULL DEFAULT 0,
  INDEX `fk_item_has_user_user1_idx` (`user_id` ASC) VISIBLE,
  INDEX `fk_item_has_user_item1_idx` (`item_id` ASC) VISIBLE,
  CONSTRAINT `fk_item_has_user_item1`
    FOREIGN KEY (`item_id`)
    REFERENCES `project_eco`.`item` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_item_has_user_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `project_eco`.`user` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `project_eco`.`chat`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `project_eco`.`chat` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `limits` INT NOT NULL DEFAULT 1,
  `scope` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `project_eco`.`server`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `project_eco`.`server` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `limits` INT NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `project_eco`.`channel`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `project_eco`.`channel` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `limits` INT NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `project_eco`.`enter`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `project_eco`.`enter` (
  `server_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `channel_id` INT NOT NULL,
  `type` VARCHAR(45) NOT NULL DEFAULT 'viewer',
  `status` TINYINT NOT NULL DEFAULT 1,
  INDEX `fk_server_has_user_user1_idx` (`user_id` ASC) VISIBLE,
  INDEX `fk_server_has_user_server1_idx` (`server_id` ASC) VISIBLE,
  INDEX `fk_enter_channel_id1_idx` (`channel_id` ASC) VISIBLE,
  CONSTRAINT `fk_server_has_user_server1`
    FOREIGN KEY (`server_id`)
    REFERENCES `project_eco`.`server` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_server_has_user_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `project_eco`.`user` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_enter_channel_id1`
    FOREIGN KEY (`channel_id`)
    REFERENCES `project_eco`.`channel` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `project_eco`.`connection`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `project_eco`.`connection` (
  `socket_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `locale` VARCHAR(100) NOT NULL,
  `connected` TINYINT NOT NULL DEFAULT 1,
  INDEX `fk_socket_has_user_user1_idx` (`user_id` ASC) VISIBLE,
  INDEX `fk_socket_has_user_socket1_idx` (`socket_id` ASC) VISIBLE,
  CONSTRAINT `fk_socket_has_user_socket1`
    FOREIGN KEY (`socket_id`)
    REFERENCES `project_eco`.`socket` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_socket_has_user_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `project_eco`.`user` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `project_eco`.`join_chat`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `project_eco`.`join_chat` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `chat_id` INT NOT NULL,
  `message` TEXT NOT NULL,
  `from` VARCHAR(100) NOT NULL,
  `to` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `fk_user_has_chat_chat1_idx` (`chat_id` ASC) VISIBLE,
  INDEX `fk_user_has_chat_user1_idx` (`user_id` ASC) VISIBLE,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_user_has_chat_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `project_eco`.`user` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_user_has_chat_chat1`
    FOREIGN KEY (`chat_id`)
    REFERENCES `project_eco`.`chat` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `project_eco`.`likes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `project_eco`.`likes` (
  `join_chat_id` INT NOT NULL,
  `points` INT NOT NULL DEFAULT 0,
  `type` VARCHAR(45) NOT NULL,
  INDEX `fk_likes_join_chat1_idx` (`join_chat_id` ASC) VISIBLE,
  CONSTRAINT `fk_likes_join_chat1`
    FOREIGN KEY (`join_chat_id`)
    REFERENCES `project_eco`.`join_chat` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `project_eco`.`location`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `project_eco`.`location` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `server_id` INT NOT NULL,
  `channel_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `pox` FLOAT NOT NULL,
  `poy` FLOAT NOT NULL,
  `poz` FLOAT NOT NULL,
  `roy` FLOAT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_location_enter1_idx` (`server_id` ASC) VISIBLE,
  INDEX `fk_location_enter2_idx` (`channel_id` ASC) VISIBLE,
  INDEX `fk_location_enter3_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_location_enter1`
    FOREIGN KEY (`server_id`)
    REFERENCES `project_eco`.`enter` (`server_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_location_enter2`
    FOREIGN KEY (`channel_id`)
    REFERENCES `project_eco`.`enter` (`channel_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_location_enter3`
    FOREIGN KEY (`user_id`)
    REFERENCES `project_eco`.`enter` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;


use project_eco;
select `auto_increment` from information_schema.tables where table_schema = 'project_eco' and table_name = 'user';
show table status where name = 'user';

SELECT 
    *,
    COUNT(DISTINCT (channel_id)) AS channel_count,
    COUNT(*) AS user_count
FROM
    enter
GROUP BY server_id;

SELECT 
    IF((SELECT 
                COUNT(channel_id)
            FROM
                enter) < (SELECT 
                limits
            FROM
                channel),
        TRUE,
        FALSE);
        
select * from channel where limits > (select count(*) from enter group by channel_id);

select id from channel where limits = all(
SELECT 
    count(*)
FROM
    enter
        LEFT JOIN
    channel ON enter.channel_id = channel.id
WHERE
    channel.limits
GROUP BY channel_id);


select * from channel;
SELECT 
    server_id,
    channel_id,
    COUNT(DISTINCT (channel_id)) AS channel_count,
    COUNT(*) AS user_count
FROM
    enter
        LEFT JOIN
    channel ON enter.channel_id = channel.id
        LEFT JOIN
    server ON enter.server_id = server.id
WHERE
    channel.limits > ANY (SELECT 
            COUNT(*)
        FROM
            enter
        GROUP BY channel_id)
    and server.limits > any (select count(*) from enter group by server_id)
GROUP BY server_id , channel_id;

SELECT 
    id
FROM
    channel
WHERE
    limits = ALL (SELECT 
            COUNT(*)
        FROM
            enter
                LEFT JOIN
            channel ON enter.channel_id = channel.id
        WHERE
            channel.limits
        GROUP BY channel_id);
        
        
SELECT 
    server_id, channel_id, COUNT(*) AS user_count
FROM
    enter
    left join channel
    on enter.channel_id = channel.id
GROUP BY channel_id
HAVING COUNT(*) < any(select limits from channel);

desc user;
desc channel;


select * from server;
select * from channel;
select * from enter;
select * from user;

desc enter;

select count(*) from enter;
select * from server;

# 여유 서버
SELECT 
    server_id,
    channel_id,
    COUNT(DISTINCT (channel_id)) AS channel_count,
    COUNT(*) AS user_count
FROM
    enter
        LEFT JOIN
    server ON enter.server_id = server.id
        LEFT JOIN
    channel ON enter.channel_id = channel.id
        LEFT JOIN
    user ON enter.user_id = user.id
GROUP BY server_id, channel_id
HAVING COUNT(DISTINCT (channel_id)) < ANY (SELECT 
        limits
    FROM
        server)
    AND COUNT(*) < ANY (SELECT 
        limits
    FROM
        channel);
select * from server;
select * from channel;
select * from enter;
select * from user;

SELECT 
    server_id,
    channel_id,
    COUNT(DISTINCT (channel_id)) AS channel_count,
    COUNT(user_id) AS user_count
FROM
    enter
GROUP BY server_id
HAVING COUNT(DISTINCT (channel_id)) < ANY (SELECT 
        limits
    FROM
        server)
    OR COUNT(user_id) < ANY (SELECT 
        limits
    FROM
        channel);
        
SELECT 
    channel_id, COUNT(*)
FROM
    enter
GROUP BY server_id
HAVING COUNT(*) < ANY (SELECT 
        limits
    FROM
        channel);

SELECT 
    channel_id, channel.limits, COUNT(*) AS user_count
FROM
    enter
        LEFT JOIN
    channel ON channel.id = enter.channel_id
GROUP BY channel_id;
        
SELECT 
      server_id,
      channel_id,
      server.limits,
      channel.limits AS channel_limits,
      COUNT(DISTINCT (channel_id)) AS channel_count,
      COUNT(user_id) AS user_count
    FROM
      enter
        LEFT JOIN
      server ON server.id = enter.server_id
        LEFT JOIN
      channel ON channel.id = enter.channel_id
    GROUP BY server_id;
    
SELECT 
      socket_id, socket.limits, COUNT(*) AS user_count
    FROM
      connection
        LEFT JOIN
      socket ON socket.id = connection.socket_id
    GROUP BY socket_id;
    
    desc socket;
    
    select * from enter;
    select * from connection;