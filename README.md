# GameBook-bot-discord


### Description
A simple Discord bot written in NodeJS. \
It allows you to read and interact with some GameBooks directly in the text channel of a Discord server or in DM with the bot.


### Features
- Possibility to start an interactive narrative with an available GameBook and navigate the choices by reacting with the right emojis.
- Possibility to get information, introduction and rules on available GameBooks.
- Possibility of obtaining a dynamic help menu.

### Build
1. Install the NodeJS dependecies \
`npm install`

2. In the main folder add the .env file and add the following line with the appropriate TOKEN \
`TOKEN=your-token-goes-here`

3. In the main folder, create the gamebooks folder and add the GameBooks in .json format.


### Use
Launch the application \
`npm run start` \
or \
`npm run dev` for a developer start.


### Get a GameBook in .json format
1. Install [LibroGame Creator 3 (LGC3)].
2. Open a GameBook with LGC3.
3. Export the GameBook to SQLite database.
4. Use this [parser] to convert DB to JSON.



[parser]:https://github.com/alexbernardi360/GameBook-parser
[LibroGame Creator 3 (LGC3)]:http://www.matteoporopat.com/librogame/libro-game-creator-3/