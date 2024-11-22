import express from 'express';
import { chromium } from 'playwright';

const app = express();
app.use(express.json());

// HTML template with Pyodide and Plotly setup
const HTML_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.plot.ly/plotly-2.24.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>
</head>
<body>
    <div id="plot"></div>
    <script>
        async function initPyodide() {
            try {
                console.log('Initializing Pyodide...');
                let pyodide = await loadPyodide();
                console.log('Loading micropip...');
                await pyodide.loadPackage("micropip");
                const micropip = pyodide.pyimport("micropip");
                console.log('Installing plotly...');
                await micropip.install('plotly');
                console.log('Pyodide initialization complete');
                return pyodide;
            } catch (error) {
                console.error('Pyodide initialization error:', error);
                throw error;
            }
        }

        async function executeCode(pyodide, code) {
            try {
                console.log('Executing code:', code);
                await pyodide.runPythonAsync(code);
                console.log('Code execution complete');
                const plotJson = pyodide.globals.get('plotJson');
                console.log('Plot JSON retrieved:', !!plotJson);
                if (plotJson) {
                    await Plotly.newPlot('plot', JSON.parse(plotJson));
                    console.log('Plot rendered');
                }
            } catch (error) {
                console.error('Code execution error:', error);
                throw error;
            }
        }

        window.runCode = async (userCode) => {
            try {
                console.log('Starting code execution process...');
                const pyodide = await initPyodide();
                
                const wrappedCode = [
                    'import plotly.graph_objects as go',
                    'import json',
                    'try:',
                    '    ' + userCode.replace(/\\n/g, '\\n    '),
                    '    if "fig" in locals():',
                    '        plotJson = fig.to_json()',
                    '    else:',
                    '        raise Exception("No \\'fig\\' variable found after code execution")',
                    'except Exception as e:',
                    '    print(f"Python execution error: {str(e)}")',
                    '    raise'
                ].join('\\n');

                await executeCode(pyodide, wrappedCode);
                console.log('Generating SVG...');
                const svg = await Plotly.toImage('plot', {format: 'svg'});
                console.log('SVG generated');
                return svg;
            } catch (error) {
                console.error('runCode error:', error);
                throw error;
            }
        };
    </script>
</body>
</html>`;

let browser;

async function initialize() {
    browser = await chromium.launch({ 
        headless: true
    });
    console.log('Browser initialized');
}

app.get('/client-plot', (req, res) => {
    res.sendFile('client_plot.html', { root: '.' });
});

app.post('/execute', async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).send('No code provided');
    }

    console.log('Received code:', code);
    let page;
    try {
        const context = await browser.newContext({
            javaScriptEnabled: true,
            permissions: []
        });
        
        page = await context.newPage();
        page.on('console', msg => console.log('Browser console:', msg.text()));
        page.on('pageerror', err => console.error('Browser error:', err));
        
        await page.setContent(HTML_TEMPLATE);
        console.log('Page content set');

        const svg = await page.evaluate(async (code) => {
            return await window.runCode(code);
        }, code);
        
        console.log('SVG generated successfully');
        res.send({ svg });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send({
            error: 'Execution failed',
            message: error.message,
            details: error.stack
        });
    } finally {
        if (page) {
            await page.close();
        }
    }
});

const PORT = process.env.PORT || 3000;
initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

process.on('SIGTERM', async () => {
    if (browser) {
        await browser.close();
    }
    process.exit(0);
});