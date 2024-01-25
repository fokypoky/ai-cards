class UserSettings:
    def init(self, id: int, user_id: int, default_bet: int, game_type: str) -> None:
        self.id = id
        self.user_id = user_id
        self.default_bet = default_bet
        self.game_type = game_type
    
    def to_json(self) -> {}:
        return {
            'id': self.id, 'user_id': self.user_id,
            'default_bet': self.default_bet, 
            'game_type': self.game_type
        }
    
    def from_json(self, json) -> None:
        self.id = json['id']
        self.user_id = json['user_id']
        self.default_bet = json['default_bet']
        self.game_type = json['game_type']
        