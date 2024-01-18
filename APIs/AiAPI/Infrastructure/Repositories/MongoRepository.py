import pymongo
from Models.Game import *


class MongoRepository:
    def __init__(self, host: str, port: int, database: str, collection: str) -> None:
        self.db = pymongo.MongoClient(host=host, port=port)[database]
        self.games_collection = self.db[collection]

    def get_game(self, game_id: int) -> Game:
        json = self.games_collection.find_one({'_id': game_id})
        return Game(game_type=json['game_type'], cards_stack=json['cards_stack'],
                    bot_cards=json['bot_cards'], player_cards=json['player_cards'],
                    cards_in_game=json['cards_in_game'], bet=json['bet'],
                    trump_card=json['trump_card'], move_order=json['move_order'],
                    mover=json['mover'])

    def game_exists(self, game_id: int) -> bool:
        return True if self.games_collection.count_documents({'_id': game_id}) > 0 else False