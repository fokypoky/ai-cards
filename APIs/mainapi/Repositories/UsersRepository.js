'use strict';

const { Pool } = require('pg');

class UsersRepository {
    constructor(host, port, database, user, password) {
        this.pool = new Pool({user, host, database, password, port});
    }

    async getUserById(userId) {
        try {
            const result = await this.pool
                    .query('SELECT * FROM users WHERE id = $1', [userId]);
            return result.rows[0];
        } catch (error) {
            return {error};
        }
    }

    async createUser(user) {
        try {
            await this.pool
                    .query('INSERT INTO users VALUES($1, $2, $3, $4, $5, $6, $7, $8);', 
                    [user.id, user.balance, user.register_date, 
                    user.victory_count, user.lose_count,
                    user.total_games_count, user.level, user.exp]);
            return 'OK';
        } catch (error) {
            return {error};
        }
    }

    async updateUser(user) {
        try {
            await this.pool
                .query('UPDATE users SET balance = $2, register_date = $3, victory_count = $4, lose_count = $5, ' +
                    'total_games_count = $6, level = $7, exp = $8 WHERE  id = $1',
                    [user.id, user.balance, user.register_date, user.victory_count, user.lose_count,
                    user.total_games_count, user.level, user.exp]);
            return 'OK';
        } catch (error) {
            return {error};
        }
    }

    async deleteUser(userId) {
        try {
            await this.pool
                .query('DELETE FROM users WHERE id = $1', [userId]);
            return 'OK';
        } catch (error) {
            return {error};
        }
    }

    async getUserSettings(userId) {
        try {
            const result = await this.pool.query('SELECT * FROM users_settings WHERE user_id = $1', [userId]);
            return result.rows[0];
        } catch (error) {
            return {error};
        }
    }

    async createUserSettings(userSettings) {
        try {
            await this.pool
                    .query('INSERT INTO users_settings(user_id, default_bet, game_type) VALUES($1, $2, $3);',
                    [userSettings.user_id, userSettings.default_bet, userSettings.game_type]);
            return 'OK';
        } catch (error) {
            return {error};
        }
    }

    async updateUserSettings(userSettings) {
        try {
            await this.pool
                .query('UPDATE users_settings SET default_bet = $2, game_type = $3 WHERE user_id = $1',
                    [userSettings.user_id, userSettings.default_bet, userSettings.game_type]);
            return 'OK';
        } catch (error) {
            return {error};
        }
    }

    async deleteUserSettings(userSettings) {
        try {
            await this.pool
                .query('DELETE FROM users_settings WHERE id = $1;', [userSettings.id]);
            return 'OK';
        } catch (error) {
            return {error};
        }
    }
}

module.exports = UsersRepository;