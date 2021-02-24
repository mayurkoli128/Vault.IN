CREATE DATABASE VaultIN;

USE VaultIN;

create TABLE USER (
    id int8 auto_increment primary key,
    username varchar(256) not null UNIQUE,
    password VARCHAR(1024) not null,
    privateKey VARCHAR(4372) not null,
    publicKey VARCHAR(1040) not null,
    avatar VARCHAR(8) not null,
    createdDate VARCHAR(255) not null 
);

DESCRIBE USER;

CREATE TABLE USER_SETTINGS
(
    name VARCHAR(255),
    userId int8,
    type bool,
    valueInt int8 NULL,
    valueStr VARCHAR(255) NULL,
    PRIMARY KEY(name, userId),
    FOREIGN key(userId) REFERENCES USER(id),
    lastModified VARCHAR(255) not null
);

DESCRIBE USER_SETTINGS;

create table SECRET_DATA_RECORD
(
	id int8 auto_increment primary key,
    title varchar(255) not null,
    login varchar(255) not null,
    password varchar(1024) not null,
    websiteAddress varchar(2083) not null,
    note varchar(2083),
    lastModifiedAt VARCHAR(255) not null,
    lastModifiedBy int8 not null,
    type VARCHAR(10) NOT NULL,
    FOREIGN KEY(lastModifiedBy) REFERENCES USER(id)
);

DESCRIBE SECRET_DATA_RECORD;

create table SECRET (
    secretId int8,
    userId int8,
    dKey VARCHAR(4400) not null,
    rights int not NULL,
    FOREIGN KEY(secretId) REFERENCES SECRET_DATA_RECORD(id),
    FOREIGN KEY(userId) REFERENCES USER(id),
    PRIMARY KEY(secretId, userId)
);

DESCRIBE SECRET;
