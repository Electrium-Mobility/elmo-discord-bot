import discord 
from dotenv import load_dotenv
from discord.ext import commands
import os

# Load environment variables from .env file
load_dotenv()

def run_discord_bot():
    TOKEN = os.getenv('DISCORD_TOKEN')  # Retrieve token from environment variable
    intents = discord.Intents.default()
    intents.members = True
    intents.message_content = True
    description = "Electrium's discord bot"
    bot = commands.Bot(command_prefix='&', description=description, intents=intents)
    
    @bot.event
    async def on_ready():
        print(f'Logged in as {bot.user} (ID: {bot.user.id})')
        print('------')

    # /echo for debugging
    @bot.command(name = 'echo', help = 'repeat entered text, for debugging')
    async def echo(ctx, *, args):
        await ctx.send(args)

    # /assignrole 
    @bot.command(name = 'assignrole', help = '<member> <role to assign>')
    async def assign_role(ctx, member: discord.Member, *, role: discord.Role):
        await member.add_roles(role)
        await ctx.send('Success!')
    @assign_role.error #assignrole error checking
    async def assign_role_error(ctx, error):
        if isinstance(error, commands.errors.MemberNotFound):
            await ctx.send('That member does not exist. Typo?')
        if isinstance(error, commands.errors.RoleNotFound):
            await ctx.send('That role does not exist. Typo?')
        else:
            print(error)
        
    # Run the    
    bot.run(TOKEN)
