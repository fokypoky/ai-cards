from Models.Game import Game
from Models.User import User
from Models.UserSettings import UserSettings
from Repositories.GamesRepository import GamesRepository

repo = GamesRepository()
print(repo.host)
print(repo.port)
