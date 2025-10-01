from flask import Flask, request, jsonify, send_from_directory, send_file, abort
from flask_cors import CORS
from dotenv import load_dotenv
import os
from supabase import create_client, Client
from datetime import datetime
import logging
import re

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from the frontend

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supabase connection
SUPABASE_URL = os.getenv('SUPABASE_URL')
# Prefer service role key on the server (bypasses RLS); fallback to anon key if not provided
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')


def sanitize_text(value: str, max_length: int = 200) -> str:
    """Trim and limit plain text fields."""
    if not isinstance(value, str):
        return ''
    return value.strip()[:max_length]


def sanitize_digits(value: str, max_length: int = 25) -> str:
    """Keep only digits from strings such as phone numbers or matriculation IDs."""
    if not isinstance(value, str):
        return ''
    digits = re.sub(r'\D+', '', value)
    return digits[:max_length]


def format_supabase_error(error: Exception):
    """Provide user-friendly errors while preserving technical context for debugging."""
    error_str = str(error)
    lowered = error_str.lower()

    if 'duplicate key value violates unique constraint' in lowered:
        return 409, 'Este telefone já possui uma inscrição registrada.', error_str

    if 'row level security' in lowered:
        return 403, 'Permissão negada para gravar os dados. Verifique as policies do Supabase.', error_str

    if 'invalid input syntax for type' in lowered:
        return 400, 'Algum campo possui formato inválido. Revise os dados digitados e tente novamente.', error_str

    if 'null value in column' in lowered:
        # Tenta destacar a coluna envolvida, se presente
        match = re.search(r'column "([^"]+)"', error_str)
        column = match.group(1) if match else 'desconhecida'
        return 400, f'Campo obrigatório ausente ou vazio: {column}.', error_str

    return 500, 'Erro ao salvar dados no banco', error_str

def get_supabase_client():
    """Get Supabase client"""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        return supabase
    except Exception as e:
        logger.error(f"Supabase client error: {e}")
        return None

def create_table_if_not_exists():
    """Create inscricoes table if it doesn't exist"""
    supabase = get_supabase_client()
    if not supabase:
        return False
    
    try:
        # Test connection by trying to select from the table
        result = supabase.table('inscricoes').select('id').limit(1).execute()
        logger.info("Table 'inscricoes' exists and is accessible")
        return True
    except Exception as e:
        logger.info(f"Table might not exist, will be created: {e}")
        # Table will be created manually in Supabase dashboard
        return True

@app.route('/api/inscricao', methods=['POST'])
def submit_inscricao():
    """Handle form submission"""
    try:
        # Log the incoming request
        logger.info(f"Received inscription request from IP: {request.remote_addr}")
        
        # Get form data
        data = request.form if request.form else request.json
        
        if not data:
            logger.warning("No data received in request")
            return jsonify({
                'success': False, 
                'message': 'Nenhum dado recebido'
            }), 400
        
        # Validate required fields
        required_fields = ['nome', 'email', 'telefone', 'faculdade', 'curso', 'ingresso']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            logger.warning(f"Missing required fields: {missing_fields}")
            return jsonify({
                'success': False,
                'message': f'Campos obrigatórios não preenchidos: {", ".join(missing_fields)}'
            }), 400
        
        # Honeypot check
        if data.get('_hp'):
            logger.warning(f"Spam attempt detected from IP: {request.remote_addr}")
            return jsonify({
                'success': False,
                'message': 'Erro de validação'
            }), 400
        
        # Connect to Supabase
        supabase = get_supabase_client()
        if not supabase:
            logger.error("Failed to connect to Supabase")
            return jsonify({
                'success': False,
                'message': 'Erro de conexão com o banco de dados'
            }), 500
        
        try:
            # Insert data using Supabase client
            inscription_data = {
                'nome': data.get('nome', ''),
                'email': data.get('email', ''),
                'telefone': data.get('telefone', ''),
                'faculdade': data.get('faculdade', ''),
                'nusp': data.get('nusp', ''),
                'curso': data.get('curso', ''),
                'ano_ingresso': int(data.get('ingresso', 0)) if data.get('ingresso') else None,
                'membro_ieee': data.get('membro_ieee', ''),
                'voluntario_ieee': data.get('voluntario_ieee', ''),
                'divulgacao': data.get('divulgacao', ''),
                'indicacao': data.get('indicacao', '')
            }
            
            logger.info(f"Attempting to insert data: {inscription_data}")
            
            result = supabase.table('inscricoes').insert(inscription_data).execute()
            
            if result.data:
                inscription_id = result.data[0]['id']
                logger.info(f"Successfully saved inscription ID: {inscription_id} for {data.get('nome')} ({data.get('email')})")
                
                return jsonify({
                    'success': True,
                    'message': 'Inscrição enviada com sucesso!',
                    'id': inscription_id
                }), 200
            else:
                logger.error("No data returned from insert")
                return jsonify({
                    'success': False,
                    'message': 'Erro ao salvar dados'
                }), 500
                
        except Exception as db_error:
            logger.error(f"Supabase error: {db_error}")
            
            # Check if it's a schema-related error
            error_str = str(db_error)
            if 'schema cache' in error_str or 'column' in error_str or 'PGRST204' in error_str:
                return jsonify({
                    'success': False,
                    'message': 'Erro de schema do banco de dados. Execute fix_supabase_schema.sql no Supabase.',
                    'technical_error': error_str
                }), 500
            else:
                return jsonify({
                    'success': False,
                    'message': 'Erro ao salvar dados no banco',
                    'technical_error': error_str
                }), 500
            
    except Exception as e:
        logger.error(f"General error in submit_inscricao: {e}")
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor'
        }), 500

