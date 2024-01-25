'use strict';

const express = require('express');
const UsersRepository = require('./Repositories/UsersRepository');
const GamesRepository = require('./Repositories/GamesRepository');
const AIRepository = require('./Repositories/AIRepository');

const GameValidator = require('./Validators/GameValidator');
const GameHandler = require('./Handlers/GameHandler');

const {parse} = require("nodemon/lib/cli");

const app = express();

const usersRepository = new UsersRepository('localhost', 5432, 'game', 'postgres', 'toor');
const gamesRepository = new GamesRepository();
const aiRepository = new AIRepository();

const gameValidator = new GameValidator();
const gameHandler = new GameHandler();

gamesRepository.connect();

const allCards = [
    '2h', '2c', '2s', '2d',
    '3h', '3c', '3s', '3d',
    '4h', '4c', '4s', '4d',
    '5h', '5c', '5s', '5d',
    '6h', '6c', '6s', '6d',
    '7h', '7c', '7s', '7d',
    '8h', '8c', '8s', '8d',
    '9h', '9c', '9s', '9d',
    '10h', '10c', '10s', '10d',
    'Jh', 'Jc', 'Js', 'Jd',
    'Qh', 'Qc', 'Qs', 'Qd',
    'Kh', 'Kc', 'Ks', 'Kd',
    'Ah', 'Ac', 'As', 'Ad',
]

const validateRequestParameters = (parameters, expectedParameters) => {
    parameters.forEach((parameter) => {
        if (expectedParameters.indexOf(parameter) === -1) {
            return `Unexpected parameter ${parameter}`;
        }
    });

    expectedParameters.forEach((parameter) => {
        if (parameters.indexOf(parameter) === -1) {
            return `Missing ${parameter} parameter`;
        }
    });

    return 'OK';
}

const shuffleArray = (array) => {
    const result = Array.from(array);

    for(let i = 0; i < result.length; i++) {
        const randomCard = result[Math.floor(Math.random() * result.length)];
        result[result.indexOf(randomCard)] = result[i];
        result[i] = randomCard;
    }

    return result;
}

// FOR TESTING SOMETHING
app.get('/api/test', async (req, res) => {
    const game_type = 'durak';
    const cards_stack = shuffleArray(allCards);
    const cards_in_game = [];
    const bot_cards = [];
    const player_cards = [];

    for (let i = 0; i < 6; i++) {
        bot_cards.push(cards_stack.pop());
        player_cards.push(cards_stack.pop());
    }

    const bet = 50;
    const trump_card = cards_stack.pop();
    const mover = Math.floor(Math.random() * 2) === 0 ? 'bot' : 'player';
    const move_order = mover;

    return res.status(200).json({
        game_type,
        cards_stack,
        cards_in_game,
        bot_cards,
        player_cards,
        bet,
        trump_card,
        move_order,
        mover
    });
});

//region users

app.get('/api/users/:user_id', async (req, res) => {
    const userId = parseInt(req.params.user_id);
    const user = await usersRepository.getUserById(userId);
    
    if (!user) {
        return res.status(404).json('User not found');
    }

    if (user.error) {
        return res.status(500).json({error: user.error});
    }

    return res.status(200).json(user);
});

app.post('/api/users/:user_id', async (req, res) => {
    const userId = parseInt(req.params.user_id);
    const existing_user = await usersRepository.getUserById(userId);

    if (existing_user) {
        return res.status(400).json('Such user already exists');
    }

    const user = {
        id: userId,
        balance: 1000,
        register_date: new Date().toISOString().replace('T', ' ').replace('Z', ' '),
        victory_count: 0,
        lose_count: 0,
        total_games_count: 0,
        level: 0,
        exp: 0
    };

    const userCreationResult = await usersRepository.createUser(user);
    if (userCreationResult !== 'OK') {
        return res.status(500).json(userCreationResult);
    }

    const userSettings = {
        user_id: userId,
        default_bet: 50,
        game_type: 'durak'
    };

    const userSettingsCreationResult = await usersRepository.createUserSettings(userSettings);
    if(userSettingsCreationResult !== 'OK') {
        await usersRepository.deleteUser(userId);
        return res.status(500).json(userSettingsCreationResult);
    }

    return res.status(200).json('OK');
});

app.put('/api/users/:user_id', async (req, res) => {
    const userId = parseInt(req.params.user_id);
    const user = await usersRepository.getUserById(userId);

    if(!user) {
        return res.status(404).json(`User with id ${userId} does not exists`);
    }

    const expectedParameters = ['balance', 'register_date', 'victory_count', 'lose_count', 'total_games_count', 'level', 'exp'];
    const parametersValidationResult = validateRequestParameters(
        Object.keys(req.query),
        expectedParameters
    );

    if (parametersValidationResult !== 'OK') {
        return res.status(400).json(parametersValidationResult);
    }

    const { balance, register_date, victory_count, lose_count, total_games_count, level, exp } = req.query;

    user.balance = balance;
    user.register_date = register_date;
    user.victory_count = victory_count;
    user.lose_count = lose_count;
    user.total_games_count = total_games_count;
    user.level = level;
    user.exp = exp;

    const userUpdateResult = await usersRepository.updateUser(user);
    if (userUpdateResult !== 'OK') {
        console.log(userUpdateResult);
        return res.status(500).json(userUpdateResult);
    }

    return res.status(200).json('OK');
});

