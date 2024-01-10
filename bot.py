import discord 
from dotenv import load_dotenv
from discord.ext import commands
from discord import app_commands
import os

# Load environment variables from .env file
load_dotenv()

def run_discord_bot():
    TOKEN = os.getenv('DISCORD_TOKEN')  # Retrieve token from environment variable
    intents = discord.Intents.default()
    intents.members = True
    description = "Electrium's discord bot"
    bot = commands.Bot(command_prefix='/', description=description, intents=intents)
    
    @bot.event
    async def on_ready():
        print(f'Logged in as {bot.user} (ID: {bot.user.id})')
        print('------')
        try:
            synced = await bot.tree.sync()
            print(f'Synced {len(synced)} commands')
        except Exception as e:
            print(e)

    # /echo for debugging
    @bot.tree.command(name = 'echo')
    async def echo(interaction: discord.Interaction, message: str):
        await interaction.response.send_message(message)

    # /assignrole <member> <role>
    @bot.tree.command(name = 'assignrole')
    # @app_commands.describe(...)
    async def assign_role(interaction: discord.Interaction, member: discord.Member, *, role: discord.Role):
        await member.add_roles(role)
        await interaction.response.send_message('Success!')
    # /assignrole error checking
    @assign_role.error
    async def assign_role_error(interaction, error):
        if isinstance(error, commands.errors.MemberNotFound):
            await interaction.response.send_message('That member does not exist. Typo?')
        if isinstance(error, commands.errors.RoleNotFound):
            await interaction.response.send_message('That role does not exist. Typo?')
        else:
            await interaction.response.send_message(error)
        
    # Run the    
    bot.run(TOKEN)
