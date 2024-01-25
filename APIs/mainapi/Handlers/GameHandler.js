'use strict';

class GameHandler {
    move(game, move) {
        switch(move.action.toLowerCase()) {
            case 'give':
                return this.moveGive(game, move);
            case 'take':
                return this.moveTake(game);
            case 'beaten':
                return this.moveBeaten(game, move);
            case 'add':
                return this.moveAdd(game, move);
            case 'init':
                return this.moveInit(game, move);
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

        this.appendCardsToPlayers(gameCopy);

        return gameCopy;
    }

    moveBeaten(game, move) {
        const gameCopy = JSON.parse(JSON.stringify(game));

        if (move.cards.length !== 0) {
            const moverCards = gameCopy[gameCopy.mover + '_cards'];
            move.cards.forEach(card => {
                moverCards.splice(moverCards.indexOf(card.card), 1);
            });
        }

        gameCopy.cards_in_game = [];
        gameCopy.move_order = gameCopy.move_order === 'bot' ? 'player' : 'bot';
        gameCopy.mover = gameCopy.move_order;
        
        this.appendCardsToPlayers(gameCopy);

        return gameCopy;
    }

    getWinner(game) {
        if (game.cards_stack.length === 0) {
            if (game.player_cards.length === 0) {
                return 'player';
            }
            if (game.bot_cards.length === 0) {
                return 'bot';
            }
        }
        return undefined;
    }

    appendCardsToPlayers(game) {
        while (game.player_cards.length < 6 && game.cards_stack.length > 0) {
            game.player_cards.push(game.cards_stack.pop());
        }

        while (game.bot_cards.length < 6 && game.cards_stack.length > 0) {
            game.bot_cards.push(game.cards_stack.pop());
        }
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
    
}

module.exports = GameHandler;