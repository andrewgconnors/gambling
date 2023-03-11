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

function permute(permutation) {
    var length = permutation.length,
        result = [permutation.slice()],
        c = new Array(length).fill(0),
        i = 1, k, p;

    while (i < length) {
        if (c[i] < i) {
            k = i % 2 && c[i];
            p = permutation[i];
            permutation[i] = permutation[k];
            permutation[k] = p;
            ++c[i];
            i = 1;
            result.push(permutation.slice());
        } else {
            c[i] = 0;
            ++i;
        }
    }
    return result;
}

function product(iterables, repeat) {
    var argv = Array.prototype.slice.call(arguments), argc = argv.length;
    if (argc === 2 && !isNaN(argv[argc - 1])) {
        var copies = [];
      for (var i = 0; i < argv[argc - 1]; i++) {
          copies.push(argv[0].slice()); // Clone
      }
      argv = copies;
    }
    return argv.reduce(function tl(accumulator, value) {
      var tmp = [];
      accumulator.forEach(function(a0) {
        value.forEach(function(a1) {
          tmp.push(a0.concat(a1));
        });
      });
      return tmp;
    }, [[]]);
  }

// Enumerate all the possible outcome combinations for the teams contained in combos
function enumerateGameOutcomes(team_probs, combos) {
    let teamsWithDuplicates = combos.flat();
    let teams = Array.from(new Set(teamsWithDuplicates));
    console.log(`${teams.length} teams involved in bets`, teams);
    // List of all combinations of choosing Win/Loss for each team
    let allGameResults = product(['W','L'], teams.length);
    let gameResultCombos = allGameResults.map(gameResults => {
        let teamToResult = {};
        for (let i = 0; i < gameResults.length; i++) {
            teamToResult[teams[i]] = gameResults[i];
        }
        let probability = 1;
        for (let team in teamToResult) {
            probability = probability * ((teamToResult[team] === "W") ? team_probs[team] : 1 - team_probs[team])
        }
        return {
            "gameOutcomes": teamToResult,
            "probability": probability
        };
    });
    // console.log("All combos of game results", gameResultCombos);
    console.log("Sum of probabilities of game results combos", gameResultCombos.reduce((prev, cur) => prev + cur.probability, 0));
    return gameResultCombos;
}

// Calculate bet outcomes and profit/loss for each 
function calculateBetOutcomes(gameResultsCombos, bets, units_bet, potential_winnings) {
    return gameResultsCombos.map(gameResultsCombo => {
        gameResultsCombo['betOutcomes'] = {};
        gameResultsCombo['betProfits'] = {};
        for (let bet of bets) {
            let betIsWin = bet.reduce((prev, cur) => {
                return prev && (gameResultsCombo.gameOutcomes[cur] === "W");
            }, true);
            gameResultsCombo['betOutcomes'][bet] = betIsWin ? "W" : "L";
            gameResultsCombo['betProfits'][bet] = betIsWin ? potential_winnings[bet] : -1 * units_bet[bet];
        }
        gameResultsCombo['totalWins'] = Object.values(gameResultsCombo['betOutcomes']).reduce((prev, cur) => prev + (cur === "W"), 0);
        gameResultsCombo['totalProfit'] = Object.values(gameResultsCombo['betProfits']).reduce((prev, cur) => prev + cur, 0);
        // console.log(gameResultsCombo);
        return gameResultsCombo;
    });
}

function calculate() {
    var team_probs = {};
    var bets = [];
    var bet_odds = {};
    var units_bet = {};
    var bet_potential_winnings = {};

    // Stats
    var bet_win_probs = {};
    var ev = {};
    var variance = {};

    var teamLines = document.getElementById('teams').value.split("\n");
    for (let line of teamLines) {
        let split = line.trim().split(/\s+/);
        team_probs[split[0].trim()] = parseFloat(split[1].trim());
    }
    // Computer lines, not betting lines
    var comboLns = document.getElementById('bets').value.split("\n");
    for (let line of comboLns) {
        let split = line.trim().split(/\s+/);
        let bet = split.slice(0, -2).map(s => s.trim());
        bets.push(bet);
        bet_odds[bet] = split[split.length - 2].trim();
        units_bet[bet] = parseFloat(split[split.length - 1].trim());
    }

    document.getElementById('stats').innerHTML = "";

    // Stats for each combo
    for (let bet of bets) {
        let p_win = bet.map(team => team_probs[team]).reduce((prev, cur) => prev*cur, 1);
        bet_win_probs[bet] = p_win;
        let reward = (americanToDecimal(bet_odds[bet]) - 1) * units_bet[bet];
        bet_potential_winnings[bet] = reward;
        ev[bet] = p_win * reward - ((1 - p_win) * units_bet[bet]);
        variance[bet] = p_win * Math.pow((reward - ev[bet]), 2) + (1 - p_win) * Math.pow((-1*units_bet[bet] - ev[bet]), 2);
        document.getElementById('stats').insertAdjacentHTML('beforeend', `<tr><td>${bet}</td><td>${bet_win_probs[bet]}</td><td>${ev[bet]}</td><td>${variance[bet]}</td><td>${units_bet[bet]}</td></tr>`)
    }
    // Total EV
    let totalEV = Object.values(ev).reduce((prev, cur) => prev + cur, 0);
    let totalWagered = Object.values(units_bet).reduce((prev, cur) => prev + cur, 0);
    document.getElementById('stats').insertAdjacentHTML('beforeend', `<tr><td><strong>Total</strong></td><td></td><td>${totalEV}</td><td></td><td>${totalWagered}</td></tr>`);

    // Filter out only the teams involved in the combo bets, and compute all possible outcomes
    let allGameOutcomeCombos = enumerateGameOutcomes(team_probs, bets, bet_odds, units_bet, bet_potential_winnings);
    // Calculate the outcomes of the bets (profit/loss) for each set of game outcomes
    let gameAndBetOutcomes = calculateBetOutcomes(allGameOutcomeCombos, bets, units_bet, bet_potential_winnings);

    let layout = {
        margin: { t: 0 },
        xaxis: {
            title: {
                text: 'Profit (units)'
            }
        },
        yaxis: {
            title: {
                text: 'Probability'
            }
        }
    };
    plotDiv = document.getElementById('outcome_plot');
	Plotly.newPlot(plotDiv,
        [{
	        x: gameAndBetOutcomes.map(o => o.totalProfit),
        	y: gameAndBetOutcomes.map(o => o.probability),
            text: gameAndBetOutcomes.map(o => JSON.stringify(o.gameOutcomes)),
            mode: 'markers',
            type: 'scatter',
            marker: {
                size: 12,
                opacity: 0.4,
                line: {
                    color: 'MediumPurple',
                    width: 2
                }
            }
        }],
        layout
    );

    plotDiv.on('plotly_selected', function(eventData) {
        let p_mass = eventData.points.reduce(function(prev, cur) {
          return prev + cur.y
        }, 0);
        document.getElementById('p_selected').innerHTML = p_mass;
        document.getElementById('p_selected_container').style.visibility = "inherit";
      });

    plotDiv.on('plotly_deselect', function(eventData) {
        document.getElementById('p_selected').innerHTML = "";
        document.getElementById('p_selected_container').style.visibility = "hidden";
    })
}
