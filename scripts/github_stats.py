"""Write the GitHub activity summary the website renders as stat tiles.

Run by .github/workflows/metrics.yml and published to the `output` branch as
github-stats.json; app/lib/github.ts validates and renders it. Counts include
private contributions when the token can see them (the README cards do too).

    GITHUB_TOKEN=... python3 scripts/github_stats.py <login> <out.json>
"""

from __future__ import annotations

import json
import os
import sys
import urllib.request
from datetime import datetime, timezone

GRAPHQL_URL = "https://api.github.com/graphql"

PROFILE_QUERY = """
query($login: String!) {
  user(login: $login) {
    createdAt
    followers { totalCount }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      totalIssueContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
    merged: pullRequests(states: MERGED) { totalCount }
    open: pullRequests(states: OPEN) { totalCount }
    closed: pullRequests(states: CLOSED) { totalCount }
  }
}
"""

REPOS_QUERY = """
query($login: String!, $cursor: String) {
  user(login: $login) {
    repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, first: 100, after: $cursor) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes { stargazerCount forkCount }
    }
  }
}
"""


def graphql(token: str, query: str, variables: dict) -> dict:
    request = urllib.request.Request(
        GRAPHQL_URL,
        data=json.dumps({"query": query, "variables": variables}).encode(),
        headers={
            "Authorization": f"bearer {token}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        payload = json.load(response)
    if payload.get("errors"):
        raise RuntimeError(f"GraphQL errors: {payload['errors']}")
    if not payload.get("data", {}).get("user"):
        raise RuntimeError(f"user {variables['login']!r} not found")
    return payload["data"]["user"]


def streaks(daily_counts: list[int]) -> tuple[int, int]:
    """Return (current, longest) runs of days with at least one contribution.

    The last entry is today, which may still be in progress, so a zero there
    does not end the current streak.
    """
    longest = run = 0
    for count in daily_counts:
        run = run + 1 if count > 0 else 0
        longest = max(longest, run)

    days = daily_counts[:-1] if daily_counts and daily_counts[-1] == 0 else daily_counts
    current = 0
    for count in reversed(days):
        if count == 0:
            break
        current += 1
    return current, longest


def collect(token: str, login: str) -> dict:
    user = graphql(token, PROFILE_QUERY, {"login": login})
    contributions = user["contributionsCollection"]
    calendar = contributions["contributionCalendar"]
    days = sorted(
        (day for week in calendar["weeks"] for day in week["contributionDays"]),
        key=lambda day: day["date"],
    )
    current, longest = streaks([day["contributionCount"] for day in days])

    public = stars = forks = 0
    cursor = None
    while True:
        repos = graphql(token, REPOS_QUERY, {"login": login, "cursor": cursor})[
            "repositories"
        ]
        public = repos["totalCount"]
        stars += sum(node["stargazerCount"] for node in repos["nodes"])
        forks += sum(node["forkCount"] for node in repos["nodes"])
        if not repos["pageInfo"]["hasNextPage"]:
            break
        cursor = repos["pageInfo"]["endCursor"]

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "memberSince": int(user["createdAt"][:4]),
        "lastYear": {
            "contributions": calendar["totalContributions"],
            "commits": contributions["totalCommitContributions"],
            "pullRequests": contributions["totalPullRequestContributions"],
            "reviews": contributions["totalPullRequestReviewContributions"],
            "issues": contributions["totalIssueContributions"],
            "privateContributions": contributions["restrictedContributionsCount"],
        },
        "streak": {"current": current, "longest": longest},
        "pullRequests": {
            "merged": user["merged"]["totalCount"],
            "open": user["open"]["totalCount"],
            "closed": user["closed"]["totalCount"],
        },
        "repositories": {"public": public, "stars": stars, "forks": forks},
        "followers": user["followers"]["totalCount"],
    }


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print(__doc__, file=sys.stderr)
        return 2
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("GITHUB_TOKEN is not set", file=sys.stderr)
        return 2
    login, out_path = argv[1], argv[2]
    stats = collect(token, login)
    with open(out_path, "w", encoding="utf-8") as handle:
        json.dump(stats, handle, indent=2)
        handle.write("\n")
    print(json.dumps(stats, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
