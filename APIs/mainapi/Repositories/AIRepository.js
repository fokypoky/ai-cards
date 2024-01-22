'use strict';

class AIRepository {
    constructor() {
        this.baseUrl = 'http://localhost:8000/api/ai/move';
    }

    async getMove(game) {
        const botCards = JSON.stringify(game.bot_cards);
        const cardsInGame = JSON.stringify(game.cards_in_game);
        
        const request = `${this.baseUrl}?game_type=${game.game_type}&bot_cards=${botCards}&cards_in_game=${cardsInGame}&trump_card=${game.trump_card}&mover=${game.mover}`;
        
        let error = null;
        let response = null;

        await fetch(request, {method: 'GET'}).then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.text();
        }).then(json => {
            response = json;
        }).catch(e => {
            error = e.message;
        });

        if (!error) {
            return response;
        }

        return error;
    }

}

module.exports = AIRepository;