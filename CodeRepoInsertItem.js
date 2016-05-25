var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-west-2",
//   endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var table = "coderepo";

var id = "sprint-callcenter-widget";
// var year = 2015;
// var title = "The Big New Movie";

var params = {
    TableName:table,
    Item:{
        "id": id,
        "info":{
            "html": "<html></html>",
            "css": "#sprint-callcenter-widget {\ncolor:white;\n}\n",
            "js": "var mydata;",
            "name": "Sprint Call Center Widget",
            "description": "Used to implement business logic",
            "isFrontend":true,
        }
    }
};

console.log("Adding a new item...");
docClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
    }
});