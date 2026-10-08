with open("frontend/src/App.jsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Add About import
content = content.replace("import Auth from './pages/Auth'", "import Auth from './pages/Auth'\nimport About from './pages/About'")

# Add Route
about_route = """        <Route path="/about" element={
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        } />"""

content = re.sub(r'<Route path="\*"', about_route + '\n        <Route path="*"', content)

with open("frontend/src/App.jsx", "w", encoding="utf-8") as f:
    f.write(content)
