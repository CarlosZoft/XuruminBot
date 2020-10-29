const Discord = require('discord.js');
const Utils = require("./../../utils/utils")
const fs = require("fs")

const ImageProcessor = require("./ImageProcessor")



module.exports = {
	validate(client, message) {
		return true
	},
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Message} message
	 * @param  {Array} args
	 */
	run: (client, message, args) => {
		return new Promise(async(resolve, reject)=>{

			message.channel.startTyping()

			ImageProcessor(message.author.avatarURL({format: "png"}), message)
			.then((image)=>{
				const embed = new Discord.MessageEmbed()
				.setColor('#9d65c9')
				.setTitle("Gatinhooo")
				.setDescription(`Tuts tuts tuts 🥳🥳🥳`)
				.attachFiles(image)
				.setImage("attachment://image.gif")
				message.channel.stopTyping()
				resolve(message.channel.send(embed))
			})
			.catch((err)=>{
				message.channel.stopTyping()
				reject(err)
			})
		})
	},

	get command() {
		return {
			name: 'catgif',
			aliases: [
			]
		};
	},
};