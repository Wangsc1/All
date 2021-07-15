name: hyzaw-sync
on:
  schedule:
    - cron: '1 */3 * * *'
  workflow_dispatch:
  watch:
    types: started
  repository_dispatch:
    types: sync- hyzaw-JavaScript
jobs:
  repo-sync:
    env:
      PAT: ${{ secrets.PAT }} 
    runs-on: ubuntu-latest
    if: github.event.repository.owner.id == github.event.sender.id
    steps:
      - uses: actions/checkout@v2
        with:
          persist-credentials: false

      - name: sync  hyzaw-JavaScript
        uses: repo-sync/github-sync@v2
        if: env.PAT
        with:
          source_repo: "https://github.com/hyzaw/scripts.git"
          source_branch: "main"
          destination_branch: "hyzaw"
          github_token: ${{ secrets.PAT }}
