const server = require("./server");
const MongoDB = require("./src/config/database");

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server Started At :- ${PORT}`);
});
