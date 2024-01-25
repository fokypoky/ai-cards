import requests
import json
from Models.User import User


class UsersRepository:
    def __init__(self, host: str = 'localhost', port: int = 3000) -> None:
        self.host = host
        self.port = port
    
    def get(self, user_id) -> User:
        response = requests.get(f'http://{self.host}:{self.port}/api/users/{user_id}')
        
        if response.status_code == 200:
            user = User()
            user.from_json(json.loads(response.text))
            return user, 200
        
        return None, response.status_code
    
    def create(self, user_id) -> bool:
        response = requests.post(f'http://{self.host}:{self.port}/api/users/{user_id}')
        if response.status_code == 200:
            return True
        
        return False