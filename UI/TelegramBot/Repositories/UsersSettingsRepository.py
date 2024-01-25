import requests
import json
from Models.UserSettings import UserSettings


class UsersSettingsRepository:
    def __init__(self, host: str = 'localhost', port: int = 3000) -> None:
        self.host = host
        self.port = port
    
    def get(self, user_id) -> UserSettings:
        response = requests.get(f'http://{self.host}:{self.port}/api/user_settings/{user_id}')

        if response.status_code == 200:
            user_settings = UserSettings()
            user_settings.from_json(json.loads(response.text))
            return user_settings, 200

        print(response.text, response.status_code)
        return None, response.status_code 
    
    def update(self, user_settings: UserSettings) -> bool:
        response = requests.put(f'http://{self.host}:{self.port}/api/user_settings/{user_settings.user_id}?game_type={user_settings.game_type}&default_bet={user_settings.default_bet}')
        
        if response.status_code == 200:
            return True, 200
        
        print(response.text)
        return False, response.status_code