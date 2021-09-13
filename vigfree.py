import sys

def main():
    implied_probs = []
    for tok in sys.argv[1:]:
        if tok[0] == '+':
            implied_probs.append(100.0/(100.0 + float(tok[1:])))
        elif tok[0] == '-':
            risk = float(tok[1:])
            implied_probs.append(risk/(risk + 100.0))
        else:
            raise ValueError()
    implied_sum = sum(implied_probs)
    print("implied probs:", implied_probs, sum(implied_probs))
    adjusted_probs = [p/implied_sum for p in implied_probs]
    adjusted_odds = ["-" + str(100.0*p/(1-p)) if p > 0.5 else "+" + str((100.0 - 100.0*p)/p) for p in adjusted_probs]
    print("adjusted probs:", adjusted_probs, sum(adjusted_probs))
    print("vig-free odds", adjusted_odds)

if __name__ == '__main__':
    main()
