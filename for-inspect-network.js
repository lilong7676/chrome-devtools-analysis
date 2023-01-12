const http = require("http");

setInterval(() => {
  http
    .get(
      "http://baike.baidu.com/api/openapi/BaikeLemmaCardApi?scope=103&format=json&appid=379020&bk_key=%E9%93%B6%E9%AD%82&bk_length=600",
      (response) => {
        let todo = "";

        // called when a data chunk is received.
        response.on("data", (chunk) => {
          todo += chunk;
        });

        // called when the complete response is received.
        response.on("end", () => {
          console.log(JSON.parse(todo).title);
        });
      }
    )
    .on("error", (error) => {
      console.log("Error: " + error.message);
    });
}, 5000);
