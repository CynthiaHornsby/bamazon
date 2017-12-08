var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    showProducts();
    start();
});


function showProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {
            console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price + " | " + res[i].stock_quantity);
        }
        console.log("-----------------------------------");
    });
}


function start() {


    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;

        inquirer.prompt([{
                name: "id",
                type: "list",
                choices: function() {
                    var choiceArray = [];
                    for (var i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].product_name);
                    }
                    return choiceArray;
                },
                message: "What is the name of the item you would like to buy?"
            },
            {
                type: "input",
                message: "How many units would you like to buy?",
                name: "units"
            }
        ]).then(function(response) {

            console.log(response.id);

            var chosenId;
            for (var i = 0; i < results.length; i++) {
                if (results[i].product_name === response.id) {
                    chosenId = results[i];
                }
            }

            if (chosenId.stock_quantity >= response.units) {
                chosenId.stock_quantity -= response.units;
                var stock = chosenId.stock_quantity;

                var total = chosenId.price * response.units;

                connection.query(
                    "UPDATE products SET ? WHERE ?", [{
                            stock_quantity: stock
                        },
                        {
                            item_id: chosenId.item_id
                        }
                    ],
                    function(error) {
                        if (error) throw error;
                        console.log("Item purchased! Your total is $" + total + ".");
                        start();
                    });

            }
            else {
                console.log("I'm sorry, the store has insuffecient quantities to fulfill your order.");
            }

        });
    });
}
