const { SlashCommandBuilder } = require('discord.js');
const { replyWithCard } = require('../../utils/respond');

function formatDuration(milliseconds) {
  if (!milliseconds || milliseconds <= 0) return '00:00';
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

module.exports = {
  category: 'Music',
  name: 'volume',
  description: 'Adjust the music volume',
  slashOnly: false,
  
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Adjust the music volume')
    .addIntegerOption(option => 
      option.setName('level')
        .setDescription('Volume level (0-100)')
        .setMinValue(0)
        .setMaxValue(100)),

  async executePrefix(message, args, client) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply({ 
        content: '❌ You need to be in a voice channel to adjust volume!', 
        flags: [64]
      });
    }

    const player = client.riffy?.players.get(message.guild.id);
    if (!player) {
      return message.reply({ 
        content: '❌ There is no music playing right now!', 
        flags: [64]
      });
    }

    try {
      if (!args[0]) {
        const currentVolume = player.volume || 100;
        const embed = {
          color: 0x1DB954,
          title: '🔊 Current Volume',
          description: `Current volume is **${currentVolume}%**`,
          fields: [
            { name: '🎵 Now Playing', value: player.current ? player.current.info.title : 'Nothing', inline: true }
          ],
          timestamp: new Date().toISOString()
        };
        return replyWithCard(message, embed);
      }

      const volume = parseInt(args[0]);
      
      if (isNaN(volume) || volume < 0 || volume > 100) {
        return message.reply({ 
          content: '❌ Please provide a volume level between 0 and 100!', 
          flags: [64]
        });
      }

      player.setVolume(volume);
      
      const embed = {
        color: 0x1DB954,
        title: '🔊 Volume Adjusted',
        description: `Volume has been set to **${volume}%**`,
        fields: [
          { name: '📊 Current Volume', value: `${volume}%`, inline: true },
          { name: '🎵 Now Playing', value: player.current ? `${player.current.info.title} (${formatDuration(player.current.info.length)})` : 'Nothing', inline: true }
        ],
        timestamp: new Date().toISOString()
      };

      await replyWithCard(message, embed);
      
    } catch (error) {
      console.error('Volume error:', error);
      await message.reply({ content: '❌ There was an error adjusting the volume!', flags: [64] });
    }
  },

  async executeSlash(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({ 
        content: '❌ You need to be in a voice channel to adjust volume!', 
        flags: [64]
      });
    }

    const player = client.riffy?.players.get(interaction.guild.id);
    if (!player) {
      return interaction.reply({ 
        content: '❌ There is no music playing right now!', 
        flags: [64]
      });
    }

    try {
      const volume = interaction.options.getInteger('level');
      if (volume === null) {
        const currentVolume = player.volume || 100;
        const embed = {
          color: 0x1DB954,
          title: '🔊 Current Volume',
          description: `Current volume is **${currentVolume}%**`,
          fields: [
            { name: '🎵 Now Playing', value: player.current ? player.current.info.title : 'Nothing', inline: true }
          ],
          timestamp: new Date().toISOString()
        };
        return replyWithCard(interaction, embed);
      }
      
      if (volume < 0 || volume > 100) {
        return interaction.reply({ 
          content: '❌ Volume must be between 0 and 100!', 
          flags: [64]
        });
      }

      player.setVolume(volume);
      
      const embed = {
        color: 0x1DB954,
        title: '🔊 Volume Adjusted',
        description: `Volume has been set to **${volume}%**`,
        fields: [
          { name: '📊 Current Volume', value: `${volume}%`, inline: true },
          { name: '🎵 Now Playing', value: player.current ? `${player.current.info.title} (${formatDuration(player.current.info.length)})` : 'Nothing', inline: true }
        ],
        timestamp: new Date().toISOString()
      };

      await replyWithCard(interaction, embed);
      
    } catch (error) {
      console.error('Volume error:', error);
      await interaction.reply({ content: '❌ There was an error adjusting the volume!', flags: [64] });
    }
  }
};




