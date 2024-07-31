// Calculate and display values for the table
let banana = document.getElementById("banana");
let honey = document.getElementById("honey");
let saltfree = document.getElementById("saltfree");
let dropdown = document.getElementById("selector");

let table = document.getElementById("recipe");
let message = document.getElementById("message");

let baseRecipe = {
    proofing: [
        {name: "Yeast", amount: 2, unit: "Tsp"},
        {name: "Warm Water", amount: 1.5, unit: "Cups"},
        {name: "Sugar", amount: 2, unit: "Tbsp"}
    ],
    dough: [
        {name: "Eggs", amount: 1, unit: ""},
        {name: "Oil", amount: 2, unit: "Tbsp"},
        {name: "Sugar", amount: 0.5, unit: "Cups"},
        {name: "Salt", amount: 1, unit: "Tsp"}
    ],
};

// Return a table row corresponding to the provided JS object
function makeIngredientHTML(ingredient) {
    let newElem = document.createElement("tr");
    for (let attribute in ingredient) {
        let row = document.createElement("td");
        row.innerText = ingredient[attribute];
        newElem.appendChild(row);
    }
    return newElem;
}

// Update the table element on the page to contain the given recipe
function displayInTable(recipe) {
    for (let section in recipe) {
        let tableSection = document.getElementById(section);
        let newChildren = recipe[section].map(makeIngredientHTML);
        tableSection.replaceChildren(...newChildren);
    }
}

// Calculate and display the new recipe 
function updateIngredients() {
    message.innerText = "";

    const multiples = dropdown.value;
    const subBanana = banana.checked;
    const subHoney = honey.checked;
    const noSalt = saltfree.checked;

    let curRecipe = {
        proofing: [],
        dough: [],
    };
    for (let section in curRecipe) {
        for (let i = 0; i < baseRecipe[section].length; i++) {
            let origIngredient = baseRecipe[section][i];
            let name = origIngredient.name;
            let amount = origIngredient.amount * multiples;
            let unit = origIngredient.unit;

            // Decrease salt and yeast slightly when increasing the recipe
            if (multiples > 1 && (name === "Salt" || name === "Yeast")) {
                amount *= 0.75;
            }

            // Banana for egg: 1/2 as much
            if (subBanana && name === "Eggs") {
                name = "Bananas";
                amount *= 0.5;
            }

            // Honey for sugar: 1/2 times as much and reduce water
            if (subHoney) {
                if (name === "Warm Water") {
                    amount -= 0.05 * multiples;
                }
                if (section === "dough" && name === "Sugar") {
                    name = "Honey";
                    amount *= 0.5;
                }
            }

            // Remove salt if adding a salty secondary ingredient
            if (noSalt && name === "Salt") {
                name = "NO SALT";
                amount = 0;
                unit = "";
            }

            // Convert units when nice
            if (unit === "Tbsp" && amount % 4 === 0) {
                amount /= 16;
                unit = "Cups";
            }
            if (unit === "Tsp" && amount >= 3) {
                amount /= 3;
                unit = "Tbsp";
            }

            curRecipe[section].push({name: name, amount: Number(amount.toFixed(2)), unit: unit});
        }
    }

    displayInTable(curRecipe);
}

// Interactivity: Update the recipe when inputs change
let displayedAmount = document.getElementById("amount");
dropdown.addEventListener("input", () => {
    multiples = dropdown.value;
    displayedAmount.innerText = multiples * 5;
    updateIngredients();
});

let inputs = document.getElementsByTagName("input");
for (let elem of inputs) {
    elem.addEventListener("input", updateIngredients);
}

// Interactivity: Copy the recipe on button press
let button = document.getElementById("copy");

function onSuccess() {
    message.innerText = "Copied!";
}

function onFailure(reason) {
    message.innerText = "Failed to copy: " + reason;
}

button.addEventListener("click", () => {
    if (navigator.clipboard) {
        const content = new Blob([table.outerHTML], {type: "text/html"});
        const toWrite = [new ClipboardItem({"text/html": content})];
        navigator.clipboard.write(toWrite).then(onSuccess, onFailure);
    } else {
        // If Clipboard API is not supported, use deprecated execCommand to copy text
        const selection = window.getSelection();
        selection.removeAllRanges();
        const range = document.createRange();
        range.selectNode(table);
        selection.addRange(range);
        if (document.execCommand("copy")) {
            onSuccess();
        } else {
            onFailure();
        }
        selection.removeAllRanges();
    }
});