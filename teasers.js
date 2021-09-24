function acceptEnter(event) {
    if(event.key !== "Enter") return;
    console.log("acceptEnter");
    calculate();
    event.preventDefault();
}

// document.querySelector("#teams").addEventListener("keyup", acceptEnter);

function americanToDecimal(odds) {
    if (odds[0] === '+')
        return 1 + (parseFloat(odds.substring(1)) / 100);
    else if (odds[0] === '-') {
        var risk = parseFloat(odds.substring(1));
        return 1 + (100 / risk);
    }
}

function calculate() {
    var team_probs = {};
    var combos = [];
    var odds = {};
    var units = {};

    var bet_win_probs = {};
    var ev = {};
    var variance = {};

    var teamLines = document.getElementById('teams').value.split("\n");
    for (let line of teamLines) {
        let split = line.trim().split(/\s+/);
        team_probs[split[0].trim()] = parseFloat(split[1].trim());
    }
    // Computer lines, not betting lines
    var comboLns = document.getElementById('combos').value.split("\n");
    for (let line of comboLns) {
        let split = line.trim().split(/\s+/);
        let combo = split.slice(0, -2).map(s => s.trim());
        combos.push(combo);
        odds[combo] = split[split.length - 2].trim();
        units[combo] = parseFloat(split[split.length - 1].trim());
    }
    console.log(team_probs);
    console.log(combos);
    console.log(odds);
    console.log(units);

    document.getElementById('stats').innerHTML = "";

    // Stats for each combo
    for (let combo of combos) {
        let p_win = combo.map(team => team_probs[team]).reduce((prev, cur) => prev*cur, 1);
        bet_win_probs[combo] = p_win;
        let reward = (americanToDecimal(odds[combo]) - 1) * units[combo];
        ev[combo] = p_win * reward - ((1 - p_win) * units[combo]);
        variance[combo] = p_win * Math.pow((reward - ev[combo]), 2) + (1 - p_win) * Math.pow((-1*units[combo] - ev[combo]), 2);
        document.getElementById('stats').insertAdjacentHTML('beforeend', `<tr><td>${combo}</td><td>${bet_win_probs[combo]}</td><td>${ev[combo]}</td><td>${variance[combo]}</td></tr>`)
    }
    // Total EV
    let totalEV = Object.values(ev).reduce((prev, cur) => prev + cur, 0);
    document.getElementById('stats').insertAdjacentHTML('beforeend', `<tr><td><strong>Total</strong></td><td></td><td>${totalEV}</td><td></td></tr>`)
}
