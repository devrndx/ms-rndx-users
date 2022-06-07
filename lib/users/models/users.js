const db = require("datastore");
const log = require('metalogger')();
const Promise = require('bluebird');

class Users {

    async getUsers() {
        const conn = await db.conn();
        let users = [{}];
        if (conn) {
            users = await conn.query('select `email`, `uuid`, `last_updated` from users');
        }
        return users;
    }

    async getUser() {
        const conn = await db.conn();
        let users = [{}];
        if (conn) {
            users = await conn.query('SELECT `id`, `name`, `email`, `phonenum`, `wallet_address`, `balance`, `withdraw_limit` from users ORDER BY id DESC');
        }
        return users;
    }

    async addUser(name, phonenum, email, addr, pk, uuid) {
        const conn = await db.conn();
        const insertValue = {
            name: name,
            phonenum: phonenum,
            email: email,
            wallet_address: addr,
            privateKey: pk,
            uuid: uuid,
        };
        await conn.query("INSERT INTO users SET ?", insertValue);
        return true;
    }

    async getUserPkByEmail(email) {
        const conn = await db.conn();
        let users = [{}];
        if (conn) {
            users = await conn.query('SELECT `privateKey` from users WHERE email=\"' + email + "\"");
        }

        return users;
    }

    async getUserByEmail(email) {
        const conn = await db.conn();
        let users = [{}];
        if (conn) {
            users = await conn.query('SELECT * from users WHERE email=\"' + email + "\"");
        }

        return users;
    }

    async updateBalanceById(email, balance) {
        const conn = await db.conn();

        if (conn) {
            const query = 'UPDATE users SET balance = "' +
                balance +
                '" WHERE email = "' +
                email +
                '"';

            await conn.query(query);
        }

        return await this.getUserByEmail(email);
    }

    async updateBalanceByAddr(addr, balance) {
        const conn = await db.conn();

        if (conn) {
            const query = 'UPDATE users SET balance = "' +
                balance +
                '" WHERE wallet_address = "' +
                addr +
                '"';

            await conn.query(query);
        }

        return true;
    }

    async updateBalanceByAddr(addr, name) {
        const conn = await db.conn();

        if (conn) {
            const query = 'UPDATE users SET name = "' +
                name +
                '" WHERE wallet_address = "' +
                addr +
                '"';

            await conn.query(query);
        }

        return true;
    }

    async getPkByWalletAddr(addr) {
        const conn = await db.conn();
        let users = [{}];
        if (conn) {
            users = await conn.query('SELECT `privateKey` from users WHERE wallet_address=\"' + addr + "\"");
        }

        return users;
    }
}

module.exports = Users;