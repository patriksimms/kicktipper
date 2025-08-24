# kicktipper

> This is basically a full modern reimplementation of [kicktipp-betbot](https://github.com/schwalle/kicktipp-betbot) with some slight adjustments

To install dependencies:

```sh
bun install
```

To run:

```sh
export KICKTIPP_USERNAME="xxx@test.com"
export KICKTIPP_PASSWORD="xxx"
bun run index.ts
```

## Usage (copied from [kicktipp-betbot](https://github.com/schwalle/kicktipp-betbot))

### Get Login Token

```sh
bun run index.ts --generate-login-token
> xxx-xxx-xxx
```

### Placing bets
```sh
bun run index.ts --use-login-token xxx-xxx-xxx --override-bets
> Community: yyy
> Hamburger SV vs FC St. Pauli (2025-08-29) (2.2;3.5;3.1) - betting 1:0
> RB Leipzig vs 1. FC Heidenheim 1846 (2025-08-30) (1.44;4.75;6.5) - betting 2:1
> VfB Stuttgart vs Bor. Mönchengladbach (UNKNOWN) (1.66;4.33;4.4) - betting 1:0
> Werder Bremen vs Bayer 04 Leverkusen (UNKNOWN) (3.2;3.75;2.05) - betting 1:1
> 1899 Hoffenheim vs Eintracht Frankfurt (UNKNOWN) (2.85;3.8;2.25) - betting 1:1
> FC Augsburg vs FC Bayern München (2025-08-30) (9.5;6;1.28) - betting 1:2
> VfL Wolfsburg vs FSV Mainz 05 (2025-08-31) (2.25;3.6;3) - betting 1:0
> Borussia Dortmund vs 1. FC Union Berlin (2025-08-31) (1.38;5.25;7.25) - betting 2:1
> 1. FC Köln vs SC Freiburg (2025-08-31) (2.55;3.3;2.75) - betting 1:1
> action https://www.kicktipp.de/yyy/tippabgabe
> ✅ Bets submitted for yyy at Sun Aug 24 2025 21:01:01 GMT+0200 (Central European Summer Time)
```

### Help
```sh
> bun run index.ts --help
> Usage: index [options] [COMMUNITY...]
> 
> Arguments:
>   COMMUNITY                  Prediction game communities
> 
> Options:
>   --get-login-token          Just login and print the login token string
>   --use-login-token <token>  Use login token instead of interactive login
>   --override-bets            Override already placed bets
>   --deadline <duration>      Only place bets on matches that start in <duration>
>   --list-predictors          List available predictors
>   --predictor <value>        Choose predictor
>   --dry-run                  Don't place bets, just print predictions
>   --matchday <value>         Choose a specific matchday (1-34)
>   -h, --help                 display help for command
```
