from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from supabase import create_client, Client
from datetime import datetime
import logging

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
            'nome1': data.get('nome1', ''),
            'nome2': data.get('nome2', ''),
            'nome3': data.get('nome3', ''),
            'nusp1': data.get('nusp1', ''),
            'nusp2': data.get('nusp2', ''),
            'nusp3': data.get('nusp3', ''),
            'celular': data.get('celular', ''),
            'email': data.get('email', '')
        }

        try:
            result = supabase.table('hackathon_inscricoes').insert(payload).execute()
            if result.data:
                return jsonify({'success': True, 'message': 'Inscrição do hackathon enviada com sucesso!', 'id': result.data[0]['id']}), 200
            return jsonify({'success': False, 'message': 'Erro ao salvar dados'}), 500
        except Exception as e:
            logger.error(f"Hackathon Supabase error: {e}")
            return jsonify({'success': False, 'message': 'Erro ao salvar dados no banco'}), 500
    except Exception as e:
        logger.error(f"General error in submit_hackathon: {e}")
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

if __name__ == '__main__':
    # Create table on startup
    if create_table_if_not_exists():
        logger.info("Database setup completed successfully")
    else:
        logger.error("Failed to setup database")
    
    # Run the app
    app.run(debug=True, host='127.0.0.1', port=5000)