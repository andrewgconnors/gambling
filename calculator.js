function calculate() {
    var oddsList = document.getElementById('lines').value.split(",");
    var impliedProbs = [];
    console.log(oddsList);
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
    document.getElementById('impl_probs').innerHTML = impliedProbs.toString();
    var impliedSum = impliedProbs.reduce((prev, current) => prev + current, 0);
    document.getElementById('overround').innerHTML = impliedSum.toString();
    var vig = 1 - 1/impliedSum;
    document.getElementById('vig').innerHTML = (100*vig).toString() + "%";
    var adjustedProbs = [];
    for (var p of impliedProbs)
        adjustedProbs.push(p/impliedSum);
    document.getElementById('adj_probs').innerHTML = adjustedProbs.toString();
    var adjustedOdds = [];
    for (var p of adjustedProbs) {
        adjustedOdds.push(p > 0.5 ? "-" + (100.0*p/(1-p)).toString() : "+" + ((100.0 - 100.0*p)/p).toString());
    }
    document.getElementById('vigfree_odds').innerHTML = adjustedOdds.toString();
}