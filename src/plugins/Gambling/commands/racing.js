"use strict";

const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const Payment = require("./../../../libs/Payment")
require('dotenv/config');


var racingGame = new Discord.Collection()

async function _sendRectsLight(message) {
    await message.react("✅")
}

function getConfirmation(message) {
    return new Promise(async (resolve, reject) => {
        await _sendRectsLight(message)
        const filter = (reaction, user) => {
            return !["754756207507669128", "753723888671785042", "757333853529702461", message.author.id].includes(user.id);
        };
        message.awaitReactions(filter, {
                max: 1,
                time: 10 * 60 * 1000,
                errors: ['time']
            })
            .then(collected => {
                const reaction = collected.first();
                switch (reaction.emoji.name) {
                    case "✅":
                        resolve(true)
                        break;
                    default:
                        reject()
                        break;
                }
            })
            .catch(collected => {
                reject(collected)
            });

    })
}
async function payBettors(color, message) {
    var totalPrize = racingGame.get(message.guild.id).bettors.length * 100
    var bettors = racingGame.get(message.guild.id).bettors.filter(elm => elm.car == color)
    var userPrizeValue = (totalPrize * 0.85) / bettors.length

    for (let index = 0; index < bettors.length; index++) {
        const bettor = bettors[index];
        try {
            await Payment.fastPayXurumin(bettor.id, userPrizeValue)
        } catch (error) {
            console.log(error);
        }
    }
    return {
        bettors: bettors,
        prize: userPrizeValue,
        total_prize: totalPrize * 0.85
    };
}
module.exports = {
    validate(client, message) {
        return true;
    },
    /**
     * @param  {Discord.Client} client
     * @param  {Discord.Message} message
     * @param  {} args
     */
    run: async (client, message, args, LOCALE) => {
        return new Promise(async (resolve, reject) => {

            var game_info = {
                title: LOCALE["messages"].title,
                run_is_over: false,
                cars: [
                    "blue", "red", "black", "green"
                ]
            }

            if (racingGame.has(message.guild.id)) {
                if(racingGame.get(message.guild.id).isRuning == true){
                    return;
                }
                if (args[0] == "bet") {
                    var car_color = args[1]
                    if (game_info.cars.includes(car_color)) {
                        return Payment.fastPay(message.author.id, 100)
                            .then(async (pmtResponse) => {
                                racingGame.get(message.guild.id).bettors.push({
                                    id: message.author.id,
                                    car: car_color
                                })
                                return message.channel.send(LOCALE["messages"].bet_accepted.interpolate({
                                    user: message.author
                                }))
                            }).catch(async (err) => {
                                return await message.channel.send(LOCALE["messages"]["user_do_not_have_funds"].interpolate({
                                    user: message.author,
                                    prefix: process.env.COMMAND_PREFIX
                                }))
                            })
                    }
                }
                return message.channel.send(LOCALE["messages"].bet_not_accepted.interpolate({
                    user: message.author
                }))
            }


            message.channel.startTyping()
            setTimeout(() => {
                message.channel.stopTyping();
            }, 5000);

            var main_embed = new Discord.MessageEmbed()
            main_embed.setTitle(game_info.title)
            main_embed.setDescription(LOCALE["messages"].start.description)
            //main_embed.setThumbnail("https://i.imgur.com/J9Cz6fC.png")

            var msg = await message.channel.send(main_embed)

            racingGame.set(message.guild.id, {
                bettors: [],
                isRuning: false
            })
            getConfirmation(msg)
                .then(async (status) => {
                    if (!status) {
                        racingGame.delete(message.guild.id)
                        return resolve(await message.channel.send(LOCALE["messages"].game_cancelled))
                    }
                    var race_pos = [
                        [":red_car:"],
                        [":articulated_lorry:"],
                        [":blue_car:"],
                        [":police_car:"]
                    ]
                    racingGame.get(message.guild.id).isRuning = true;
                    //🔴 🟠 🟡 🟢
                    const red_light = "🔴🔴🔴🔴\n🔴🔴🔴🔴\n🔴🔴🔴🔴\n🔴🔴🔴🔴\n"
                    main_embed.setDescription("                             \n"+red_light)
                    await msg.edit(main_embed)
                    await Utils.wait(1500)
                    const yellow_light = "🟡🟡🟡🟡\n🟡🟡🟡🟡\n🟡🟡🟡🟡\n🟡🟡🟡🟡\n"
                    main_embed.setDescription("                             \n"+yellow_light)
                    await msg.edit(main_embed)
                    await Utils.wait(1500)
                    const green_light = "🟢🟢🟢🟢\n🟢🟢🟢🟢\n🟢🟢🟢🟢\n🟢🟢🟢🟢\n"
                    main_embed.setDescription("                             \n"+green_light)
                    await msg.edit(main_embed)
                    await Utils.wait(1500)


                    var txt = ""
                    for (let i = 0; i < race_pos.length; i++) {
                        const element = race_pos[i];
                        for (let i2 = 0; i2 < element.length; i2++) {
                            const element2 = element[i2];
                            txt += `${element2}`
                        }
                        txt += "\n"
                    }
                    main_embed.setDescription("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n"+txt)
                    await msg.edit(main_embed)

                    await Utils.wait(500)

                    var rn = true
                    while (rn) {
                        if (game_info.run_is_over) {
                            rn == false;
                            break;
                        }
                        const car_choice = Utils.random(0,3)
                        //const car_choice = 0;
                        race_pos[car_choice].unshift("➖")

                        var txt = ""
                        for (let i = 0; i < race_pos.length; i++) {
                            const element = race_pos[i];
                            for (let i2 = 0; i2 < element.length; i2++) {
                                const element2 = element[i2];
                                txt += `${element2}`
                            }
                            txt += "\n"
                        }
                        main_embed.setDescription("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n"+txt)
                        await msg.edit(main_embed)

                        for (let index = 0; index < race_pos.length; index++) {
                            if (race_pos[index].length == 8) {
                                /** 
                                 * 0 == red
                                 * 1 == green
                                 * 2 = blue
                                 * 3 = black
                                 */
                                var winners;
                                switch (index) {
                                    case 0:
                                        winners = await payBettors("red", message)
                                        break;
                                    case 1:
                                        winners = await payBettors("green", message)
                                        break;
                                    case 2:
                                        winners = await payBettors("blue", message)
                                        break;
                                    case 3:
                                        winners = await payBettors("black", message)
                                        break;
                                    default:
                                        break;
                                }
                                if (winners.bettors.length <= 0) {
                                    racingGame.delete(message.guild.id)
                                    main_embed.setDescription(LOCALE["messages"]["no_winner"])
                                    return resolve(message.channel.send(main_embed))
                                }
                                var winnerList = LOCALE["messages"]["winners"].description.interpolate({
                                    total_prize: winners.total_prize
                                })+"\n"
                                winners.bettors.forEach((element, index) => {
                                    winnerList += `\n${index+1}: <@${element.id}> -> **X$${winners.prize}**`
                                });
                                racingGame.delete(message.guild.id)
                                return resolve(message.channel.send(new Discord.MessageEmbed()
                                .setTitle(game_info.title+" - "+ LOCALE["messages"]["winners"].title)
                                .setDescription(winnerList)))
                            }
                        }       
                        await Utils.wait(1200)
                    }
                })
                .catch(async (err) => {
                    console.log(err);
                    racingGame.delete(message.guild.id)
                    return await message.channel.send("oops");
                })

            message.channel.stopTyping();


        })
    },
    get command() {
        return {
            name: 'racing',
            aliases: [
                "corrida"
            ]
        }
    },
};