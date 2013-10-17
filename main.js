var bot = require("./lib/twitterbot");


TB = new bot({
	consumer: {
		key: "lxUhNzsE6d85YsBv0NNHw",
		secret: "liIkbDQkYHvagM8Q2KWbjXwXfvEoBa2cG3WblfTziV0"
	},
	access: {
		token: "1891886281-nS9sHfUQkuf2eDiInIEs31CdFUL2hDB4jQDHHIa",
		secret: "i1dOb7dZ8g5nsb0J1pIgKkXmJHYt1n1SFSIAIh3hU"
	}
});
TB.start()