app.delete('/api/users/:user_id', async (req, res) => {
    const userId = parseInt(req.params.user_id);

    const user = await usersRepository.getUserById(userId);
    const userSettings = await usersRepository.getUserSettings(userId);

    if (!user) {
        return res.status(404).json(`User with id ${userId} does not exists`);
    }

    if (!userSettings) {
        return res.status(500).json(`Settings for user with id ${userId} does not exists`);
    }

    const settingsDeleteResult = await usersRepository.deleteUserSettings(userSettings);
    const userDeleteResult = await usersRepository.deleteUser(userId);

    if (settingsDeleteResult !== 'OK' && userDeleteResult !== 'OK') {
        return res.status(500).json({message: 'Error while deleting settings and user',
            settings_error: settingsDeleteResult,
            user_error: settingsDeleteResult}
        );
    }

    if (settingsDeleteResult === 'OK' && userDeleteResult !== 'OK') {
        await usersRepository.createUserSettings(userSettings);
        return res.status(500).json({message: 'Error while deleting settings', settings_error: settingsDeleteResult});
    }

    return res.status(200).json('OK');
});

//endregion

//region user settings

app.get('/api/user_settings/:user_id', async (req, res) => {
    const userId = parseInt(req.params.user_id);
    const userSettings = await usersRepository.getUserSettings(userId);

    if (!userSettings) {
        return res.status(400).json(`Settings for user with id ${userId} does not exists`);
    }

    return res.status(200).json(userSettings);
});

app.post('/api/user_settings*', async (req, res) => {
    return res.status(400).json("You can't use POST on user settings route. It creates with user route (use POST /api/users/)");
});

app.put('/api/user_settings/:user_id', async (req, res) => {
    const userId = parseInt(req.params.user_id);
    const userSettings = await usersRepository.getUserSettings(userId);

    if (!userSettings) {
        return res.status(400).json(`Settings for user with id ${userId} does not exists`);
    }

    const parametersValidationResult = validateRequestParameters(
        Object.keys(req.query),
        ['default_bet', 'game_type']
    );

    if (parametersValidationResult !== 'OK') {
        return res.status(400).json(parametersValidationResult);
    }

    const {default_bet, game_type} = req.query;

    userSettings.default_bet = default_bet;
    userSettings.game_type = game_type;

    const userSettingsUpdateResult = await usersRepository.updateUserSettings(userSettings);
    if (userSettingsUpdateResult !== 'OK') {
        return res.status(500).json(userSettingsUpdateResult);
    }

    return res.status(200).json('OK');
});

app.delete('/api/user_settings*', async (req, res) => {
    return res.status(400).json("You can't use DELETE on user settings route. It deletes with user route (use DELETE /api/users/)");
});

//endregion

//region game

app.get('/api/games/:game_id', async (req, res) => {
    const gameId = parseInt(req.params.game_id);
    const game = await gamesRepository.getById(gameId);

    if (!game) {
        return res.status(404).json(`Game with id ${gameId} does not exists`);
    }

    return res.status(200).json(game);
});

app.post('/api/games/:user_id', async (req, res) => {
    const userId = parseInt(req.params.user_id);
    const user = await usersRepository.getUserById(userId);
    const userSettings = await usersRepository.getUserSettings(userId);
    const existingGame = await gamesRepository.getById(userId);

    if (!user) {
        return res.status(404).json(`User with id ${userId} does not exists`);
    }

    if (existingGame) {
        return res.status(400).json(`Game ${userId} already exists`);
    }

    if (user.balance < userSettings.default_bet) {
        return res.status(400).json(`User does not have enough money`);
    }

    user.balance -= userSettings.default_bet;
    user.total_games_count += 1;

    const userUpdateResult = await usersRepository.updateUser(user);
    if (userUpdateResult !== 'OK') {
        return res.status(500).json(userUpdateResult);
    }

    const cards_stack = shuffleArray(allCards);
    const bot_cards = [];
    const player_cards = [];

    for (let i = 0; i < 6; i++) {
        bot_cards.push(cards_stack.pop());
        player_cards.push(cards_stack.pop());
    }

    const game = {
        _id: userId,
        game_type: userSettings.game_type,
        cards_stack,
        cards_in_game: [],
        bot_cards,
        player_cards,
        bet: userSettings.default_bet,
        trump_card: cards_stack[0],
        mover: 'player',
        move_order: 'player'
    };

    const createGameResult = await gamesRepository.create(game);
    if (createGameResult !== 'OK') {
        user.balance += userSettings.default_bet;
        user.total_games_count -= 1;

        await usersRepository.updateUser(user);

        return res.status(500).json(createGameResult);
    }

    return res.status(200).json('OK');
});

