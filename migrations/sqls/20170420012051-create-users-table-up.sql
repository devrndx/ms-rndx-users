CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) NOT NULL DEFAULT '',
  `name` varchar(100) NOT NULL DEFAULT '',
  `email` varchar(1000) NOT NULL DEFAULT '',
  `phonenum`  varchar(100) NOT NULL DEFAULT '',
  `wallet_address` varchar(100) NOT NULL DEFAULT '',
  `balance` int(11) unsigned NOT NULL DEFAULT 0,
  `withdraw_limit` int(11) unsigned NOT NULL DEFAULT 100,
  `privateKey` varchar(100) NOT NULL DEFAULT '',
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;