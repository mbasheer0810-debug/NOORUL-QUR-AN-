import os
import zipfile
import shutil
import subprocess

def create_source_zip():
    print("Packaging NOORUL QURAN complete source code into ZIP...")
    zip_filename = os.path.abspath('public/noorul-quran-source.zip')
    
    # Exclude directories
    exclude_dirs = {
        'node_modules',
        '.git',
        '.aistudio',
        'dist',
        '.cache',
        '.vite'
    }
    
    # Files to ignore
    exclude_files = {
        'noorul-quran-source.zip',
        'noorul-quran-dist.zip'
    }

    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Modify dirs in-place to avoid recursion into excluded dirs
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file in exclude_files:
                    continue
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, '.')
                # Clean prefix
                if rel_path.startswith('./'):
                    rel_path = rel_path[2:]
                
                zipf.write(file_path, arcname=os.path.join('noorul-quran', rel_path))
                
    file_size_kb = os.path.getsize(zip_filename) / 1024
    print(f"Created {zip_filename} ({file_size_kb:.2f} KB)")


def create_dist_zip():
    print("Building production static bundle...")
    subprocess.run(["npm", "run", "build"], check=True)
    
    dist_zip = os.path.abspath('public/noorul-quran-dist.zip')
    print("Packaging dist folder into ZIP for zero-configuration drag-and-drop hosting...")
    with zipfile.ZipFile(dist_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('dist'):
            for file in files:
                if file.endswith('.zip'):
                    continue
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, 'dist')
                zipf.write(file_path, arcname=rel_path)
                
    dist_size_kb = os.path.getsize(dist_zip) / 1024
    print(f"Created {dist_zip} ({dist_size_kb:.2f} KB)")


if __name__ == '__main__':
    os.makedirs('public', exist_ok=True)
    create_source_zip()
    create_dist_zip()
    print("Project export complete!")
