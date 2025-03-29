# Python Sandbox with WASM

This project provides a sandboxed environment for executing Python Plotly code, demonstrating two different approaches:
1. Server-side execution using Pyodide in a headless browser
2. Client-side execution using Pyodide directly in the user's browser

## Quick Start

1. Clone this repository
2. Run with Docker Compose:
```bash
docker-compose up --build
```

## Available Methods

### 1. Server-side Plotting
The server-side method runs Python code in a sandboxed environment and returns SVG plots.

**Usage:**
```bash
python client.py --code "import plotly.graph_objects as go; fig = go.Figure(data=go.Scatter(x=[1,2,3], y=[4,5,6])); fig.update_layout(title='Example')"
```

View the results at [http://localhost:8000](http://localhost:8000)

### 2. Client-side Plotting
The client-side method runs Python code directly in your browser using WebAssembly.

Access the interactive interface at [http://localhost:3000/client-plot](http://localhost:3000/client-plot)

## Example Code

Basic scatter plot:
```python
import plotly.graph_objects as go

fig = go.Figure(data=go.Scatter(x=[1, 2, 3], y=[1, 2, 3]))
fig.update_layout(title='Test Plot')
fig.show()
```

Bar chart:
```python
import plotly.graph_objects as go

fig = go.Figure(data=go.Bar(x=["A", "B", "C"], y=[10, 20, 15]))
fig.update_layout(title="Bar Chart Example")
fig.show()
```

## Performance Comparison

Both methods include performance metrics:
- Server-side: Shows load time and refresh intervals
- Client-side: Shows initialization time, execution time, and total time

Key differences:
- Server-side: 
  - Better for batch processing
  - Requires server resources
  - Generates static SVGs
- Client-side:
  - Interactive plotting
  - Runs in user's browser
  - No server processing needed
  - Longer initial load time

## Structure

- `server.js`: Node.js server for sandbox environment
- `client.py`: Python client for server-side execution
- `client_plot.html`: Browser-based client-side execution
- `output/index.html`: Plot viewer for server-side method

## Requirements

- Docker
- Docker Compose

## Security Notes

This sandbox:
- Runs Python code in a WebAssembly environment (Pyodide)
- Uses a headless browser for server-side isolation
- Has no access to the host filesystem
- Can only execute Plotly visualization code
