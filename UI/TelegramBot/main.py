import asyncio
import logging

import aiogram
from aiogram import F, Bot, Dispatcher, types, methods
from aiogram.filters.command import Command
from aiogram.utils.keyboard import InlineKeyboardBuilder

from Models.Game import Game
from Models.User import User
from Models.UserSettings import UserSettings

from Repositories.GamesRepository import GamesRepository
from Repositories.UsersRepository import UsersRepository
from Repositories.UsersSettingsRepository import UsersSettingsRepository

logging.basicConfig(level=logging.INFO)

bot_token = ''
bot = Bot(bot_token)
dp = Dispatcher()

games_repository = GamesRepository()
users_repository = UsersRepository()
user_settings_repository = UsersSettingsRepository()

available_game_types = ['durak']

@dp.message(Command('test'))
async def on_test_command_received(message: types.Message) -> None:
    await message.answer('This is start command')


@dp.message(Command('start'))
async def on_start_command(message: types.Message) -> None:
    user = users_repository.get(message.from_user.id)

    if (user[1] == 404):
        users_repository.create(message.from_user.id) 

    await message.answer('Hello')

#region profile

@dp.message(Command('profile'))
async def on_profile_command_received(message: types.Message) -> None:
    try:
        user = users_repository.get(message.from_user.id)
        
        if user[1] != 200:
            await message.answer('Ошибка на стороне сервера. Повторите попытку позже')
            return
        user = user[0]
    except:
        await message.answer('Ошибка на стороне сервера. Повторите попытку позже')
        return

    response_message = f'ID: {user.id}\nБаланс: {user.balance}\n'
    response_message += f'Дата регистрации: {user.register_date.replace('T', ' ').replace('Z', ' ').split(' ')[0]}\n'
    response_message += f'Победы: {user.victory_count}\nПоражения: {user.lose_count}\n'
    response_message += f'Всего игр: {user.total_games_count}\n'
    response_message += f'Процент побед: {user.victory_count / user.total_games_count if user.total_games_count > 0 else 0}\n'
    response_message += f'Уровень: {user.level}\nОчков опыта: {user.exp}'

    await message.answer(response_message)
    
#endregion

#region settings

@dp.message(Command('settings'))
async def on_settings_commang_received(message: types.Message) -> None:
    try:
        user_settings = user_settings_repository.get(message.from_user.id)

        if user_settings[1] != 200:
            await message.answer('Ошибка на стороне сервера. Повторите попытку позже')
            return
        user_settings = user_settings[0]
    except:
        await message.answer('Ошибка на стороне сервера. Повторите попытку позже')
        return
    
    response_message = f'Тип игры: {user_settings.game_type}\nСтавка: {user_settings.default_bet}'

    builder = InlineKeyboardBuilder()
    
    builder.row(types.InlineKeyboardButton(text='Изменить тип игры', callback_data='settings_edit_game_type'))
    builder.row(types.InlineKeyboardButton(text='Изменить ставку', callback_data='settings_edit_bet'))

    await message.answer(text=response_message, reply_markup=builder.as_markup())


@dp.callback_query(F.data == 'settings_edit_game_type')
async def settings_edit_game_type_callback(callback: types.CallbackQuery) -> None:
    builder = InlineKeyboardBuilder()
    for type in available_game_types:
        builder.add(types.InlineKeyboardButton(text=type, callback_data=f'set_game_type_{type}'))

    await bot(aiogram.methods.EditMessageText(text='Выберите тип игры', chat_id=callback.message.chat.id,
                                              message_id=callback.message.message_id,
                                              reply_markup=builder.as_markup()))

@dp.callback_query(F.data.startswith('set_game_type_'))
async def set_game_type_callback(callback: types.CallbackQuery) -> None:
    game_type = callback.data.split('_')[-1]

    is_error = False

    try:
        user_settings = user_settings_repository.get(callback.from_user.id)
        if user_settings[1] != 200:
            is_error = True

        user_settings = user_settings[0]
        user_settings.game_type = game_type

        update_result = user_settings_repository.update(user_settings)

        if update_result[1] != 200:
            is_error = True
    except:
        is_error = True

    if is_error:
        await bot.send_message(text='Ошибка на стороне сервера. Повторите попытку позже', chat_id=callback.message.chat.id)
        return
    
    await callback.message.answer('Изменения вступили в силу')

@dp.callback_query(F.data == 'settings_edit_bet')
async def setting_edit_bet_callback(callback: types.CallbackQuery) -> None:
    await callback.answer('from bet callback function')

#endregion

async def main() -> None:
    await dp.start_polling(bot)

if __name__ == '__main__':
    asyncio.run(main())