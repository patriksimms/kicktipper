#!/usr/bin/env bun
import { Command } from 'commander'
import * as cheerio from 'cheerio'
import { Match } from './helper/match'
import { getPredictors } from './predictors/base'

const URL_BASE = 'https://www.kicktipp.de'
const URL_LOGIN = URL_BASE + '/info/profil/loginaction'

const DEADLINE_REGEX = /^([1-9][0-9]*)(m|h|d)$/

const program = new Command()

program
    .argument('[COMMUNITY...]', 'Prediction game communities')
    .option('--get-login-token', 'Just login and print the login token string')
    .option('--use-login-token <token>', 'Use login token instead of interactive login')
    .option('--override-bets', 'Override already placed bets')
    .option('--deadline <duration>', 'Only place bets on matches that start in <duration>')
    .option('--list-predictors', 'List available predictors')
    .option('--predictor <value>', 'Choose predictor')
    .option('--dry-run', "Don't place bets, just print predictions")
    .option('--matchday <value>', 'Choose a specific matchday (1-34)')
    .parse(process.argv)

const options = program.opts()
const communities: string[] = program.args

// --- Helpers ---

function parseDeadline(deadline: string): number {
    const match = deadline.match(DEADLINE_REGEX)
    if (!match) throw new Error(`Invalid deadline: ${deadline}`)
    const value = parseInt(match[1], 10)
    const unit = match[2]
    switch (unit) {
        case 'm':
            return value * 60 * 1000
        case 'h':
            return value * 60 * 60 * 1000
        case 'd':
            return value * 24 * 60 * 60 * 1000
        default:
            throw new Error('Invalid deadline unit')
    }
}

async function login(username: string, password: string): Promise<string> {

    const res = await fetch(URL_LOGIN, {
        headers: {
            cookie: 'kurzname=info; darkmodeAutoStatus=off; timezone=Europe/Berlin; consentUUID=848f3895-8c5b-49d7-849b-9e5d1b3c653d; SESSION=YzhjZGVmZjQtMGUzZi00MWI5LWI2Y2EtNzRhNWI3NTZjNmFm',
        },
        referrer: 'https://www.kicktipp.de/info/profil/login',
        body: new URLSearchParams({
            kennung: username,
            passwort: password,
        }),
        method: 'POST',
        redirect: 'follow',
    })

    if (!res.ok) {
        console.error(res)
        throw new Error('Login Failed!')
    }

    const cookies = res.headers.get('set-cookie')
    if (!cookies) throw new Error('Login failed')
    const match = cookies.match(/login=([^;]+)/)
    if (!match) throw new Error('No login cookie found')
    return match[1]
}

async function getCommunities(token: string): Promise<string[]> {
    const res = await fetch(URL_BASE + '/info/profil/meinetipprunden', {
        headers: { cookie: `SESSION=${token}; login=${token}` },
    })
    const html = await res.text()
    const $ = cheerio.load(html)
    const links = $('#kicktipp-content a')
    const result: string[] = []
    links.each((_, el) => {
        const href = $(el).attr('href')
        if (href && href.startsWith('/')) {
            result.push(href.replace(/\//g, ''))
        }
    })
    return result
}

async function parseMatchRows(
    token: string,
    community: string,
    matchday?: number,
): Promise<Match[]> {
    let url = `${URL_BASE}/${community}/tippabgabe`
    if (matchday) {
        url += `?&spieltagIndex=${matchday}`
    }

    const res = await fetch(url, { headers: { cookie: `login=${token}` } })
    const html = await res.text()
    const $ = cheerio.load(html)

    const rows = $('tbody tr')
    const matches: Match[] = []

    rows.each((_, row) => {
        const tds = $(row).find('td')
        if (tds.length < 5) return

        const dateStr = $(tds[0]).text()
        const home = $(tds[1]).text()
        const away = $(tds[2]).text()
        const odds = $(tds[4])
            .text()
            // removing the start of the string
            .slice('Quote: '.length)
            .split('/')
            .map((s) => s.trim())

        if (odds.length === 3) {
            if (dateStr.trim().length === 0) {
                // console.info('Unknown Date for Game: ', home, away)
            } else {
                matches.push(new Match(home, away, dateStr, odds[0], odds[1], odds[2]))
            }
        }
    })

    return matches
}

async function placeBets(
    token: string,
    communities: string[],
    predictor: any,
    override = false,
    deadline?: string,
    dryRun = false,
    matchday?: number,
) {
    for (const com of communities.filter(c => !c.startsWith('info'))) {
        console.log(`Community: ${com}`)
        const matches = await parseMatchRows(token, com, matchday)

        for (const match of matches) {
            if (deadline) {
                const ms = parseDeadline(deadline)
                const timeToMatch = match.date.getTime() - Date.now()
                if (timeToMatch > ms) {
                    console.log(`${match} - not betting yet, due in ${timeToMatch / 1000}s`)
                    continue
                }
            }

            const [homeBet, awayBet] = predictor.predict(match)
            console.log(`${match} - betting ${homeBet}:${awayBet}`)

            if (!dryRun) {
                // TODO: implement actual POST to submit bets
                console.log(`Submitting bet for ${com}: ${homeBet}:${awayBet}`)
            }
        }
    }
}

// // --- Main ---

if (options.getLoginToken) {
    const username = process.env.KICKTIPP_USERNAME!
    const password = process.env.KICKTIPP_PASSWORD!
    const token = await login(username, password)
    console.log(token)
    process.exit(0)
}

if (options.listPredictors) {
    const predictors = getPredictors()
    Object.keys(predictors).forEach((p) => console.log(p))
    process.exit(0)
}

let token = options.useLoginToken
if (!token) {
    const username = process.env.KICKTIPP_USERNAME!
    const password = process.env.KICKTIPP_PASSWORD!
    token = await login(username, password)
}

let comms = communities
if (comms.length === 0) {
    comms = await getCommunities(token)
}

if (comms.length === 0) {
    console.error('No community found!')
    process.exit(1)
}

const predictors = getPredictors()
const predictorName = options.predictor || 'SimplePredictor'
const PredictorClass = predictors[predictorName]
if (!PredictorClass) {
    console.error(`Unknown predictor: ${predictorName}`)
    process.exit(1)
}
const predictor = new PredictorClass()

await placeBets(
    token,
    comms,
    predictor,
    options.overrideBets,
    options.deadline,
    options.dryRun,
    options.matchday ? parseInt(options.matchday) : undefined,
)

// (async () => {

// })();
