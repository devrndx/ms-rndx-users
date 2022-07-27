/* Replace with your SQL commands */
CREATE TABLE `ddaytime` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(36) NOT NULL DEFAULT '',
    `destTime` datetime NOT NULL,
    `sTimerType` varchar(100) NOT NULL DEFAULT '',
    `sTimerStatus` varchar(100) NOT NULL DEFAULT '',
    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;