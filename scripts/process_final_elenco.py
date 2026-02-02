import csv
import json
import requests
from io import StringIO

def process_csv_content(csv_text):
    f = StringIO(csv_text)
    reader = csv.DictReader(f)
    players = []
    for row in reader:
        # Mapeamento baseado na nova estrutura da planilha do Guarani
        player = {
            "Numero": "-", # Não encontrado na nova planilha
            "Jogador": row.get('Jogador', ''),
            "Nacionalidade": row.get('País de nacionalidade', row.get('Naturalidade', 'BRA')),
            "Altura": row.get('Altura', '-'),
            "Idade": row.get('Idade', '-'),
            "Posicao": row.get('Posição', ''),
            "Partidas": row.get('Partidas jogadas', '0'),
            "Gols": row.get('Golos', '0'),
            "Assistências": row.get('Assistências', '0'),
            "Acoes_Sucesso": row.get('Acções atacantes com sucesso/90', '0'),
            "Passes_Precisos": row.get('Passes certos, %', '0%'),
            "Dribles": row.get('Dribles/90', '0'),
            "Desafios": row.get('Duelos ganhos, %', '0%'),
            "Minutos": row.get('Minutos jogados:', '0')
        }
        if player["Jogador"]:
            players.append(player)
    return players

def main():
    url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSu0rUb4GMAXickMiLWQZwHsPZlmdL3Vcsx82HGZYL7fuAfIgDXyYFdH3OmNqGElyh76eO851z0bIgF/pub?output=csv"
    print(f"Baixando dados do elenco de: {url}")
    response = requests.get(url)
    if response.status_code == 200:
        players = process_csv_content(response.text)
        
        output_path = './app/plantel/dados_elenco.js'
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("export const elencoReal = " + json.dumps(players, indent=2, ensure_ascii=False) + ";")
        
        print(f"Sucesso! {len(players)} jogadores processados e salvos em {output_path}")
    else:
        print(f"Erro ao baixar CSV: {response.status_code}")

if __name__ == "__main__":
    main()
