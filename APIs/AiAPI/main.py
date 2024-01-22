from fastapi import FastAPI, HTTPException
import json
from Infrastructure.Repositories.GPTRepository import *


app = FastAPI()
gpt = GPTRepository()

@app.get('/api/ai/move')
def get_ai_move(game_type, bot_cards, cards_in_game, trump_card, mover):
    gpt_response = None
    while gpt_response is None:
        try:
            gpt_response = gpt.get_response(game_type, bot_cards, cards_in_game, trump_card, mover)
        except:
            pass

    print(gpt_response)
    return json.loads(gpt_response)
