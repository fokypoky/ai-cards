class User:
    def init(self, id: int, balance: int, register_date: str, victory_count: int, 
                 lose_count: int, total_games_count: int, level: int, exp: int) -> None:
        self.id = id
        self.balance = balance
        self.register_date = register_date
        self.victory_count = victory_count
        self.lose_count = lose_count
        self.total_games_count = total_games_count
        self.level = level
        self.exp = exp
    
    def to_json(self) -> {}:
        return {
            'id': self.id, 'balance': self.balance,
            'register_date': self.register_date, 'victory_count': self.victory_count,
            'lose_count': self.lose_count, 'total_games_count': self.total_games_count,
            'level': self.level, 'exp': self.exp
        }

    def from_json(self, json) -> None:
        self.id = json['id']
        self.balance = json['balance']
        self.register_date = json['register_date']
        self.victory_count = json['victory_count']
        self.lose_count = json['lose_count']
        self.total_games_count = json['total_games_count']
        self.level = json['level']
        self.exp = json['exp']
        