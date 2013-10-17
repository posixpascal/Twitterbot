/*
 * TwitterBot
 * http://jump.raszyk.de/twitterbot
 *
 * Copyright (c) 2013 Pascal Raszyk
 * Licensed under the MIT license.
 */


var twit = require("twit");
var colors = require("colors")

module.exports = function(config){
  	this.T = new twit({
  		consumer_key: config.consumer.key,
		consumer_secret: config.consumer.secret,
		access_token: config.access.token,
		access_token_secret: config.access.secret
  	});
  
  	this.prune = function(){
  		// maybe unfollow ALL people later.
		if (TB.followers) { 
			TB.T.get("friends/ids", function(err, reply){
				if (err){ return console.log("ERROR"); }
				TB.friends = reply.ids;
				console.log("You follow: " + TB.friends.length.toString().cyan + " people");
				console.log("I'll remove people who don't follow you as well.");
				pruned = 0;
				for (var i = 0; i < TB.friends.length; i++){
					if (TB.followers.indexOf(TB.friends[i]) == -1){
						pruned++;
						
						TB.unfollow(TB.friends[i]);
					}
				}
				console.log("WOW!" + pruned + " PEOPLE ARE ABOUT TO BE REMOVED FROM YOUR" + " FOLLOWING-LIST".bold);
				
				
			})
		}
  	}
  	this.unfollow = function(id){

  		TB.T.post("friendships/destroy", {id: id}, function(err, reply){
			if (err) { console.log(err); return console.log("Error unfollowing".red)}
  			console.log("Successfully unfollowed: ".green + reply.name.bold.green)
  		})
  	}
	this.followRandom = function(){
		randomFollower = TB.randIndex(TB.followers);
		
		TB.T.get("friends/ids", {user_id: randomFollower}, function(err, reply){
			var friends = reply.ids;
			targets = [
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			TB.randIndex(friends),
			]
			for (var i = 0; i < targets.length; i++){
				id = targets[i];
				TB.T.post("friendships/create", {id: id}, function(err, reply){
					if (err){ return console.log("ERROR: couldn't follow a guy!"); }
					console.log("Now following: " + reply.name.green.bold);
					
				})
			}
		})
		
	}
  	this.run = function(){
  		console.log("Fetching new data from twitter");
		
		this.T.get("/followers/ids", function(err, reply){
			if (err) {console.log(err); return console.log("ERROR: couldn't fetch followers".red);}
			TB.followers = reply.ids;
			
			console.log("Got: " + TB.followers.length.toString().cyan + " Followers");
			//TB.prune();
			
			TB.followRandom();
		});
		
		
		
		
  	}
  
  	this.start = function(){
  		console.log("[TB]: Starting".cyan);
		
		TB.run();
		setInterval(function(k){ TB.run(); }, 8000);
		
  	}
	this.randIndex = function randIndex (arr) {
	  var index = Math.floor(arr.length*Math.random());
	  return arr[index];
	};
	
	return this;
};
