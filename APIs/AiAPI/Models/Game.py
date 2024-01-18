class Game:
    def __init__(self, game_type: str, cards_stack: [], cards_in_game: [], bot_cards: [], player_cards: [], bet: int,
                 trump_card: str, move_order: str, mover: str) -> None:
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
        return {'game_type': self.game_type, 'cards_stack': self.cards_stack,
                'cards_in_game': self.cards_in_game, 'bot_cards': self.bot_cards,
                'player_cards': self.player_cards, 'bet': self.bet, 'trump_card': self.trump_card,
                'move_order': self.move_order, 'mover': self.mover}
