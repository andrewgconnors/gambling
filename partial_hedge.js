document.querySelector("#hedgeBetAmount").addEventListener("keyup", event => {
    if(event.key !== "Enter") return;
    calculate();
    event.preventDefault();
});

// TODO: Duplicated code
// Calculate decimal format odds, where the odds include the original bet (so 1 is the lowest possible odds)
function americanToDecimal(odds) {
    if (odds[0] === '+')
        return 1 + (parseFloat(odds.substring(1)) / 100);
    else if (odds[0] === '-') {
        var risk = parseFloat(odds.substring(1));
        return 1 + (100 / risk);
    }
}

function calculate() {
    var originalBetOdds = americanToDecimal(document.getElementById('originalBetOdds').value);
    var originalBetAmount = parseFloat(document.getElementById('originalBetAmount').value);
    var originalIsFreeBet = document.getElementById('originalIsFreeBet').checked;
    var hedgeBetOdds = americanToDecimal(document.getElementById('hedgeBetOdds').value);
    var hedgeBetAmount = parseFloat(document.getElementById('hedgeBetAmount').value);

    var obWins = {}, obLoses = {};

    obWins['totalPayout'] = originalBetOdds * originalBetAmount;
    // Net profit = original bet profit - hedge bet amount (lost)
    obWins['netProfit'] = obWins['totalPayout'] - originalBetAmount - hedgeBetAmount;

    obLoses['totalPayout'] = hedgeBetOdds * hedgeBetAmount;
    // Net profit = hedge bet profit - original bet amount (lost)
    obLoses['netProfit'] = obLoses['totalPayout'] - hedgeBetAmount - originalBetAmount;

    document.getElementById('obWins').innerHTML = "<th>OB wins</th>";
    document.getElementById('obLoses').innerHTML = "<th>OB loses</th>";
    document.getElementById('obWins').insertAdjacentHTML('beforeend', `<td>${obWins['totalPayout'].toFixed(2)}</td><td>${obWins['netProfit'].toFixed(2)}</td>`);
    document.getElementById('obLoses').insertAdjacentHTML('beforeend', `<td>${obLoses['totalPayout'].toFixed(2)}</td><td>${obLoses['netProfit'].toFixed(2)}</td>`);
}
