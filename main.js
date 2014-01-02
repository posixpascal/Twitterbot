var bot = require("./lib/twitterbot2");


TB = new bot({
	consumer: {
		key: "p4cqHjb9LSH93FpwAuqsbQ",
		secret: "4tyxmtpHvhklfo2lS1tWjBkluzt9iKZs1vkDQnngU"
	},
	access: {
		token: "158013661-YD3FlmOc29TQthpZanEpXctAmThfwfarZZyeB4qA",
		secret: "Tn7A4pjp0Lxk9kEvuvAchcqzWlokhAPJrEmzV6GqPp4BX"
	}
});
TB.start()