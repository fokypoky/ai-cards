'use strict';

class GameValidator {
    constructor() {
        this.availableMoveActions = ['give', 'take', 'beaten', 'init', 'add'];
        this.allCards = [
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
        ];
        this.availableOwners = ['bot', 'player'];
    }

    validateMove(game, move) {
        if (!game || !move) {
            return this.getResult(false, 'Game and move cant be null');
        }

        if (game.move_order === 'bot') {
            console.log(JSON.parse(move));
        } 

        const jsonValidationResult = this.validateJson(move);
        if (!jsonValidationResult.result) {
            return jsonValidationResult;
        }

        const moveJson = JSON.parse(move);

        // Проверка, что у того кто ходит имеются данные карты
        if (moveJson.action.toLowerCase() === 'give' || moveJson.action.toLowerCase() === 'add' || moveJson.action.toLowerCase() === 'init') {
            moveJson.cards.forEach((card) => {
                if (!game[game.move_order + '_cards'].map((mcard) => mcard.card).includes(card.card)) {
                    return this.getResult(false, `${game.move_order} doesn't have ${card.card} card`);
                }
            })
        }

        if (moveJson.action === 'give') {
            // Карт в ходе может вообще не быть
            if (moveJson.cards.length === 0) {
                return this.getResult(false, 'Move is empty');
            }

            // Количество карт может не совпадать с требуемым
            if (game.cards_in_game.filter((card) => card.owner !== game.move_order).length !== moveJson.cards.length) {
                return this.getResult(false, 'Not enough cards in move. You must beat all opponent cards');
            }
                
            let giveMoveIsValid = true;
            let giveMoveError = null;

            moveJson.cards.forEach((card) => {
                const cardValidationResult = this.validateGiveMove(game, card);
                if (!cardValidationResult.result) {
                    giveMoveIsValid = false;
                    giveMoveError = cardValidationResult;
                    return;
                }
            })

            if (!giveMoveIsValid) {
                return giveMoveError;
            }
        }

        if (moveJson.action === 'beaten') {
            const moveValidationResult = this.validateBeatenMove(game);
            if (!moveValidationResult.result) {
                return moveValidationResult;
            }
        }

        if (moveJson.action === 'init') {
            const moveValidationResult = this.validateInitMove(game, moveJson);
            if (!moveValidationResult.result) {
                return moveValidationResult;
            }
        }

        if (moveJson.action === 'add') {
            console.log(move);
            const moveValidationResult = this.validateAddMove(game, moveJson);
            if (!moveValidationResult.result) {
                return moveValidationResult;
            }
        }

        return this.getResult(true);
    }

    validateInitMove(game, move) {
        if (game.cards_in_game.length !== 0) {
            return this.getResult(false, "The move's not over yet");
        }

        // Проверка совпадают ли значения карт
        let previousCard = move.cards[0].card;
        move.cards.forEach((card) => {
            if (card.slice(0, -1) !== previousCard.slice(0, -1)) {
                return this.getResult(false, 'Card values must be the same');
            }

            previousCard = card;
        })

        return this.getResult();
    }

    validateAddMove(game, move) {
        if (game.cards_in_game.filter((fcard) => fcard.beaten !== 'none').length !== 0) {
            return this.getResult(false, 'Not all the cards are beaten');
        }

        // Проверка подходят ли карты по значениям
        const cardsInGameValues = game.cards_in_game.map((card) => card.card.slice(0, -1));
        move.cards.forEach((card) => {
            if (!cardsInGameValues.includes(card.card.slice(0, -1))) {
                return this.getResult(false, 'Card values must be the same cards in game');
            }
        });

        return this.getResult();
    }

    validateGiveMove(game, card) {
        // Карты, под которую ходят может не быть на столе
        const beatenCard = game.cards_in_game.find((findCard) => findCard.card === card.card_to);
        if (!beatenCard) {
            return this.getResult(false, `Card to beat does not exists`);
        }

        // Проверка не под себя ли ходит
        if (beatenCard.owner === game.move_order) {
            return this.getResult(false, `${game.move_order} can't beat himself`);
        }

        // Проверка подходит ли масть под которую ходят
        if (beatenCard.card.slice(-1) !== card.card.slice(-1) && card.card.slice(-1) !== game.trump_card.slice(-1)) {
            return this.getResult(false, `${card.card} can't beat ${beatenCard.card} because suits are different`);
        }

        if (beatenCard.card.slice(-1) === card.card.slice(-1)) {
            const beatenCardValue = beatenCard.card.slice(0, -1).replace('J', '11')
                .replace('Q', '12').replace('K', '13').replace('A', 14);

            const moveCardValue = card.card.slice(0, -1).replace('J', '11')
                .replace('Q', '12').replace('K', '13').replace('A', 14);

            if (parseInt(moveCardValue) < parseInt(beatenCardValue)) {
                return this.getResult(false, `Card ${card.card} is smaller than card ${beatenCard.card}`);
            }
        }

        return this.getResult();
    }

    validateBeatenMove(game) {
        if (game.move_order !== game.mover) {
            return this.getResult(false, `${game.move_order} can move "beaten" when he is mover`);
        }
        return this.getResult();
    }

    validateJson(move) {
        let moveJson = null;
        try {
            moveJson = JSON.parse(move);
        } catch (e) {
            return this.getResult(false, e.message);
        }

        const fieldsValidationResult = this.validateFields(
            Object.keys(moveJson),
            ['cards', 'action'],
            () => {
                return this.availableMoveActions.includes(moveJson.action)
                    ? this.getResult()
                    : this.getResult(false, `Unknown action ${moveJson.action}`);
            }
        );
        if (!fieldsValidationResult.result) {
            return fieldsValidationResult;
        }

        let cardsIsValid = true;
        let invalidCardResult = null;

        moveJson.cards.forEach((card) => {
            const cardValidationResult = this.validateCard(card);
            if (!cardValidationResult.result) {
                cardsIsValid = false;
                invalidCardResult = cardValidationResult;
            }
        });

        if (!cardsIsValid) {
            return invalidCardResult;
        }

        return this.getResult();
    }

    validateCard(card) {
        const fieldsValidationResult = this.validateFields(
            Object.keys(card),
            ['card']
        )

        if (!fieldsValidationResult.result) {
            return fieldsValidationResult;
        }

        if (!this.allCards.includes(card.card)) {
            return this.getResult(false, `Unknown ${card.card} card`);
        }

        return this.getResult();
    }

    validateFields(fields, expectedFields, inspectionCallback = () => ({result: true, error: undefined})) {
        fields.forEach((field) => {
            if (expectedFields.indexOf(field) === -1) {
                return this.getResult(false, `Unexpected ${field} field`);
            }
        });

        expectedFields.forEach((field) => {
            if (field.indexOf(field) === -1) {
                return this.getResult(false, `Missing ${field} parameter`);
            }
        });

        return inspectionCallback().result ? this.getResult() : inspectionCallback();
    }

    getResult(result= true, error = undefined) {
        return {result, error};
    }

}

module.exports = GameValidator;