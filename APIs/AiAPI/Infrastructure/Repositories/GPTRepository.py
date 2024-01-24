import g4f

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

    def get_response(self, game_type: str, bot_cards: [], cards_in_game: [], trump_card: str, mover: str) -> str:
        try: 
            request = self.build_request(game_type, bot_cards, cards_in_game, trump_card, mover)
            return g4f.ChatCompletion.create(
                model='gpt-3.5-turbo',
                messages=[{"role": "user", "content": request}]
            )
        except Exception as e:
            print(e)
            return None

    def build_request(self, game_type: str, bot_cards: [], cards_in_game: [], trump_card: str, mover: str) -> str:
        if game_type == 'durak':
            return (str(self.base_requests[game_type]) +
                    f'  Your cards JSON: {bot_cards}'
                    f'. Played cards JSON: {cards_in_game}'
                    f'. The trump card is {trump_card}'
                    f'. Make a move and provide your answer as JSON'
                    f'. Mover is {mover}'
                    '. Give answer as JSON ''{"cards": [{"card": "your card...", "card_to": "beaten card"}],'
                    '  "action": "your action"}'''
                    '. Your action is a move type - give, take, beaten(ends the current round), init(starts next round when you are mover), '
                    ' add(when all played cards are beaten) '
                    '. You can only make move "beaten" when'
                    '  you are mover(mover is "bot"). Leave the array empty, just specify the action if your action is "beaten". '
                    '  You can also go multiple cards as long as it does not break the rules of the game '
                    f'. Give a short answer - JSON only')
