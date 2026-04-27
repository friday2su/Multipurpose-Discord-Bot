const {
  SlashCommandBuilder,
  MessageFlags,
  TextDisplayBuilder,
  ContainerBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} = require('discord.js');

module.exports = {
  category: 'Fun',
  name: 'joke',
  description: 'Get a random joke',
  slashOnly: false,

  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Get a random joke'),

  async executePrefix(message, args, client) {
    await message.reply(createJokePayload());
  },

  async executeSlash(interaction, client) {
    await interaction.reply(createJokePayload());
  }
};

const jokes = [
  { setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything!" },
  { setup: "What do you call a fake noodle?", punchline: "An impasta!" },
  { setup: "Why did the scarecrow win an award?", punchline: "He was outstanding in his field!" },
  { setup: "What do you call a bear with no teeth?", punchline: "A gummy bear!" },
  { setup: "Why don't eggs tell jokes?", punchline: "They'd crack each other up!" },
  { setup: "What did the ocean say to the beach?", punchline: "Nothing, it just waved!" },
  { setup: "Why did the bicycle fall over?", punchline: "Because it was two-tired!" },
  { setup: "What do you call cheese that isn't yours?", punchline: "Nacho cheese!" },
  { setup: "Why couldn't the bicycle stand up by itself?", punchline: "It was two tired!" },
  { setup: "What do you call a dinosaur that crashes his car?", punchline: "Tyrannosaurus Wrecks!" },
  { setup: "Why did the math book look so sad?", punchline: "Because it had too many problems!" },
  { setup: "What do you call a fish wearing a bowtie?", punchline: "Sofishticated!" },
  { setup: "Why don't skeletons fight each other?", punchline: "They don't have the guts!" },
  { setup: "What did one wall say to the other wall?", punchline: "I'll meet you at the corner!" },
  { setup: "Why did the coffee file a police report?", punchline: "It got mugged!" }
];

function createJokePayload() {
  const joke = jokes[Math.floor(Math.random() * jokes.length)];

  let jokeText = `# 😂 Random Joke\n\n`;
  jokeText += `**${joke.setup}**\n\n`;
  jokeText += `||${joke.punchline}||`;

  const textDisplay = new TextDisplayBuilder().setContent(jokeText);

  const separator = new SeparatorBuilder()
    .setDivider(true)
    .setSpacing(SeparatorSpacingSize.Small);

  const container = new ContainerBuilder()
    .addTextDisplayComponents(textDisplay)
    .addSeparatorComponents(separator);

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}
