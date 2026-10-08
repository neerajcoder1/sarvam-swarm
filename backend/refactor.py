import os
import re

MAIN_FILE = 'main.py'

with open(MAIN_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract SYSTEM_PROMPT
prompt_match = re.search(r'SYSTEM_PROMPT = """(.*?)"""', content, re.DOTALL)
if prompt_match:
    with open('prompts.py', 'w', encoding='utf-8') as f:
        f.write(f'SYSTEM_PROMPT = """{prompt_match.group(1)}"""\n')
    # Replace in main.py
    content = content.replace(prompt_match.group(0), 'from prompts import SYSTEM_PROMPT')

# 2. Extract Schemas
# We just grab all classes that inherit from BaseModel
schema_block = re.search(r'# ==========================================\n# API MODELS.*?(?=# ==========================================)', content, re.DOTALL)
if schema_block:
    with open('schemas.py', 'w', encoding='utf-8') as f:
        f.write('from pydantic import BaseModel, Field\nfrom typing import List, Optional, Dict, Any\n\n')
        f.write(schema_block.group(0))
    
    content = content.replace(schema_block.group(0), 'from schemas import *\n\n')

# Save updated main.py
with open(MAIN_FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactor successful!")
