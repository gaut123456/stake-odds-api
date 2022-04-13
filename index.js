import express from 'express';
const app = express();
import { request, GraphQLClient } from 'graphql-request'
const endpoint = "https://api.stake.bet/graphql";
const query = "query SportTournamentFixtureList($sport: String!, $groups: String!, $tournamentLimit: Int = 25, $fixtureCountLimit: Int = 20, $type: SportSearchEnum!) {    slugSport(sport: $sport) {      id      name      templates(group: $groups) {        id        name        extId      }      tournamentList(type: $type, limit: $tournamentLimit) {        ...TournamentTree        fixtureCount(type: $type)        fixtureList(type: $type, limit: $fixtureCountLimit) {          ...FixturePreview          groups(groups: [$groups], status: [active, suspended, deactivated]) {            ...SportGroupTemplates          }        }      }    }  }    fragment TournamentTree on SportTournament {    id    name    slug    category {      ...CategoryTree    }  }    fragment CategoryTree on SportCategory {    id    name    slug    sport {      id      name      slug    }  }    fragment FixturePreview on SportFixture {    id    status    slug    marketCount(status: [active, suspended])    extId    data {      __typename      ...SportFixtureDataMatch      ...SportFixtureDataOutright    }    tournament {      ...TournamentTreeNested    }    eventStatus {      ...SportFixtureEventStatus    }    betradarStream {      exists    }    diceStream {      exists    }    abiosStream {      exists      stream {        id      }    }  }    fragment SportFixtureDataMatch on SportFixtureDataMatch {    startTime    competitors {      ...SportFixtureCompetitor    }    __typename  }    fragment SportFixtureCompetitor on SportFixtureCompetitor {    name    extId    countryCode    abbreviation  }    fragment SportFixtureDataOutright on SportFixtureDataOutright {    name    startTime    endTime    __typename  }    fragment TournamentTreeNested on SportTournament {    id    name    slug    category {      ...CategoryTreeNested    }  }    fragment CategoryTreeNested on SportCategory {    id    name    slug    sport {      id      name      slug    }  }    fragment SportFixtureEventStatus on SportFixtureEventStatus {    homeScore    awayScore    matchStatus    clock {      matchTime      remainingTime    }    periodScores {      homeScore      awayScore      matchStatus    }    currentServer {      extId    }    homeGameScore    awayGameScore    statistic {      yellowCards {        away        home      }      redCards {        away        home      }      corners {        home        away      }    }  }    fragment SportGroupTemplates on SportGroup {    ...SportGroup    templates(limit: 3, includeEmpty: true) {      ...SportGroupTemplate      markets(limit: 1) {        ...SportMarket        outcomes {          ...SportMarketOutcome        }      }    }  }    fragment SportGroup on SportGroup {    name    translation    rank  }    fragment SportGroupTemplate on SportGroupTemplate {    extId    rank    name  }    fragment SportMarket on SportMarket {    id    name    status    extId    specifiers    customBetAvailable  }    fragment SportMarketOutcome on SportMarketOutcome {    active    id    odds    name    customBetAvailable  }"
const sports = "query SportListMenu($type: SportSearchEnum!, $limit: Int = 50, $offset: Int = 0, $liveRank: Boolean = false) {    sportList(type: $type, limit: $limit, offset: $offset, liveRank: $liveRank) {      id      name      slug      fixtureCount(type: $type)      allGroups {        name        translation        rank        id      }    }  }"
let variables = {
    "groups": "winner",
    "sport": null,
    "type": "live",
    "offset": 0,
    "tournamentLimit": 20,
    "fixtureCountLimit": 20
}
const sport = null;

app.get('/', function (req, res) {
    res.json({ apiStatus: "working" })
})

app.get(`/sports`, function (req, res) {

    request(endpoint, sports, variables).then((data) => {
        let sportList = [];
        data.sportList.forEach(element => {
            sportList.push(element.name.replace(/\s/g, '-').toLowerCase());
        });
        res.json(sportList);
    })
})

app.get(`/live`, function (req, res) {
    res.status(404);
    res.send("please specify a sport");
})

app.get('/live/:sport/:numberOfMaxGame/:numberOfMaxTournament', function (req, res) {
    variables.type = "live";
    let numberOfMaxGame = req.params.numberOfMaxGame.replace(':', '')
    variables.fixtureCountLimit = Number(numberOfMaxGame);
    let numberOfMaxTournament = req.params.numberOfMaxGame.replace(':', '')
    variables.tournamentLimit = Number(numberOfMaxTournament);
    variables.sport = req.params.sport.replace(':', '').toLowerCase();
    console.log(variables)
    request(endpoint, query, variables).then((data) => {
        res.json(data)
    })
})

app.get(`/upcoming`, function (req, res) {
    res.status(404);
    res.send("please specify a sport");
})

app.get(`/upcoming/:sport/:numberOfMaxGame/:numberOfMaxTournament`, function (req, res) {
    variables.type = "upcoming";
    variables.sport = req.params.sport.replace(':', '').toLowerCase();
    let numberOfMaxGame = req.params.numberOfMaxGame.replace(':', '')
    variables.fixtureCountLimit = Number(numberOfMaxGame);
    let numberOfMaxTournament = req.params.numberOfMaxGame.replace(':', '')
    variables.tournamentLimit = Number(numberOfMaxTournament);
    console.log(variables)
    request(endpoint, query, variables).then((data) => {
        res.json(data)
    })
})


app.listen(4000);