@app.route('/api/hackathon', methods=['POST'])
def submit_hackathon():
    """Handle hackathon team submission"""
    try:
        logger.info(f"Received hackathon submission from IP: {request.remote_addr}")
        data = request.form if request.form else request.json
        if not data:
            return jsonify({'success': False, 'message': 'Nenhum dado recebido'}), 400

        # Required fields
        required = ['nome1', 'nome2', 'nome3', 'celular', 'email']
        missing = [f for f in required if not data.get(f)]
        if missing:
            return jsonify({'success': False, 'message': f'Campos obrigatórios faltando: {", ".join(missing)}'}), 400

        # Honeypot
        if data.get('_hp'):
            return jsonify({'success': False, 'message': 'Erro de validação'}), 400

        supabase = get_supabase_client()
        if not supabase:
            return jsonify({'success': False, 'message': 'Erro de conexão com o banco'}), 500

        payload = {
            'nome1': sanitize_text(data.get('nome1', ''), 150),
            'nome2': sanitize_text(data.get('nome2', ''), 150),
            'nome3': sanitize_text(data.get('nome3', ''), 150),
            'nusp1': sanitize_text(data.get('nusp1', ''), 30) or None,
            'nusp2': sanitize_text(data.get('nusp2', ''), 30) or None,
            'nusp3': sanitize_text(data.get('nusp3', ''), 30) or None,
            'celular': sanitize_text(data.get('celular', ''), 50),
            'email': sanitize_text(data.get('email', ''), 160)
        }

        try:
            result = supabase.table('hackathon_inscricoes').insert(payload).execute()

            # Biblioteca supabase-py armazena erros em result.error sem levantar exceção
            if hasattr(result, 'error') and result.error:
                status_code, message, error_str = format_supabase_error(result.error)
                logger.error("Erro Supabase hackathon", extra={'status_code': status_code, 'error': error_str})
                return jsonify({'success': False, 'message': message, 'technical_error': error_str}), status_code

            if result.data:
                return jsonify({'success': True, 'message': 'Inscrição do hackathon enviada com sucesso!', 'id': result.data[0]['id']}), 200

            return jsonify({'success': False, 'message': 'Erro ao salvar dados'}), 500
        except Exception as e:
            status_code, message, error_str = format_supabase_error(e)
            logger.error("Hackathon Supabase error", extra={'error': error_str, 'status_code': status_code})
            return jsonify({'success': False, 'message': message, 'technical_error': error_str}), status_code
    except Exception as e:
        logger.error(f"General error in submit_hackathon: {e}")
        return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500

