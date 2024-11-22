import requests
from pathlib import Path
import urllib.parse
import argparse
import os

class SandboxedExecutor:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url.rstrip('/')
        
    def execute(self, code: str) -> dict:
        try:
            response = requests.post(
                f"{self.base_url}/execute",
                json={"code": code},
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {str(e)}")
            raise
            
    def save_svg(self, svg_content: str, output_path: str):
        cwd = Path(os.getcwd())
        output_dir = cwd / 'output'
        output_dir.mkdir(exist_ok=True)
        
        if svg_content.startswith('data:image/svg+xml,'):
            svg_content = urllib.parse.unquote(svg_content.replace('data:image/svg+xml,', ''))
        
        output_path = output_dir / Path(output_path).name
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(svg_content)

def read_code_file(file_path):
    with open(file_path, 'r') as f:
        return f.read()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Execute Plotly code in sandbox')
    parser.add_argument('--file', type=str, help='Path to Python file with Plotly code')
    parser.add_argument('--code', type=str, help='Plotly code as string')
    args = parser.parse_args()

    # Default example code
    test_code = """
fig = go.Figure(data=go.Scatter(x=[1, 2, 3], y=[1, 2, 3]))
fig.update_layout(title='Test Plot')
"""
    
    # Use provided code if any
    if args.file:
        test_code = read_code_file(args.file)
    elif args.code:
        test_code = args.code
    
    executor = SandboxedExecutor()
    result = executor.execute(test_code)
    
    if 'svg' in result:
        executor.save_svg(result['svg'], 'test_plot.svg')
        print("Plot saved as test_plot.svg")