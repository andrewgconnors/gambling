document.querySelector("#lines").addEventListener("keyup", event => {
    if(event.key !== "Enter") return;
    calculate();
    event.preventDefault();
});

function calculate() {
    var oddsList = document.getElementById('lines').value.split(",");
    var impliedProbs = [];
    for (var odds of oddsList) {
        odds = odds.trim();
        if (odds[0] === '+')
            impliedProbs.push(100.0/(100.0 + parseFloat(odds.substring(1))));
        else if (odds[0] === '-') {
            var risk = parseFloat(odds.substring(1));
            impliedProbs.push(risk/(risk + 100.0));
        }
        else {
            window.alert('Invalid odds format!');
            return;
        }
    }
    document.getElementById('impl_probs').innerHTML = impliedProbs.map(odds => odds.toFixed(4)).toString();
    var impliedSum = impliedProbs.reduce((prev, current) => prev + current, 0);
    document.getElementById('overround').innerHTML = impliedSum.toFixed(4).toString();
    var vig = 1 - 1/impliedSum;
    document.getElementById('vig').innerHTML = (100*vig).toFixed(2).toString() + "%";
    var adjustedProbs = impliedProbs.map(p => p/impliedSum);
    document.getElementById('adj_probs').innerHTML = adjustedProbs.map(odds => odds.toFixed(4)).toString();
    var adjustedOdds = adjustedProbs.map(p => (p > 0.5 ? "-" + (100.0*p/(1-p)).toFixed(2).toString() : "+" + ((100.0 - 100.0*p)/p).toFixed(2).toString()));
    document.getElementById('vigfree_odds').innerHTML = adjustedOdds.toString();
}