@app.route('/api/minicurso-fibra', methods=['POST'])
def submit_minicurso_fibra():
    """Handle minicurso Fibra Óptica registrations"""
    try:
        logger.info(f"Received minicurso fibra submission from IP: {request.remote_addr}")
        data = request.form if request.form else request.json

        if not data:
            logger.warning("Nenhum dado recebido para minicurso fibra")
            return jsonify({'success': False, 'message': 'Nenhum dado recebido'}), 400

        if data.get('_hp'):
            logger.warning("Tentativa de spam detectada no minicurso fibra")
            return jsonify({'success': False, 'message': 'Erro de validação'}), 400

        nome = sanitize_text(data.get('nome', ''), 150)
        telefone = sanitize_text(data.get('telefone', ''), 50)
        nusp = sanitize_text(data.get('nusp', ''), 30) if data.get('nusp') else None

        if not nome or not telefone:
            logger.warning("Campos obrigatórios faltando no minicurso fibra", extra={'nome': bool(nome), 'telefone': bool(telefone)})
            return jsonify({'success': False, 'message': 'Informe nome completo e telefone.'}), 400

        logger.info(
            "Valid minicurso fibra payload",
            extra={
                'nome': nome[:50],
                'telefone': telefone,
                'nusp': nusp
            }
        )

        supabase = get_supabase_client()
        if not supabase:
            logger.error("Falha ao conectar ao Supabase para minicurso fibra")
            return jsonify({'success': False, 'message': 'Erro de conexão com o banco de dados'}), 500

        payload = {
            'nome': nome,
            'telefone': telefone,
            'nusp': nusp if nusp else None
        }

        try:
            result = supabase.table('minicurso_fibra_inscricoes').insert(payload).execute()

            # Biblioteca supabase-py armazena erros em result.error sem levantar exceção
            if hasattr(result, 'error') and result.error:
                status_code, message, error_str = format_supabase_error(result.error)
                logger.error("Erro Supabase (payload validado) ", extra={'status_code': status_code, 'error': error_str})
                return jsonify({'success': False, 'message': message, 'technical_error': error_str}), status_code

            if result.data:
                registro_id = result.data[0]['id']
                logger.info(f"Inscrição do minicurso fibra salva com ID {registro_id}")
                return jsonify({'success': True, 'message': 'Inscrição registrada com sucesso!', 'id': registro_id}), 200

            logger.error("Nenhum dado retornado na inserção do minicurso fibra", extra={'result': getattr(result, 'data', None)})
            return jsonify({'success': False, 'message': 'Erro ao salvar dados'}), 500
        except Exception as db_error:
            status_code, message, error_str = format_supabase_error(db_error)
            logger.error("Erro Supabase minicurso fibra", extra={'error': error_str, 'status_code': status_code})
            return jsonify({'success': False, 'message': message, 'technical_error': error_str}), status_code

    except Exception as e:
        logger.error(f"Erro geral no minicurso fibra: {e}")
        return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500

