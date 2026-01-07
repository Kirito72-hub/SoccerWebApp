import json

with open('Backups/rakla_export_FINAL.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

leagues = data.get('leagues', [])
finished = [l for l in leagues if l.get('status') == 'finished']
with_winner = [l for l in finished if l.get('winner')]

print(f"Total leagues: {len(leagues)}")
print(f"Finished leagues: {len(finished)}")
print(f"Leagues with winner: {len(with_winner)}")

if finished:
    print("\nFirst finished league:")
    print(f"  Name: {finished[0].get('name')}")
    print(f"  Status: {finished[0].get('status')}")
    print(f"  Winner: {finished[0].get('winner')}")
    if finished[0].get('standings'):
        print(f"  Standings entries: {len(finished[0]['standings'])}")
        print(f"  Champion (from standings): {finished[0]['standings'][0].get('userId')}")
        print(f"  Champion points: {finished[0]['standings'][0].get('points')}")
