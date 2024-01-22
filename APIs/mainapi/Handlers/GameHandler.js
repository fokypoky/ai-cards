'use strict';

class GameHandler {
    move(game, move) {
        switch(move.action.toLowerCase()) {
            case 'give':
                return this.moveGive(game, move);
            case 'take':
                return this.moveTake(game);
            case 'beaten':
                return this.moveBeaten(game);
                case 'init':
            case 'add':
                return this.moveAdd(game, move);
            case 'init':
                return this.moveAdd(game, move);
            default:
                throw new Error(`Unknown "${move.action}" action`);
        }
    }

    moveGive(game, move) {
        const gameCopy = JSON.parse(JSON.stringify(game));
        const moverCards = gameCopy[gameCopy.move_order + '_cards'];

        gameCopy.cards_in_game.filter((card) => card.owner !== gameCopy.move_order)
        .forEach((card) => {
            const beatCard = move.cards.find((fCard) => fCard.card_to === card.card);
            if (beatCard) {
                card.beaten = beatCard.card;
                moverCards.splice(moverCards.indexOf(beatCard.card), 1);
            }
        });
    
        gameCopy.move_order = gameCopy.move_order === 'bot' ? 'player' : 'bot';

        return gameCopy;
    }

    addCardsToCollection(collection, cards, owner) {
        cards.forEach((mcard) => {
            collection.push({
                card: mcard.card,
                owner,
                beaten: 'none'
            });
        })
    }

    removeCardsFromCollection(collection, cards) {
        cards.forEach((card) => {
            const foundCard = collection.find((c) => c.card === card.card);
            collection.splice(collection.indexOf(foundCard), 1);
        });
    }

    moveInit(game, move) {
        const gameCopy = JSON.parse(JSON.stringify(game));
        gameCopy.cards_in_game = [];
        
        this.addCardsToCollection(gameCopy.cards_in_game, move.cards, gameCopy.move_order);
        this.removeCardsFromCollection(gameCopy[gameCopy.move_order + '_cards'], move.cards);

        gameCopy.move_order = gameCopy.move_order === 'bot' ? 'player' : 'bot';
        gameCopy.mover = gameCopy.move_order;

        return gameCopy;
    }

    moveAdd(game, move) {
        const gameCopy = JSON.parse(JSON.stringify(game));

        this.addCardsToCollection(gameCopy.cards_in_game, move.cards, gameCopy.move_order);
        this.removeCardsFromCollection(gameCopy[gameCopy.move_order + '_cards'], move.cards);

        gameCopy.move_order = gameCopy.move_order === 'bot' ? 'player' : 'bot';

        return gameCopy;
    }

    moveTake(game) {
        const gameCopy = JSON.parse(JSON.stringify(game));
        
        gameCopy.cards_in_game.forEach((card) => {
            gameCopy[gameCopy.move_order + '_cards'].push(card.card);
        });
        gameCopy.cards_in_game = [];

        gameCopy.move_order = gameCopy.move_order === 'bot' ? 'player' : 'bot';
        gameCopy.mover = gameCopy.move_order;

        return gameCopy;
    }

    moveBeaten(game) {
        const gameCopy = JSON.parse(JSON.stringify(game));

        gameCopy.cards_in_game = [];
        gameCopy.move_order = gameCopy.move_order === 'bot' ? 'player' : 'bot';
        gameCopy.mover = gameCopy.move_order;
        
        return gameCopy;
    }
}

module.exports = GameHandler;