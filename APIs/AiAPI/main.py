from fastapi import FastAPI, HTTPException

from Infrastructure.Repositories.MongoRepository import *
from Infrastructure.Repositories.GPTRepository import *

mongo = MongoRepository(host='localhost', port=27017, database='Cards', collection='game')
gpt = GPTRepository()

app = FastAPI()


@app.get('/api/ai/move')
async def get_ai_move(game_id: int):
    game = None

    try:
        if not mongo.game_exists(game_id):
            raise HTTPException(detail='Game not found', status_code=404)

        game = mongo.get_game(game_id)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    generated_success = False
    gpt_response = None

    while not generated_success:
        try:
            gpt_response = await gpt.get_response(game)
            generated_success = True
        except:
            pass

    print(gpt_response)
    return gpt_response
