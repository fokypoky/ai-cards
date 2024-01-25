const { response } = require('express');
const AIRepository = require('../Repositories/AIRepository');
const GamesRepository = require('../Repositories/GamesRepository');

const aiRepository = new AIRepository();
const gamesRepository = new GamesRepository();

const restoreGame = async () => {
    await gamesRepository.connect();

    const game = await gamesRepository.getById(2);
    game._id = 1;

    await gamesRepository.update(game);
    console.log('game updated');
}

const test = async () => {
    await gamesRepository.connect();
    const game = await gamesRepository.getById(1);

    const aiMove = await aiRepository.getMove(game);
    console.log('ai move', aiMove);
};

const apiTest = () => {
    const move = {
        cards: [{card: 'Ac', card_to: '6c'}],
        action: 'give'
    };

    fetch(`http://localhost:3000/api/games/1/move?move=${JSON.stringify(move)}`, {method: 'PUT'}).then(res => {
        if (!res.ok) {
            throw new Error('Something went wrong');
        }
        return res.text();
    }).then(text => {
        console.log('response: ', text);
    }).catch(e => {
        console.log(e.message);
    });
}

apiTest();
//restoreGame();