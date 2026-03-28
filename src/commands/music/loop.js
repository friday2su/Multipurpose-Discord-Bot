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
  name: 'loop',
  description: 'Toggle music loop mode',
  slashOnly: false,
  
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Toggle music loop mode')
    .addStringOption(option => 
      option.setName('mode')
        .setDescription('Loop mode or "toggle"')
        .addChoices(
          { name: '🔁 Toggle Loop', value: 'toggle' },
          { name: '🔂 Loop Queue', value: 'queue' },
          { name: '🔁 Loop Song', value: 'song' },
          { name: '⏹ Disable Loop', value: 'off' }
        )),

  async executePrefix(message, args, client) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply({ 
        content: '❌ You need to be in a voice channel to use loop!', 
        flags: [64]
      });
    }

    const player = client.riffy?.players.get(message.guild.id);
    if (!player || !player.current) {
      return message.reply({ 
        content: '❌ There is no song playing right now!', 
        flags: [64]
      });
    }

    try {
      const mode = args[0]?.toLowerCase() || 'toggle';
      let newMode;
      let description;

      switch (mode) {
        case 'toggle':
          newMode = player.loop === 'none' ? 'queue' : 'none';
          description = player.loop === 'none' ? '🔂 Loop queue enabled' : '⏹ Loop disabled';
          break;
        case 'queue':
          newMode = 'queue';
          description = '🔂 Loop queue enabled';
          break;
        case 'song':
          newMode = 'song';
          description = '🔁 Loop song enabled';
          break;
        case 'off':
          newMode = 'none';
          description = '⏹ Loop disabled';
          break;
        default:
          return message.reply({ 
            content: '❌ Invalid mode! Use: toggle, queue, song, or off', 
            flags: [64]
          });
      }

      player.setLoop(newMode);
      
      const embed = {
        color: 0x1DB954,
        title: '🔁 Loop Mode Changed',
        description: description,
        fields: [
          { name: '📊 Current Mode', value: newMode === 'none' ? 'Off' : newMode, inline: true },
          { name: '🎵 Now Playing', value: `${player.current.info.title} (${formatDuration(player.current.info.length)})`, inline: true }
        ],
        timestamp: new Date().toISOString()
      };

      await replyWithCard(message, embed);
      
    } catch (error) {
      console.error('Loop error:', error);
      await message.reply({ content: '❌ There was an error changing loop mode!', flags: [64] });
    }
  },

  async executeSlash(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({ 
        content: '❌ You need to be in a voice channel to use loop!', 
        flags: [64]
      });
    }

    const player = client.riffy?.players.get(interaction.guild.id);
    if (!player || !player.current) {
      return interaction.reply({ 
        content: '❌ There is no song playing right now!', 
        flags: [64]
      });
    }

    try {
      const mode = interaction.options.getString('mode') || 'toggle';
      let newMode;
      let description;

      switch (mode) {
        case 'toggle':
          newMode = player.loop === 'none' ? 'queue' : 'none';
          description = player.loop === 'none' ? '🔂 Loop queue enabled' : '⏹ Loop disabled';
          break;
        case 'queue':
          newMode = 'queue';
          description = '🔂 Loop queue enabled';
          break;
        case 'song':
          newMode = 'song';
          description = '🔁 Loop song enabled';
          break;
        case 'off':
          newMode = 'none';
          description = '⏹ Loop disabled';
          break;
      }

      player.setLoop(newMode);
      
      const embed = {
        color: 0x1DB954,
        title: '🔁 Loop Mode Changed',
        description: description,
        fields: [
          { name: '📊 Current Mode', value: newMode === 'none' ? 'Off' : newMode, inline: true },
          { name: '🎵 Now Playing', value: `${player.current.info.title} (${formatDuration(player.current.info.length)})`, inline: true }
        ],
        timestamp: new Date().toISOString()
      };

      await replyWithCard(interaction, embed);
      
    } catch (error) {
      console.error('Loop error:', error);
      await interaction.reply({ content: '❌ There was an error changing loop mode!', flags: [64] });
    }
  }
};