@app.route('/api/minicurso-quantica', methods=['POST'])
def submit_minicurso_quantica():
    """Handle minicurso Computação Quântica registrations"""
    try:
        logger.info(f"Received minicurso quântica submission from IP: {request.remote_addr}")
        data = request.form if request.form else request.json

        if not data:
            logger.warning("Nenhum dado recebido para minicurso quântica")
            return jsonify({'success': False, 'message': 'Nenhum dado recebido'}), 400

        if data.get('_hp'):
            logger.warning("Tentativa de spam detectada no minicurso quântica")
            return jsonify({'success': False, 'message': 'Erro de validação'}), 400

        nome = sanitize_text(data.get('nome', ''), 150)
        telefone = sanitize_text(data.get('telefone', ''), 50)
        email = sanitize_text(data.get('email', ''), 160)
        nusp = sanitize_text(data.get('nusp', ''), 30) if data.get('nusp') else None

        if not nome or not telefone or not email:
            logger.warning("Campos obrigatórios faltando no minicurso quântica")
            return jsonify({'success': False, 'message': 'Informe nome completo, telefone e e-mail.'}), 400

        supabase = get_supabase_client()
        if not supabase:
            logger.error("Falha ao conectar ao Supabase para minicurso quântica")
            return jsonify({'success': False, 'message': 'Erro de conexão com o banco de dados'}), 500

        payload = {
            'nome': nome,
            'telefone': telefone,
            'email': email,
            'nusp': nusp if nusp else None
        }

        try:
            result = supabase.table('minicurso_quantica_inscricoes').insert(payload).execute()

            # Biblioteca supabase-py armazena erros em result.error sem levantar exceção
            if hasattr(result, 'error') and result.error:
                status_code, message, error_str = format_supabase_error(result.error)
                logger.error("Erro Supabase minicurso quântica", extra={'status_code': status_code, 'error': error_str})
                return jsonify({'success': False, 'message': message, 'technical_error': error_str}), status_code

            if result.data:
                registro_id = result.data[0]['id']
                logger.info(f"Inscrição do minicurso quântica salva com ID {registro_id}")
                return jsonify({'success': True, 'message': 'Inscrição registrada com sucesso!', 'id': registro_id}), 200

            logger.error("Nenhum dado retornado na inserção do minicurso quântica")
            return jsonify({'success': False, 'message': 'Erro ao salvar dados'}), 500
        except Exception as db_error:
            status_code, message, error_str = format_supabase_error(db_error)
            logger.error("Erro Supabase minicurso quântica", extra={'error': error_str, 'status_code': status_code})
            return jsonify({'success': False, 'message': message, 'technical_error': error_str}), status_code

    except Exception as e:
        logger.error(f"Erro geral no minicurso quântica: {e}")
        return jsonify({'success': False, 'message': 'Erro interno do servidor'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        supabase = get_supabase_client()
        if supabase:
            # Test connection by trying to select from inscricoes table
            try:
                result = supabase.table('inscricoes').select('id').limit(1).execute()
                return jsonify({
                    'status': 'healthy',
                    'database': 'connected'
                }), 200
            except Exception as e:
                return jsonify({
                    'status': 'healthy',
                    'database': 'connected_but_table_missing',
                    'note': 'Execute create_table.sql in Supabase',
                    'error': str(e)
                }), 200
        else:
            return jsonify({
                'status': 'unhealthy',
                'database': 'disconnected'
            }), 500
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/test-schema', methods=['GET'])
def test_schema():
    """Test schema endpoint to check table structure"""
    try:
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({
                'success': False,
                'message': 'Erro de conexão com o Supabase'
            }), 500
        
        # Try to describe the table structure
        try:
            # Test insert with minimal data to check schema
            test_data = {
                'nome': 'TESTE',
                'email': 'teste@teste.com',
                'telefone': '11999999999',
                'faculdade': 'TESTE',
                'curso': 'TESTE',
                'ano_ingresso': 2024
            }
            
            # Try to insert test data (this will reveal schema issues)
            result = supabase.table('inscricoes').insert(test_data).execute()
            
            if result.data:
                # Delete the test record
                supabase.table('inscricoes').delete().eq('email', 'teste@teste.com').execute()
                
                return jsonify({
                    'success': True,
                    'message': 'Schema está funcionando corretamente',
                    'columns_working': list(test_data.keys())
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'message': 'Falha na inserção de teste'
                }), 500
                
        except Exception as schema_error:
            logger.error(f"Schema test error: {schema_error}")
            return jsonify({
                'success': False,
                'message': f'Erro de schema: {str(schema_error)}',
                'suggestion': 'Execute fix_supabase_schema.sql no Supabase'
            }), 500
            
    except Exception as e:
        logger.error(f"Test schema error: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/')
def index():
    """Serve homepage"""
    try:
        return send_file('index.html')
    except Exception:
        return jsonify({
            'success': False,
            'message': 'Arquivo index.html não encontrado'
        }), 404


@app.route('/<path:path>')
def static_proxy(path: str):
    """Serve any static file from project root, but never intercept /api/*"""
    # Never serve API paths here
    if path.startswith('api/'):
        abort(404)

    # Serve existing files directly
    if os.path.isfile(path):
        return send_from_directory('.', path)

    # Convenience: allow routes without .html extension (e.g., /palestrantes)
    if os.path.isfile(f"{path}.html"):
        return send_from_directory('.', f"{path}.html")

    return jsonify({'error': 'Not found'}), 404

if __name__ == '__main__':
    # Create table on startup
    if create_table_if_not_exists():
        logger.info("Database setup completed successfully")
    else:
        logger.error("Failed to setup database")
    
    # Run the app
    app.run(debug=True, host='127.0.0.1', port=5000)