import requests
from Models.Game import Game

class GamesRepository:
    def __init__(self, host: str = 'http://localhost', port: int = 3000):
        self.host = host
        self.port = port

    def get(self, user_id) -> Game:
        pass

    def create(self, user_id):
        pass

    def delete(self, game_id):
        pass