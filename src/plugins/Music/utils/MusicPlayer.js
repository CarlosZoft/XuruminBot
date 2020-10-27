const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const Music = require("./../utils/Music")

const urlQ = require("url")
const ytsr = require('ytsr');
const ytpl = require('ytpl');
const ytdl = require("ytdl-core")


class MusicPlayer {
    /**
     * @param  {Discord.Client} client
     * @param  {Discord.Message} message
     * @param  {String} guild_id
     */
    constructor(guild_id, client, message) {
        this.guild_id = guild_id;
        this.client = client;
        this.message = message;
        this.dispatcher;
    }
    getPlaylist() {
        return this.client.playlist.get(this.guild_id)
    }

    /**
     * @param  {Array} playlist
     */
    setPlaylist(playlist) {
        this.client.playlist.set(this.guild_id, playlist)
    }
    /**
     * @param  {Array} playlist
     */
    appendPlaylist(playlist) {
        this.client.playlist.set(this.guild_id, this.getPlaylist().concat(playlist).slice(0,100))
    }

    shufflePlaylist() {
        var current_playlist = this.getPlaylist()
        var new_playlist = [current_playlist[0]]
        current_playlist.shift();
        new_playlist = new_playlist.concat(Utils.shuffle(current_playlist))
        this.client.playlist.set(this.guild_id, new_playlist)
    }
    deletePlaylist() {
        return this.client.playlist.delete(this.guild_id)
    }
    deletePlayer() {
        return this.client.players.delete(this.guild_id)
    }

    play() {
        return this.connection.emit("play")
    }
    skip() {
        return this.connection.emit("skip")
    }
    pause() {
        return this.connection.emit("pause")
    }
    resume() {
        return this.connection.emit("resume")
    }
    leave() {
        this.connection.disconnect()
        this.deletePlayer();
        this.deletePlaylist();
    }


    async __connectVoice() {
        return new Promise(async (resolve, reject) => {
            this.connection = await this.message.member.voice.channel.join();
            this.onEventConnections()
            resolve()
        })
    }

    async onEventConnections() {
        this.connection.on("disconnect", () => {
            this.deletePlayer();
            this.deletePlaylist();
            return this.message.channel.send(Utils.createSimpleEmbed("Saindo... Até mais! 😁"));
        })
        this.connection.on("error", (err) => {
            console.log(err)
            //this.deletePlayer();
            //this.deletePlaylist();
            return this.message.channel.send(Utils.createSimpleEmbed("Saindo... Até mais! 😁"));
        })


        this.connection.on('play', async () => {
            if (this.dispatcher) this.dispatcher.destroy();
            var current_playlist = this.getPlaylist()
            if (!current_playlist) return this.message.channel.send(Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `➡️ Use  **${process.env.COMMAND_PREFIX}play <link do youtube>** para tocar alguma coisa! 🤗`, client.user.username, client.user.avatarURL()));

            let music_url;
            
            if(current_playlist[0]["url"]){
                music_url = current_playlist[0]["url"]
            }else{
                music_url = await Music.getVideoLinkBySearch(current_playlist[0]["name"] + " " + current_playlist[0]["author"])
            }

            const stream = ytdl(music_url, {
                filter: 'audioonly'
            });
            this.dispatcher = this.connection.play(stream)
            this.onEventDispatcher()
        });
        this.connection.on('shuffle', async () => {
            this.shufflePlaylist()
        });
        this.connection.on('skip', () => {
            if (this.dispatcher) this.dispatcher.destroy();
            var current_playlist = this.getPlaylist()

            if (current_playlist.length <= 1) {
                this.connection.disconnect()
                this.deletePlayer();
                this.deletePlaylist();
            } else {
                current_playlist.splice(0, 1)
                this.setPlaylist(current_playlist)
                this.connection.emit("play")

                // const stream = ytdl(this.getPlaylist()[0]["url"], {
                //     filter: 'audioonly'
                // });
                // this.dispatcher = this.connection.play(stream)
            }

        });
        this.connection.on('pause', () => {
            if (this.dispatcher) dispatcher.pause();
            //return this.message.channel.send(Utils.createSimpleEmbed("Estátua! Música pausada! 😊"));
        });
        this.connection.on('resume', () => {
            if (this.dispatcher) this.dispatcher.resume();
            //return this.message.channel.send(Utils.createSimpleEmbed("Ufa! Voltei! 😊"));
        });

    }
    onEventDispatcher() {
        this.dispatcher.on('finish', (msg) => {
            if (this.dispatcher) this.dispatcher.destroy()
            var playlist = this.getPlaylist()
            if (!playlist) {
                //return this.message.channel.send(Utils.createSimpleEmbed("Sem playlist tocando no momento 😔"));
            }
            if (this.connection.channel.members.size <= 1) {
                this.connection.disconnect()
                this.deletePlayer();
                this.deletePlaylist();
            }
            if (playlist.length <= 1) {
                this.connection.disconnect()
                this.deletePlayer();
                this.deletePlaylist();
            } else {
                var x = playlist
                x.splice(0, 1)
                this.setPlaylist(x)
                this.play()
            }
        });
    }



}


module.exports = MusicPlayer