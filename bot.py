import discord 
import responses
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

async def send_message(message, user_message, is_private):
    try:
        response = responses.handle_response(user_message)
        await message.author.send(response) if is_private else await message.channel.send(response)
    except Exception as e:
        #print(e)
        print("OOPS, an error has occured")
        

def run_discord_bot():
    TOKEN = os.getenv('DISCORD_TOKEN')  # Retrieve token from environment variable
    intents = discord.Intents.default()
    intents.message_content = True
    client = discord.Client(intents=intents)
    
    @client.event
    async def on_ready():
        print(f'{client.user} is now running!')
    
    @client.event
    async def on_message(message):
        # Check is message author is the channel to prevent infinite loop
        if message.author == client.user:
            return
        username = str(message.author)
        user_message = str(message.content)
        channel = str(message.channel)
        print(f'Message from {username} ({channel}) : {user_message}')
        
        if user_message[0] == '?':
            user_message = user_message[1:]     #Ignore '?' Ex: '?help' --> 'help'
            await send_message(message, user_message, is_private=True)
        else:
            await  send_message(message, user_message, is_private=False)
     
    # Run the    
    client.run(TOKEN)
