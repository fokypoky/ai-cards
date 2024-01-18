import g4f
from Models.Game import *


class GPTRepository:
    def __init__(self) -> None:
        self.base_requests = {
            'durak': '''
            You're playing the "Durak" card game(the number of cards is 52). 
            A card is a string of card number + suit with a small letter. 
            For example, the king of hearts is "Kh" and the 10 of diamonds is "10d". 
            The cards played are JSON of the form {'cards': [{'card': 'card value...', 'owner': 'card owner...', 
            'beaten': {'card': 'card value...', 'owner': 'card owner...'}}] }, 
            where 'cards' is an array of played cards, 'card' is the value of the card, 
            'owner' is the owner of the card (the one who played it - player or bot) and 'beaten' - beating card. 
            In this array your cards are defined by 'owner': 'bot'.
            '''
        }

    async def get_response(self, game_object: Game) -> str:
        request = await self.build_request(game_object)
        return g4f.ChatCompletion.create(
            model='gpt-3.5-turbo',
            messages=[{"role": "user", "content": request}]
        )

    async def build_request(self, game_object: Game) -> str:
        if game_object.game_type == 'durak':
            return (str(self.base_requests[game_object.game_type]) +
                    f'  Your cards JSON: {game_object.bot_cards}'
                    f'. Played cards JSON: {game_object.cards_in_game}'
                    f'. The trump card is {game_object.trump_card}'
                    f'. Make a move and provide your answer as JSON'
                    f'. Mover is {game_object.mover}'
                    '. Give answer as JSON like ''{"cards": ["card": "your card value", "beaten": '
                    ' "the card value you are beating"],'
                    '  "move": "your action"}'''
                    '. Your action is a move type - give, take or beaten(ends the current round)'
                    '. You can only make move "beaten" when'
                    '  you are mover(mover is "bot")'
                    f'. Give a short answer - JSON only')