app.put('/api/games/:user_id', async (req, res) => {
    const userId = parseInt(req.params.user_id);
    const user = await usersRepository.getUserById(userId);
    const game = await gamesRepository.getById(userId);

    if (!user) {
        return res.status(404).json(`User ${userId} does not exists`);
    }

    if (!game) {
        return res.status(404).json(`Game ${userId} does not exists`);
    }

    const expectedParameters = ['cards_in_game', 'bot_cards', 'player_cards', 'move_order', 'mover'];
    const parametersValidationResult = validateRequestParameters(
        Object.keys(req.query),
        expectedParameters
    );

    if (parametersValidationResult !== 'OK') {
        return res.status(400).json(parametersValidationResult);
    }

    try {
        game.cards_in_game = JSON.parse(req.query['cards_in_game']);
        game.bot_cards = JSON.parse(req.query['bot_cards']);
        game.player_cards = JSON.parse(req.query['player_cards']);
        game.move_order = req.query['move_order'];
        game.mover = req.query['mover'];
    } catch (e) {
        return res.status(400).json(e);
    }

    const gameUpdateResult = await gamesRepository.update(game);
    if (gameUpdateResult !== 'OK') {
        return res.status(500).json(gameUpdateResult);
    }

    res.status(200).send('OK');
});

app.delete('/api/games/:user_id', async(req, res) => {
    const userId = parseInt(req.params.user_id);
    const user = await usersRepository.getUserById(userId);
    const game = await gamesRepository.getById(userId); // game id equals user id

    if (!user) {
        return res.status(404).json(`User with id ${userId} does not exists`);
    }

    if (!game) {
        return res.status(404).json(`Game with id ${userId} does not exists`);
    }

    const gameDeleteResult = await gamesRepository.deleteById(userId);
    if (gameDeleteResult !== 'OK') {
        return res.status(500).json(gameDeleteResult);
    }

    user.lose_count += 1;

    const userUpdateResult = await usersRepository.updateUser(user);
    if (userUpdateResult !== 'OK') {
        return res.status(500).json(userUpdateResult);
    }

    return res.status(200).json('OK');
});

//endregion

//region game logic

app.put('/api/games/:game_id/move', async (req, res) => {
    const gameId = parseInt(req.params.game_id);
    let game = await gamesRepository.getById(gameId);

    const parametersValidationResult = validateRequestParameters(
        Object.keys(req.query),
        ['move']
    );

    if (parametersValidationResult !== 'OK') {
        console.log(parametersValidationResult);
        return res.status(400).json(parametersValidationResult);
    }

    if (!game) {
        console.log('game does not exists');
        return res.status(404).json(`Game ${gameId} does not exists`);
    }

    const moveValidationResult = gameValidator.validateMove(game, req.query.move);
    if(!moveValidationResult.result) {
        console.log(moveValidationResult.error);
        return res.status(400).json(moveValidationResult.error);
    }

    game = gameHandler.move(game, JSON.parse(req.query['move']));
    let winner = gameHandler.getWinner(game);
    if (winner) {
        const user = await usersRepository.getUserById(game._id);
        if (winner === 'player') {
            user.victory_count += 1;
            user.balance += game.bet * 2;
        } else {
            user.lose_count -= 1;
        }
        await usersRepository.updateUser(user);
        await gamesRepository.deleteById(game._id);
        return res.status(200).json(`The game is over. The winner is ${winner}`);
    }

    const aiMove = await aiRepository.getMove(game);
    const aiMoveValidationResult = gameValidator.validateMove(game, aiMove);

    if (!aiMoveValidationResult.result) {
        console.log('ai ', aiMoveValidationResult);
        return res.status(500).json(`AI Move validation error: ${aiMoveValidationResult.error}`);
    }

    game = gameHandler.move(game, JSON.parse(aiMove));
    winner = gameHandler.getWinner(game);
    if (winner) {
        const user = await usersRepository.getUserById(game._id);
        if (winner === 'player') {
            user.victory_count += 1;
            user.balance += game.bet * 2;
        } else {
            user.lose_count -= 1;
        }
        await usersRepository.updateUser(user);
        await gamesRepository.deleteById(game._id);
        return res.status(200).json(`The game is over. The winner is ${winner}`);
    }

    const gameUpdateResult = await gamesRepository.update(game);
    if (gameUpdateResult !== 'OK') {
        console.log('mongo ', gameUpdateResult);
        return res.status(500).json(`Mongo update errror: ${gameUpdateResult}`);
    }

    return res.send('OK');
});

//endregion

app.listen(3000, () => console.log('Server listens port 3000'));