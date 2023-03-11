document.querySelector("#hedgeBetOdds").addEventListener("keyup", event => {
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

    var originalProfit = (originalBetOdds - 1) * originalBetAmount;
    var originalRisk = originalIsFreeBet ? 0 : originalBetAmount;
    var hedgeAmount = (originalProfit + originalRisk) / hedgeBetOdds;

    var totalWagered = originalBetAmount + hedgeAmount;
    var guaranteedProfit = originalProfit - hedgeAmount;
    var totalPayout = totalWagered + guaranteedProfit;

    document.getElementById('stats').innerHTML = "";
    document.getElementById('stats').insertAdjacentHTML('beforeend', `<tr><td>${hedgeAmount.toFixed(2)}</td><td>${totalPayout.toFixed(2)}</td><td>${guaranteedProfit.toFixed(2)}</td></tr>`)
}
