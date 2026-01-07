import json

with open('Backups/leagues-final-import-WITH-WINNERS.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

leagues = data.get('leagues', [])
finished = [l for l in leagues if l.get('status') == 'finished']
with_winner = [l for l in finished if l.get('winner')]

print(f"✅ Total leagues: {len(leagues)}")
print(f"✅ Finished leagues: {len(finished)}")
print(f"✅ Leagues with winner: {len(with_winner)}")
print(f"✅ Success rate: {len(with_winner)}/{len(finished)}")
print("\nSample of first 5 leagues:")
for i, l in enumerate(leagues[:5]):
    name = l.get('name', 'Unknown')[:35]
    winner = l.get('winner', 'None')
    standings_count = len(l.get('standings', []))
    if winner and winner != 'None':
        winner_short = winner[:8] + '...'
    else:
        winner_short = 'None'
    print(f"{i+1}. {name:35} | Winner: {winner_short:12} | Standings: {standings_count} players")
