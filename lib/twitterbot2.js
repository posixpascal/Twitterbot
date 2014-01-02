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
	this.screen_name = "";
	this.aboutToUnfollow = [];
	this.lastCheck = 0;
	this.RETWEET_BLACKLIST = [];
  	this.handleError = function(err){
  		console.log(err);
  	}
	this.success = function(string){
		console.log("[TB]: ".bold.green + string.green);
	}
	this.error = function(string){
		console.log("[TB]: ".bold.red + string.red);
	}
	
	this.debug = function(string){
		console.log("[TB]: ".bold.grey + string.grey);
	}
  	this.getFollowers = function(cb){
		TB.T.get("/followers/ids", function(err, reply){
			if (err) { return TB.handleError(err); }
			TB.followers = reply.ids;
			cb();
		});
  	}
	this.getFalsyFriends = function(cb){
		var count = 0;
		for (var i = 0, len = TB.following.length; i < len; i++){
			var follower = TB.following[i];
			
			if (TB.followers.indexOf(follower) == -1){
				count++;
				TB.aboutToUnfollow.push(follower);
			}
		}
		TB.debug(count + " people don't follow you back");
		
		cb();
		
	}
	this.retweet = function(id){
		TB.T.post("statuses/retweets/" + id + ".json", {id: id}, function(err, reply){
			if (err) { return TB.handleError(err); }
			TB.debug("Successfully retweeted");
		});
	}
	this.tweet = function(text, cb){
		TB.success("Tweeting: " + text);
		if (text.length > 140) { return TB.error("Text is too large to tweet.. weird.."); }
		
		TB.T.post("statuses/update", {status: text}, function(err, reply){
			if (err) { if (err.message.indexOf("duplicate") > -1) { return cb(); } return TB.handleError(err); }
			TB.debug("Successfully tweeted");
		});
	}
	this.getScreenName = function(cb){
		TB.T.get("account/settings", function(err, reply){
			if (err){ return TB.handleError(err); }
			TB.screen_name = reply.screen_name;
			cb();
		})
	}
	this.getFollowing = function(cb){
		TB.T.get("/friends/ids", function(err, reply){
			if (err){ return TB.handleError(err); }
			TB.following = reply.ids;
			cb();
		})
	}
	this.step0 = function(){}
	this.step1 = function(){}
	this.step2 = function(){}
	this.step3 = function(){}
	
	this.step = 0; // start with first step
	
	this.randomTweetFromList = function(id, retweet){
		TB.T.get("lists/statuses", {list_id: id, owner_screen_name: TB.screen_name}, function(err, reply){
			if (err){ return TB.handleError(err); }
			var tweets = reply;
			for (var i = 0, len = tweets.length; i < len; i++){
				var tweet = tweets[i];
				if (TB.RETWEET_BLACKLIST.indexOf(tweet.id) > -1){ continue; }
				if (tweet.text.indexOf("@") > -1) {continue;}
				
				// publish this tweet
				TB.RETWEET_BLACKLIST.push(tweet.id);
				if (retweet){ TB.retweet(tweet.id); }
				else { TB.tweet(tweet.text, function(){
					TB.error("Tweet bereits gepostet!");
					TB.randomTweetFromList(id, retweet);
				}); }
				break;
			}
			TB.debug("Finished the Retweet Job :)");
		})
	}
	
	this.retweetList = function(){
		TB.T.get("/lists/list", { screen_name: TB.screen_name}, function(err, reply){
			if (err){ return TB.handleError(err); }
			var retweet_list = null;
			var lists = reply;
			for (var i = 0, len = lists.length; i < len; i++){
				var list = lists[i];
				if (list.description == "RETWEET"){ retweet_list = list; break; }
				
			}
			if (retweet_list == null){
				return TB.error("No list with description 'RETWEET' found. skip this job.");
			}
			TB.debug("==== Job Description ====");
			TB.debug("List: " + retweet_list.name);
			TB.debug("Members: " + retweet_list.member_count);
			TB.debug("List ID: " + retweet_list.id_str);
			TB.debug("List URL: " + retweet_list.uri);
			TB.debug("==== Description End ====");
			
			TB.randomTweetFromList(retweet_list.id, true);
			
		})
	}
	this.tweetList = function(){
		TB.T.get("/lists/list", { screen_name: TB.screen_name}, function(err, reply){
			if (err){ return TB.handleError(err); }
			var retweet_list = null;
			var lists = reply;
			for (var i = 0, len = lists.length; i < len; i++){
				var list = lists[i];
				if (list.description == "RETWEET"){ retweet_list = list; break; }
				
			}
			if (retweet_list == null){
				return TB.error("No list with description 'RETWEET' found. skip this job.");
			}
			TB.debug("==== Job Description ====");
			TB.debug("List: " + retweet_list.name);
			TB.debug("Members: " + retweet_list.member_count);
			TB.debug("List ID: " + retweet_list.id_str);
			TB.debug("List URL: " + retweet_list.uri);
			TB.debug("==== Description End ====");
			
			TB.randomTweetFromList(retweet_list.id);
			
		})
	}
	this.unfollow = function(){
		TB.T.get("friends/ids", function(err, reply){
			if (err){ return console.log("ERROR"); }
			TB.friends = reply.ids;
			for (var i = 0; i < 5; i++){
				if (TB.followers.indexOf(TB.friends[i]) == -1){

					
					TB.unfollowById(TB.friends[i]);
				}
			}
        });
	}
    this.unfollowById = function(id){
  		TB.T.post("friendships/destroy", {id: id}, function(err, reply){
			if (err) { console.log(err); return console.log("Error unfollowing".red)}
  			console.log("Successfully unfollowed: ".green + reply.name.bold.green)
  		})
    }
    this.add10Followers = function(){
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
			TB.randIndex(friends)
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
	this.jobs = [
	
    		{job: this.add10Followers, description: "Get 10 new follower"},
	//{job: this.tweetList, description: "Tweet a random tweet from your 'RETWEET' list."},
	//{job: this.retweetList, description: "Retweet a random tweet from your 'RETWEET' list."},
		//{job: this.tweetList, description: "Tweet a random tweet from your 'RETWEET' list."},
		//	{job: this.tweetList, description: "Tweet a random tweet from your 'RETWEET' list."},
            //	{job: this.unfollow, description: "Unfollow 5 people who don't follow you."},
                    		{job: this.add10Followers, description: "Get 10 new follower"},
                               		{job: this.add10Followers, description: "Get 10 new follower"},
                                       		{job: this.add10Followers, description: "Get 10 new follower"},
                                               		{job: this.add10Followers, description: "Get 10 new follower"},
                                                       		{job: this.add10Followers, description: "Get 10 new follower"},
                //            		{job: this.tweetList, description: "Tweet a random tweet from your 'RETWEET' list."},
			//	{job: this.tweetList, description: "Tweet a random tweet from your 'RETWEET' list."},
             //   {job: this.unfollow, description: "Unfollow 5 people who don't follow you."},
	];
	
	
	this.randIndex = function randIndex (arr) {
	  var index = Math.floor(arr.length*Math.random());
	  return arr[index];
	};
	this.botting = function(){
		if (TB.step == TB.jobs.length){ TB.step = 0; }
		
		var job = TB.jobs[TB.step++]
		TB.debug("Now running job: " + job.description.cyan.bold);
		job.job(); // run a certain job
	}
  	this.begin_botting = function(){


console.log("		____            ".rainbow)
console.log("		 /     '_/_/_ _ ".rainbow)
console.log("		(  ((// / /(-/  ".rainbow)
console.log("                ".rainbow)
console.log("                ".rainbow)
console.log("		 ' _  /_ _  _   ".rainbow)
console.log("		/_)  ((///)(-   ".rainbow)
console.log("[TB]: started".green.bold);


TB.botting();
setInterval(TB.botting, 4 * 1000 * 60); // every 15min -> do a bot job
                                                                           

  	}
  	/* Start the twitter bot */
	this.start = function(){
		// receiving required information once:
		TB.debug("Receiving twitter data");
		TB.getScreenName(function(){
			TB.success("Twitter Screen Name: " + TB.screen_name);
			TB.getFollowers(function(){
				TB.debug(TB.followers.length + " people follow you");
				TB.getFollowing(function(){
					TB.debug("You follow " + TB.following.length + " people");
					TB.debug("Searching for people you follow who don't follow you");
					TB.getFalsyFriends(TB.begin_botting);
				});
			});
		});
	}
	
	
	
	return this;
};
