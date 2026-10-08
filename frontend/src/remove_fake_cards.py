with open("frontend/src/pages/Dashboard.jsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Remove the entire Right Column from Dashboard.jsx
content = re.sub(
    r'{/\*\s*Right Column:\s*Prediction \+ Memory Cards\s*\*/}.*?</div>\s*</div>\s*</motion\.div>',
    r'</motion.div>',
    content,
    flags=re.DOTALL
)

with open("frontend/src/pages/Dashboard.jsx", "w", encoding="utf-8") as f:
    f.write(content)
