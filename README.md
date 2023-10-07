# Player Data Tracker

Player Data Tracker is a simple script for tracking and updating player information from Riot Games API. It allows you to keep a record of players and their details, including name changes, and saves this data in a JSON/txt file for future reference.

## Features

- Fetch player information from the Riot Games API.
- Track changes in player names and update the records accordingly.
- Store player data in a JSON file.
- Works with any servers.

## Getting Started

### Prerequisites

Before using this script, you need to have the following installed:

- [Node.js](https://nodejs.org/) - JavaScript runtime environment

### Installation

1. Clone this repository to your local machine.

   ```bash
   git clone https://github.com/Benevolent01/league-player-tracker.git
   ```

2. Navigate to the project directory.

   ```bash
   cd league-player-tracker
   ```

3. Install the required dependencies.

   ```bash
   npm install
   ```

### Usage

To use the Player Data Tracker, follow these simple steps:

1. **Configure API Key**: Make sure to set your Riot Games API key as an environment variable. You can do this by creating a `.env` file in the project directory with the following content:

   ```
   RIOT_API_KEY=your_api_key_here
   ```

2. **Run the Script**: Use the `updateList` function to track player data. You can call it like this:

   ```javascript
   const updateList = require("./updateList");
   updateList("nameofTextFile", ["SummonerName1", "SummonerName2"], "euw1");
   ```

   - `'nameofTextFile'` is the name of the JSON file where player data will be saved.
   - `['SummonerName1', 'SummonerName2']` is an array of summoner names you want to track.
   - `'euw1'` is the server you want to track the players on (EUW or EUNE).

3. **View Player Data**: You can view and manage the player data in the generated JSON file.

### Example

Here's an example of how to use the script:

```javascript
const updateList = require("./updateList");
updateList("players.txt", ["SummonerA", "SummonerB"], "euw1");
```

This will update the 'players.json' file with information about 'SummonerA' and 'SummonerB' on the EUW server.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve this script.

## License

This project is licensed under the MIT License - see the [https://en.wikipedia.org/wiki/MIT_License](LICENSE) file for details.

## Acknowledgments

- Thanks to Riot Games for providing the API that makes this script possible.

Happy tracking! 🎮📊
