#!/usr/bin/env python3
# Copyright (c) 2025 Group 2
# All rights reserved.
# 
# This project and its source code are the property of Group 2:
# - Aryan Tapkire
# - Dilip Irala Narasimhareddy
# - Sachi Vyas
# - Supraj Gijre

"""
Script to add copyright headers to all source code files in proj2.
"""
import os
import re
from pathlib import Path

COPYRIGHT_PYTHON = """# Copyright (c) 2025 Group 2
# All rights reserved.
# 
# This project and its source code are the property of Group 2:
# - Aryan Tapkire
# - Dilip Irala Narasimhareddy
# - Sachi Vyas
# - Supraj Gijre

"""

COPYRIGHT_TS = """/**
 * Copyright (c) 2025 Group 2
 * All rights reserved.
 * 
 * This project and its source code are the property of Group 2:
 * - Aryan Tapkire
 * - Dilip Irala Narasimhareddy
 * - Sachi Vyas
 * - Supraj Gijre
 */

"""

def has_copyright(content: str) -> bool:
    """Check if file already has copyright header."""
    return "Copyright (c) 2025 Group 2" in content

def add_copyright_to_file(file_path: Path):
    """Add copyright header to a file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if has_copyright(content):
            print(f"  ✓ Already has copyright: {file_path}")
            return
        
        # Determine copyright format based on file extension
        if file_path.suffix == '.py':
            copyright_text = COPYRIGHT_PYTHON
            # Handle shebang
            if content.startswith('#!'):
                lines = content.split('\n', 1)
                if len(lines) > 1:
                    new_content = lines[0] + '\n' + copyright_text + lines[1]
                else:
                    new_content = lines[0] + '\n' + copyright_text
            else:
                new_content = copyright_text + content
        elif file_path.suffix in ['.ts', '.tsx', '.js', '.jsx']:
            copyright_text = COPYRIGHT_TS
            # Handle shebang
            if content.startswith('#!'):
                lines = content.split('\n', 1)
                new_content = lines[0] + '\n' + copyright_text + (lines[1] if len(lines) > 1 else '')
            # Handle reference directives (like /// <reference types="vitest" />)
            elif content.startswith('///'):
                lines = content.split('\n', 1)
                new_content = lines[0] + '\n' + copyright_text + (lines[1] if len(lines) > 1 else '')
            else:
                new_content = copyright_text + content
        elif file_path.suffix in ['.md', '.html']:
            copyright_text = """<!--
Copyright (c) 2025 Group 2
All rights reserved.

This project and its source code are the property of Group 2:
- Aryan Tapkire
- Dilip Irala Narasimhareddy
- Sachi Vyas
- Supraj Gijre
-->

"""
            new_content = copyright_text + content
        else:
            print(f"  ⚠ Unknown file type: {file_path}")
            return
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"  ✓ Added copyright: {file_path}")
    except Exception as e:
        print(f"  ✗ Error processing {file_path}: {e}")

def main():
    """Main function to process all source files."""
    base_dir = Path(__file__).parent
    
    # Find all source files
    python_files = list(base_dir.rglob('*.py'))
    ts_files = list(base_dir.rglob('*.ts'))
    tsx_files = list(base_dir.rglob('*.tsx'))
    js_files = list(base_dir.rglob('*.js'))
    jsx_files = list(base_dir.rglob('*.jsx'))
    
    all_files = python_files + ts_files + tsx_files + js_files + jsx_files
    
    # Exclude this script itself and node_modules, __pycache__, etc.
    all_files = [f for f in all_files 
                 if 'node_modules' not in str(f) 
                 and '__pycache__' not in str(f)
                 and '.venv' not in str(f)
                 and f.name != 'add_copyright.py']
    
    print(f"Found {len(all_files)} source files to process...\n")
    
    for file_path in sorted(all_files):
        add_copyright_to_file(file_path)
    
    print(f"\n✓ Processed {len(all_files)} files")

if __name__ == '__main__':
    main()

