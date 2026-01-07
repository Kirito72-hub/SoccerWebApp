import json
import sys

def calculate_standings_from_matches(league, all_matches):
    """
    Calculate standings from matches for a league
    """
    # Get matches for this league
    league_matches = [m for m in all_matches if m.get('league_id') == league['id'] and m.get('status') == 'completed']
    
    if not league_matches:
        return None, None
    
    # Initialize standings
    standings = {}
    for participant_id in league.get('participant_ids', []):
        standings[participant_id] = {
            'userId': participant_id,
            'played': 0,
            'won': 0,
            'drawn': 0,
            'lost': 0,
            'gf': 0,  # goals for
            'ga': 0,  # goals against
            'gd': 0,  # goal difference
            'points': 0
        }
    
    # Process matches
    for match in league_matches:
        home_id = match['home_user_id']
        away_id = match['away_user_id']
        home_score = match.get('home_score', 0) or 0
        away_score = match.get('away_score', 0) or 0
        
        if home_id in standings and away_id in standings:
            # Update played
            standings[home_id]['played'] += 1
            standings[away_id]['played'] += 1
            
            # Update goals
            standings[home_id]['gf'] += home_score
            standings[home_id]['ga'] += away_score
            standings[away_id]['gf'] += away_score
            standings[away_id]['ga'] += home_score
            
            # Update results
            if home_score > away_score:
                standings[home_id]['won'] += 1
                standings[home_id]['points'] += 3
                standings[away_id]['lost'] += 1
            elif home_score < away_score:
                standings[away_id]['won'] += 1
                standings[away_id]['points'] += 3
                standings[home_id]['lost'] += 1
            else:
                standings[home_id]['drawn'] += 1
                standings[away_id]['drawn'] += 1
                standings[home_id]['points'] += 1
                standings[away_id]['points'] += 1
    
    # Calculate goal difference
    for user_id in standings:
        standings[user_id]['gd'] = standings[user_id]['gf'] - standings[user_id]['ga']
    
    # Sort standings by points, then goal difference, then goals for
    sorted_standings = sorted(
        standings.values(),
        key=lambda x: (x['points'], x['gd'], x['gf']),
        reverse=True
    )
    
    # Get champion (first place)
    champion_id = sorted_standings[0]['userId'] if sorted_standings else None
    
    return sorted_standings, champion_id

def add_winner_to_leagues(input_file, output_file):
    """
    Add winner and standings fields to finished leagues
    """
    print(f"Reading backup file: {input_file}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'leagues' not in data:
        print("Error: No 'leagues' key found in backup file")
        return
    
    leagues = data['leagues']
    matches = data.get('matches', [])
    updated_count = 0
    
    print(f"\nProcessing {len(leagues)} leagues with {len(matches)} matches...")
    
    for league in leagues:
        league_id = league.get('id', 'unknown')
        league_name = league.get('name', 'unknown')
        status = league.get('status', 'unknown')
        
        # Only process finished leagues
        if status == 'finished':
            # Calculate standings from matches
            standings, champion_id = calculate_standings_from_matches(league, matches)
            
            if standings and champion_id:
                league['standings'] = standings
                league['winner'] = champion_id
                updated_count += 1
                print(f"✓ League '{league_name}' - Champion: {champion_id} ({standings[0]['points']} pts)")
            else:
                print(f"⚠ League '{league_name}' - No matches found")
                league['winner'] = None
                league['standings'] = []
        else:
            # Running leagues don't have a winner yet
            league['winner'] = None
    
    # Write updated data
    print(f"\nWriting updated backup to: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Done! Updated {updated_count} finished leagues")
    print(f"📄 Output file: {output_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python add_winner_to_backup.py <input_file> [output_file]")
        print("\nExample:")
        print("  python add_winner_to_backup.py backup.json backup_updated.json")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else input_file.replace('.json', '_with_winners.json')
    
    add_winner_to_leagues(input_file, output_file)
