const Discord = require('discord.js');
const Utils = require("./../../utils/utils")
const fs = require("fs")

const ImageProcessor = require("./ImageProcessor")



module.exports = {
	validate(client, message) {
		return true;
	},
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Message} message
	 * @param  {Array} args
	 */
	run: (client, message, args, LOCALE) => {
		return new Promise(async(resolve, reject)=>{
			const metioned_user = message.mentions.users.entries().next()

			let user = message.author
			if(metioned_user.value) user=metioned_user.value[1];

			message.channel.startTyping()
			setTimeout(() => {
				message.channel.stopTyping();
			}, 5000);
			
			ImageProcessor(user.avatarURL({format:"png"}), user.username)
			.then((image)=>{
				const embed = new Discord.MessageEmbed()
				.setColor('#9d65c9')
				.setTitle(LOCALE.message.title)
				.setAuthor(LOCALE.message.author)
				.setDescription(LOCALE.message.description.interpolate({
					user: user,
					author: message.author
				}))
				.attachFiles(image)
				.setImage("attachment://image.png")
				message.channel.stopTyping()
				resolve(message.channel.send(embed))
			})
			.catch((err)=>{
				message.channel.stopTyping()
				return reject(err)
			})
		})
	},

	get command() {
		return {
			name: 'espelhoespelhomeu',
			aliases: [
				"espelho",
				"espelhomeu"
			]
		};
	},
};