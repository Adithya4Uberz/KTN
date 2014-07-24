/**
 * Casino
 * Created by BlakJack, bandi
 * 
 * This is a gambling system for Lotus. Contains
 * commands to create bucks gambles and all the other
 * needed parts to ensure everything is automatic
 * this uses server bucks.
 * 
 * @license MIT license
 */

var dice = {
        compareRolls: function (rolls, players, room) {
                var winner = '';
                var loser = '';
                if (rolls[Users.users[players[0]]] > rolls[Users.users[players[1]]]) {
                        winner = Users.users[players[0]].userid;
                        loser = Users.users[players[1]].userid;
                }
                else {
                        winner = Users.users[players[1]].userid;
                        loser = Users.users[players[0]].userid;
                }
                if (!rolls[Users.users[players[1]] === rolls[Users.users[players[0]]]]) {
                        room.addRaw(Users.users[players[0]].name + ' rolled a <font color=red>' + rolls[Users.users[players[0]]] +'</font> ...');
                        room.addRaw(Users.users[players[1]].name + ' rolled a <font color=red>' + rolls[Users.users[players[1]]] + '</font> ...');
                        room.addRaw('<font color=#24678d> ' + winner + ' wins the dice game and ' +'<font color=red>'+ dice[room.id].bet +'</font> bucks.</font>');
                        
                        var giveMoney = Number(dice[room.id].bet);
                        var money = Core.stdin('money.csv', Users.users[winner].userid);
                        var total = Number(money) + Number(giveMoney);
                        Core.stdout('money.csv', Users.users[winner].userid, total);
                        
                        var takeMoney = Number(dice[room.id].bet);
                        var bucks = Core.stdin('money.csv', Users.users[loser].userid);
                        var amount = Number(bucks) - Number(takeMoney);
                        Core.stdout('money.csv', Users.users[loser].userid, amount);
                }
                else {
                        return room.add('It was a draw! Both users keep their money as a result.');
                }
                
                delete this[room.id];
        },
        generateRolls: function (players, room) {
                var facez = [1,2,3,4,5,6];
                for (var i=0; i<players.length; i++) {
                        this[room.id].rolls[Users.users[players[i]]] = facez[Math.floor(Math.random()*6)];
                        }
                }
        };

var cmds = {

        startdice: function (target, room, user) {
                if (!this.canBroadcast()) return;
                if (isNaN(target) || !target || target == 0) return this.sendReply('/startdice - You can not bet less than 1 buck.');
                if (dice[room.id]) return this.sendReply('/startdice - A dice is already running in the room.');
                
                var target = parseInt(target);
                
                // if (!user.money >= target) return this.sendReply('/startdice - It is not possible to bet more bucks than you have.');
                
                var b = 'bucks';
                
                if (target === 1) b = 'buck';
                
                dice[room.id] = {
                        bet: target,
                        players: [],
                        rolls: {},
                }
                
                this.add('|raw|<div class="infobox"><h2><center><font color=#24678d>' + user.name + ' has started a dice game for </font><font color=red>' + dice[room.id].bet  + ' </font><font color=#24678d>'+ b + '.</font><br /> <button name="send" value="/joindice">Click to join.</button></center></h2></div> ');
        },
        
        joindice: function (target, room, user) {
                if (!dice[room.id]) return this.sendReply('/joindice - There is no dice currently running in this room.');
                if (user.money < dice[room.id].bet || isNaN(Number(user.money))) return this.sendReply('/joindice - You can not bet more bucks than you have.');
                if (dice[room.id].players.indexOf(user.userid) > -1) {
                        this.sendReply('/joindice - You have already joined this dice!');
                        return false;
                }
                room.addRaw('<b>'+ user.name + ' has joined the game of dice.</b>');
                dice[room.id].players.push(user.userid);
                if (dice[room.id].players.length === 2) {
                        room.addRaw('<b>The dice game has started!</b>');
                        dice.generateRolls(dice[room.id].players, room);
                        dice.compareRolls(dice[room.id].rolls, dice[room.id].players, room);
                        return 'gg';
                }
        },
        
        enddice: function (target, room, user) {
                if (!this.canBroadcast()) return;
                if (!dice[room.id]) return this.sendReply('/enddice - No dice is currently running to end.');
                room.addRaw('<b>'+ user.name + ' has ended the dice game</b>');
                
                delete dice[room.id];
        }

};

Object.merge(CommandParser.commands, cmds);
