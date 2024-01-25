class Game():
    def init(self, id: int, game_type: str, cards_stack: [], cards_in_game: [], bot_cards: [], player_cards: [], bet: int, trump_card: str, move_order: str, mover: str) -> None:
        self.id = id
        self.game_type = game_type
        self.cards_stack = cards_stack
        self.cards_in_game = cards_in_game
        self.bot_cards = bot_cards
        self.player_cards = player_cards
        self.bet = bet
        self.trump_card = trump_card
        self.move_order = move_order
        self.mover = mover

    def to_json(self) -> {}:
        return {
            '_id': self.id, 'game_type': self.game_type,
            'cards_stack': self.cards_stack, 'cards_in_game': self.cards_in_game,
            'bot_cards': self.bot_cards, 'player_cards': self.player_cards,
            'bet': self.bet, 'trump_card': self.trump_card,
            'move_order': self.move_order, 'mover': self.mover
        }
    
    def from_json(self, json) -> None:
        self.id = json['_id']
        self.game_type = json['game_type']
        self.cards_stack = json['cards_stack']
        self.cards_in_game = json['cards_in_game']
        self.bot_cards = json['bot_cards']
        self.player_cards = json['player_cards']
        self.bet = json['bet']
        self.trump_card = json['trump_card']
        self.move_order = json['move_order']
        self.mover = json['mover'] 
        