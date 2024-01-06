document.querySelector("#lines").addEventListener("keyup", event => {
    if(event.key !== "Enter") return;
    calculate();
    event.preventDefault();
});

var adjustedProbs = null;

// Used for warning about input changed in EV Calculation section
var vigfreeInputString = '';
function vigfreeInputHasChanged(newString) {
    if (newString === vigfreeInputString) {
        document.getElementById('warning').style.display = 'none';
    }
    else if (document.getElementById('ev_percentages').innerText) {
        document.getElementById('warning').style.display = 'block';
    }
}

function oddsStringToList(oddsString) {
    if (!oddsString)
        return [];
    oddsString = oddsString.replaceAll('-', ',-');
    oddsString = oddsString.replaceAll('+', ',+');
    return oddsString.split(",").map(x => x.trim()).filter(x => x);
}

function calculate() {
    vigfreeInputString = document.getElementById('lines').value;
    vigfreeInputHasChanged(vigfreeInputString);
    let oddsList = oddsStringToList(vigfreeInputString);
    let impliedProbs = [];
    for (let odds of oddsList) {
        if (odds.length === 0)
            continue;
        else if (odds[0] === '+')
            impliedProbs.push(100.0/(100.0 + parseFloat(odds.substring(1))));
        else if (odds[0] === '-') {
            let risk = parseFloat(odds.substring(1));
            impliedProbs.push(risk/(risk + 100.0));
        }
        else {
            window.alert('Invalid odds format!');
            return;
        }
    }
    document.getElementById('impl_probs').innerHTML = impliedProbs.map(odds => odds.toFixed(4)).toString();
    let impliedSum = impliedProbs.reduce((prev, current) => prev + current, 0);
    document.getElementById('overround').innerHTML = impliedSum.toFixed(4).toString();
    let vig = 1 - 1/impliedSum;
    document.getElementById('vig').innerHTML = (100*vig).toFixed(2).toString() + "%";
    adjustedProbs = impliedProbs.map(p => p/impliedSum);
    document.getElementById('adj_probs').innerHTML = adjustedProbs.map(odds => odds.toFixed(4)).toString();
    let adjustedOdds = adjustedProbs.map(p => (p > 0.5 ? "-" + (100.0*p/(1-p)).toFixed(2).toString() : "+" + ((100.0 - 100.0*p)/p).toFixed(2).toString()));
    document.getElementById('vigfree_odds').innerHTML = adjustedOdds.toString();
    calculateEv();
}

function ev(trueProbability, odds) {
    // EV = P(win) * Reward - (1 - P(win))*Risk
    // EV % = 100 * EV
    if (odds[0] === '+') {
        return trueProbability * parseFloat(odds.substring(1)) - (1 - trueProbability) * 100
    }
    else if (odds[0] === '-') {
        let risk = parseFloat(odds.substring(1));
        return 100 * (trueProbability * 100 - (1 - trueProbability) * risk) / risk;
    }
}

function freeBetEv(trueProbability, odds) {
    // For a freebet risk is 0, so
    // EV = P(win) * Reward
    // EV % = 100 * EV
    if (odds[0] === '+') {
        return trueProbability * parseFloat(odds.substring(1))
    }
    else if (odds[0] === '-') {
        let risk = parseFloat(odds.substring(1));
        let reward = 100 / risk;
        let ev = trueProbability * reward;
        return 100 * ev;
    }
}

function calculateEv() {
    let oddsList = oddsStringToList(document.getElementById('ev_calc_lines').value);
    let isFreeBet = document.getElementById('isFreeBet').checked;
    if (!adjustedProbs || oddsList.length === 0) {
        document.getElementById('ev_percentages').innerHTML = '';
        return;
    }
    if (oddsList.length === 1) {
        // Calculate the EV of this line vs each line in adjustedProbs
        odds = oddsList[0];
        if (odds.length === 0)
            return;
        document.getElementById('ev_percentages').innerHTML = adjustedProbs.map(p => (isFreeBet ? freeBetEv(p, odds) : ev(p, odds)).toFixed(2).toString()).join(", ");
    }
    else {
        // Calculate the EV of the lines paired with the corresponding prob in adjustedProbs, by position
        let evList = [];
        let i=0, j=0;
        for (i = 0; i < oddsList.length; i++) {
            let odds = oddsList[i];
            if (odds.length === 0)
                continue;
            let p = adjustedProbs[j];
            evList.push(isFreeBet ? freeBetEv(p, odds) : ev(p, odds));
            if (p < adjustedProbs.length)
                ++j;
            else
                break;
        }
        document.getElementById('ev_percentages').innerHTML = evList.map(ev => ev.toFixed(2).toString()).join(", ");
    }
}