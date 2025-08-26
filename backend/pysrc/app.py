from flask import Flask, render_template, request, jsonify, send_from_directory
import subprocess
import os
import json
import shutil
from flask_cors import CORS

# Base paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, '..', '..', 'frontend')

template_dir = os.path.join(FRONTEND_DIR, 'templates')
static_dir   = os.path.join(FRONTEND_DIR, 'static')
js_dir       = os.path.join(FRONTEND_DIR, 'js')

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

# Habilita CORS para todas as rotas
CORS(app)

# === Helpers ================================================================

VALID_BITS = {'128', '160', '192', '224', '256'}

def map_lang_to_c_flag(lan: str) -> str:
    """
    Normaliza o parâmetro de linguagem vindo da URL para o que o binário em C espera.
    """
    if not lan:
        return '-en'
    lan = lan.strip().lower()
    if lan in ('en', 'en-us', 'en_us', 'english'):
        return '-en'
    if lan in ('pt', 'pt-br', 'pt_br', 'br', 'portuguese', 'português', 'ptbr'):
        return '-br'
    # fallback seguro
    return '-en'

def ensure_wordlist_files(csrc_dir: str, lang_flag: str):
    """
    Garante que os arquivos de wordlist existam para a linguagem escolhida.
    Corrige automaticamente o caso 'bt.txt' -> 'br.txt' se necessário.
    """
    wordlist_dir = os.path.join(csrc_dir, 'wordlist')
    if lang_flag == '-br':
        br_path = os.path.join(wordlist_dir, 'br.txt')
        bt_path = os.path.join(wordlist_dir, 'bt.txt')
        # Se o correto não existe e só existe bt.txt, cria uma cópia como br.txt
        if not os.path.exists(br_path) and os.path.exists(bt_path):
            try:
                shutil.copyfile(bt_path, br_path)
                print(f"[info] Copiei {bt_path} -> {br_path} para atender '-br'.")
            except Exception as e:
                print(f"[warn] Falha copiando {bt_path} para {br_path}: {e}")

# === Static JS route ========================================================

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(js_dir, filename)

# === Debug prints (úteis durante desenvolvimento) ==========================

print(f"Template directory: {template_dir}")
print(f"Static directory:   {static_dir}")
print(f"JS directory:       {js_dir}")
print(f"Index.html exists:  {os.path.exists(os.path.join(template_dir, 'index.html'))}")
print(f"Style.css exists:   {os.path.exists(os.path.join(static_dir, 'css', 'style.css'))}")
print(f"Script.js exists:   {os.path.exists(os.path.join(js_dir, 'script.js'))}")

# === Routes =================================================================

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate')
def generate_mnemonic():
    try:
        # --- Parâmetros da URL ---
        lan = request.args.get('lan', 'en')
        words = request.args.get('words', '128')
        entropy_json = request.args.get('entropy', '[]')

        
        print(f"[TESTE] Recebi entropy_json do JS:", entropy_json[:200])  # mostra só os 200 primeiros chars


        # Valida bits de entropia
        entropy_bits = words if words in VALID_BITS else '128'

        # Mapeia linguagem para flag do C (-en | -br)
        lang_param = map_lang_to_c_flag(lan)

        # Caminhos do binário e diretório onde ele deve rodar
        csrc_dir = os.path.join(BASE_DIR, '..', 'csrc')
        c_executable = os.path.join(csrc_dir, 'build', 'btc-wallet-c')

        # Pré-checagens
        if not os.path.exists(c_executable):
            return jsonify({'error': f'Executable not found at {c_executable}'}), 500
        if not os.access(c_executable, os.X_OK):
            return jsonify({'error': f'Executable not executable at {c_executable}'}), 500

        # Garante wordlist correta
        ensure_wordlist_files(csrc_dir, lang_param)

        # Log útil
        print(f"[debug] Running: {c_executable} {entropy_bits} {lang_param} <entropy_json...>")
        print(f"[debug] CWD: {csrc_dir}")

        # Executa o binário em C
        result = subprocess.run(
            [c_executable, entropy_bits, lang_param, entropy_json],
            cwd=csrc_dir,
            capture_output=True,
            text=True,
            check=True
        )

        stdout = (result.stdout or '').strip()
        stderr = (result.stderr or '').strip()

        print(f"[debug] returncode={result.returncode}")
        if stderr:
            print(f"[debug] stderr: {stderr}")
        print(f"[debug] stdout: {stdout}")

        if not stdout:
            # Se por algum motivo não veio nada no stdout, sinaliza claramente
            return jsonify({
                'error': 'Mnemonic generation returned empty output',
                'details': 'The C program ran but did not produce output.'
            }), 500

        # Normaliza múltiplos espaços e remove quebras extras
        mnemonic = ' '.join(stdout.split())

        return jsonify({
            'mnemonic': mnemonic,
            'lan': lan,
            'entropy_bits': int(entropy_bits),
            'words_count': len(mnemonic.split())
        })

    except subprocess.CalledProcessError as e:
        # Erros retornados pelo binário em C (exitcode != 0)
        return jsonify({
            'error': 'Error generating mnemonic',
            'stderr': e.stderr,
            'stdout': e.stdout,
            'command': ' '.join(e.cmd) if hasattr(e, 'cmd') else '',
            'return_code': e.returncode
        }), 500
    except Exception as e:
        # Qualquer outro erro Python
        return jsonify({'error': str(e)}), 500

@app.route('/test')
def test():
    return "Flask is working!"

if __name__ == '__main__':
    # Porta 5001 para evitar conflito com algo usando 5000
    app.run(debug=True, port=5001)
