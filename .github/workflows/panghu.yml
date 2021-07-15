name: panghu-sync
on:
  schedule:
    - cron: '1 */3 * * *'
  workflow_dispatch:
  watch:
    types: started
  repository_dispatch:
    types: sync-panghu-JavaScript
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

      - name: sync panghu-JavaScript
        uses: repo-sync/github-sync@v2
        if: env.PAT
        with:
          source_repo: "https://github.com/panghu999/panghu.git"
          source_branch: "master"
          destination_branch: "Panghu"
          github_token: ${{ secrets.PAT }}
      # Runs a single command using the runners shell
      - name: Run a one-line script
        run: echo Hello, world!

      # Runs a set of commands using the runners shell
      - name: Run a multi-line script
        run: |
          echo Add other actions to build,
          echo test, and deploy your project.
