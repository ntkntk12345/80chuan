import json
for folder in ('districts', 'districts_full', 'districts_summary', 'districts_ok'):
    if folder == 'districts':
        paths = ['processed/districts/hoangmai.json', 'processed/districts/hoangmai1.json']
    else:
        paths = [f'processed/{folder}/hoangmai.json']
    for path in paths:
        try:
            data = json.load(open(path, 'r', encoding='utf-8'))
            match = [d for d in data if d.get('id') == '1782116985000']
            if match:
                print(f'{path}: matches={len(match)} | photos={len(match[0].get("photos", []))}')
            else:
                print(f'{path}: not found')
        except Exception as e:
            print(f'{path}: error={e}')
